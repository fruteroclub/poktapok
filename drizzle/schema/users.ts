import { pgTable, uuid, varchar, text, timestamp, pgEnum, jsonb, foreignKey, check, index } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { timestamps, softDelete, metadata } from './utils'

// ============================================================
// ENUMS
// ============================================================

/**
 * User role for access control
 */
export const userRoleEnum = pgEnum('user_role', ['member', 'moderator', 'admin'])

/**
 * Account status for user lifecycle management
 */
export const accountStatusEnum = pgEnum('account_status', [
  'pending',      // Applied, waiting for approval
  'active',       // Approved and active
  'suspended',    // Temporarily disabled
  'banned',       // Permanently disabled
])

/**
 * Primary authentication method tracking
 */
export const authMethodEnum = pgEnum('auth_method', [
  'email',    // Email magic link
  'wallet',   // External wallet (MetaMask, Coinbase, etc.)
  'social',   // Social login (Google, GitHub, Discord, etc.)
])

// ============================================================
// TABLE: users (Identity & Authentication)
// ============================================================

/**
 * Core identity table linked to Privy authentication
 *
 * Privy Authentication & Wallet Model:
 * - Email: Always required (collected during onboarding)
 * - External Wallet (ext_wallet): Optional, user's own wallet for auth
 * - Embedded Wallet (app_wallet): Created by Privy after authentication
 * - Auth methods: email, social (Google/GitHub), or wallet
 *
 * Design Decisions:
 * 1. privy_did as source of truth (stable across auth methods)
 * 2. Email always required (NOT NULL)
 * 3. Separate ext_wallet (external) and app_wallet (embedded)
 * 4. Soft deletes for audit trail
 * 5. Separate metadata: privy_metadata (SDK) vs metadata (business logic)
 */
export const users = pgTable(
  'users',
  {
    // Primary Key
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    // Authentication (Privy Integration)
    privyDid: varchar('privy_did', { length: 255 })
      .unique()
      .notNull(),

    // Contact & Identity
    email: varchar('email', { length: 255 })
      .unique()
      .notNull(),

    // Profile Identifiers (Core User Identity)
    username: varchar('username', { length: 50 })
      .unique()
      .notNull(),
    displayName: varchar('display_name', { length: 100 })
      .notNull(),
    bio: text('bio'),                                      // Max 280 characters enforced at app level
    avatarUrl: varchar('avatar_url', { length: 500 }),

    // Wallets
    extWallet: varchar('ext_wallet', { length: 42 }),      // External wallet (optional)
    appWallet: varchar('app_wallet', { length: 42 }),      // Privy embedded wallet (created async)

    // Login Method Tracking
    primaryAuthMethod: authMethodEnum('primary_auth_method')
      .notNull(),

    // Account Management
    role: userRoleEnum('role')
      .default('member')
      .notNull(),

    accountStatus: accountStatusEnum('account_status')
      .default('pending')
      .notNull(),

    // Referral Tracking
    invitedByUserId: uuid('invited_by_user_id'),
    approvedByUserId: uuid('approved_by_user_id'),

    // Timestamps & Audit
    ...timestamps,
    lastLoginAt: timestamp('last_login_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    ...softDelete,

    // Metadata (Separated Concerns)
    privyMetadata: jsonb('privy_metadata')
      .default(sql`'{}'::jsonb`)
      .notNull(),  // Privy SDK data (wallet timestamps, connection info)
    ...metadata,   // Business logic (NFT memberships, feature flags, preferences)
  },
  (table) => ({
    // Foreign Keys (self-referencing for referrals and approvals)
    invitedByFk: foreignKey({
      columns: [table.invitedByUserId],
      foreignColumns: [table.id],
      name: 'users_invited_by_fk',
    }).onDelete('set null'),

    approvedByFk: foreignKey({
      columns: [table.approvedByUserId],
      foreignColumns: [table.id],
      name: 'users_approved_by_fk',
    }).onDelete('set null'),

    // Constraints
    emailFormatCheck: check(
      'email_format',
      sql`${table.email} ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'`
    ),

    usernameFormatCheck: check(
      'username_format',
      sql`${table.username} ~* '^[a-z0-9_]{3,50}$'`
    ),

    extWalletFormatCheck: check(
      'ext_wallet_format',
      sql`${table.extWallet} IS NULL OR ${table.extWallet} ~* '^0x[a-fA-F0-9]{40}$'`
    ),

    appWalletFormatCheck: check(
      'app_wallet_format',
      sql`${table.appWallet} IS NULL OR ${table.appWallet} ~* '^0x[a-fA-F0-9]{40}$'`
    ),

    // Indexes
    privyDidIdx: index('idx_users_privy_did').on(table.privyDid),
    emailIdx: index('idx_users_email').on(table.email),
    usernameIdx: index('idx_users_username').on(table.username),

    // Partial indexes (only index non-null values)
    extWalletIdx: index('idx_users_ext_wallet')
      .on(table.extWallet)
      .where(sql`${table.extWallet} IS NOT NULL`),

    appWalletIdx: index('idx_users_app_wallet')
      .on(table.appWallet)
      .where(sql`${table.appWallet} IS NOT NULL`),

    accountStatusIdx: index('idx_users_account_status').on(table.accountStatus),
    invitedByIdx: index('idx_users_invited_by').on(table.invitedByUserId),

    // Soft delete partial index (only index active users)
    deletedAtIdx: index('idx_users_deleted_at')
      .on(table.deletedAt)
      .where(sql`${table.deletedAt} IS NULL`),

    primaryAuthIdx: index('idx_users_primary_auth').on(table.primaryAuthMethod),
  })
)

// ============================================================
// TYPESCRIPT TYPES
// ============================================================

/**
 * User type (for SELECT queries)
 */
export type User = typeof users.$inferSelect

/**
 * New user type (for INSERT queries)
 */
export type NewUser = typeof users.$inferInsert
