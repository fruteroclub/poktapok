import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  foreignKey,
  index,
  check,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { timestamps, metadata } from './utils'
import { users } from './users'

// ============================================================
// TABLE: invitations (Referral System)
// ============================================================

/**
 * Tracks invitation codes with expiration and redemption status
 *
 * Design Decisions:
 * 1. Generated status column (computed from redeemed_at and expires_at)
 * 2. No soft delete (permanent audit record)
 * 3. Unique invite code for sharing
 * 4. Foreign key to inviter (CASCADE DELETE removes orphaned invites)
 * 5. Tracks redeemer for viral growth metrics
 */
export const invitations = pgTable(
  'invitations',
  {
    // Primary Key
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    // Inviter (who created the invite)
    inviterUserId: uuid('inviter_user_id').notNull(),

    // Redeemer (who used the invite)
    redeemerUserId: uuid('redeemer_user_id'),

    // Invitation Details
    inviteCode: varchar('invite_code', { length: 32 }).unique().notNull(), // URL-safe random string

    // Status Tracking
    redeemedAt: timestamp('redeemed_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),

    // Status field
    // Note: Originally designed as generated column, but PostgreSQL doesn't support
    // time-based generated columns (NOW()/CURRENT_TIMESTAMP are not immutable).
    // Status is computed at query time or updated via triggers:
    // 'pending': Not redeemed and not expired
    // 'redeemed': Has redeemed_at timestamp
    // 'expired': Past expires_at and not redeemed
    status: varchar('status', { length: 20 }).default('pending').notNull(),

    // Timestamps & Audit
    ...timestamps,

    // Metadata
    ...metadata, // Campaign tracking, invite source, etc.
  },
  (table) => ({
    // Foreign Keys
    inviterFk: foreignKey({
      columns: [table.inviterUserId],
      foreignColumns: [users.id],
      name: 'invitations_inviter_fk',
    }).onDelete('cascade'),

    redeemerFk: foreignKey({
      columns: [table.redeemerUserId],
      foreignColumns: [users.id],
      name: 'invitations_redeemer_fk',
    }).onDelete('set null'),

    // Constraints
    inviteCodeFormatCheck: check(
      'invite_code_format',
      sql`${table.inviteCode} ~* '^[A-Za-z0-9_-]{16,32}$'`,
    ),

    // Indexes
    inviterUserIdIdx: index('idx_invitations_inviter').on(table.inviterUserId),
    redeemerUserIdIdx: index('idx_invitations_redeemer').on(
      table.redeemerUserId,
    ),
    inviteCodeIdx: index('idx_invitations_code').on(table.inviteCode),

    // Generated status index for filtering
    statusIdx: index('idx_invitations_status').on(table.status),

    // Partial index for active invites only
    pendingInvitesIdx: index('idx_invitations_pending')
      .on(table.inviterUserId, table.status)
      .where(sql`${table.status} = 'pending'`),
  }),
)

// ============================================================
// TYPESCRIPT TYPES
// ============================================================

/**
 * Invitation type (for SELECT queries)
 */
export type Invitation = typeof invitations.$inferSelect

/**
 * New invitation type (for INSERT queries)
 */
export type NewInvitation = typeof invitations.$inferInsert
