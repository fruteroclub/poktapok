import { pgTable, uuid, varchar, real, integer, pgEnum, foreignKey, check, index } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { timestamps, softDelete, metadata, PATTERNS } from './utils'
import { users } from './users'

// ============================================================
// ENUMS
// ============================================================

/**
 * User visibility in member directory
 */
export const profileVisibilityEnum = pgEnum('profile_visibility', [
  'public',     // Visible to everyone
  'members',    // Visible to authenticated members only
  'private',    // Hidden from directory
])

/**
 * Availability status for bounties
 */
export const availabilityStatusEnum = pgEnum('availability_status', [
  'available',       // Actively looking for work
  'open_to_offers',  // Not actively searching but open
  'unavailable',     // Not interested in new work
])

/**
 * Learning track selection (3 core tracks)
 */
export const learningTrackEnum = pgEnum('learning_track', [
  'ai',       // Artificial Intelligence & Machine Learning
  'crypto',   // Blockchain & Cryptocurrency
  'privacy',  // Privacy & Security
])

// ============================================================
// TABLE: profiles (Extended User Data)
// ============================================================

/**
 * Extended user profile information separated from core identity table
 *
 * Design Decisions:
 * 1. 1:1 relationship with users table (CASCADE DELETE)
 * 2. All fields nullable (progressive profile completion)
 * 3. Stats tracked for directory sorting/filtering
 * 4. Social links stored as separate fields (not JSONB)
 * 5. Learning tracks as array for multi-selection
 * 6. Location data separated (city, country, countryCode)
 */
export const profiles = pgTable(
  'profiles',
  {
    // Primary Key
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    // Foreign Key to users (1:1)
    userId: uuid('user_id')
      .unique()
      .notNull(),

    // Location
    city: varchar('city', { length: 100 }),
    country: varchar('country', { length: 100 }),
    countryCode: varchar('country_code', { length: 2 }),  // ISO 3166-1 alpha-2

    // Social Links
    githubUrl: varchar('github_url', { length: 500 }),
    twitterUrl: varchar('twitter_url', { length: 500 }),
    linkedinUrl: varchar('linkedin_url', { length: 500 }),
    telegramHandle: varchar('telegram_handle', { length: 100 }),

    // Learning & Skills (3 core tracks: AI, Crypto, Privacy)
    learningTracks: learningTrackEnum('learning_tracks').array(),

    // Privacy Settings
    profileVisibility: profileVisibilityEnum('profile_visibility')
      .default('public')
      .notNull(),

    availabilityStatus: availabilityStatusEnum('availability_status')
      .default('available')
      .notNull(),

    // Statistics (Denormalized for Performance)
    completedBounties: integer('completed_bounties')
      .default(0)
      .notNull(),

    totalEarningsUsd: real('total_earnings_usd')
      .default(0)
      .notNull(),

    profileViews: integer('profile_views')
      .default(0)
      .notNull(),

    // Timestamps & Audit
    ...timestamps,
    ...softDelete,

    // Metadata
    ...metadata,  // Feature flags, extended preferences, etc.
  },
  (table) => ({
    // Foreign Key
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'profiles_user_fk',
    }).onDelete('cascade'),

    // Constraints
    countryCodeFormatCheck: check(
      'country_code_format',
      sql`${table.countryCode} IS NULL OR ${table.countryCode} ~* ${PATTERNS.COUNTRY_CODE}`
    ),

    completedBountiesPositiveCheck: check(
      'completed_bounties_positive',
      sql`${table.completedBounties} >= 0`
    ),

    totalEarningsPositiveCheck: check(
      'total_earnings_positive',
      sql`${table.totalEarningsUsd} >= 0`
    ),

    profileViewsPositiveCheck: check(
      'profile_views_positive',
      sql`${table.profileViews} >= 0`
    ),

    // Indexes
    userIdIdx: index('idx_profiles_user_id').on(table.userId),
    countryCodeIdx: index('idx_profiles_country_code').on(table.countryCode),

    // Composite index for directory filtering
    visibilityAvailabilityIdx: index('idx_profiles_visibility_availability')
      .on(table.profileVisibility, table.availabilityStatus),

    // Partial index for active profiles only
    deletedAtIdx: index('idx_profiles_deleted_at')
      .on(table.deletedAt)
      .where(sql`${table.deletedAt} IS NULL`),

    // Stats indexes for sorting
    completedBountiesIdx: index('idx_profiles_completed_bounties').on(table.completedBounties),
    totalEarningsIdx: index('idx_profiles_total_earnings').on(table.totalEarningsUsd),
  })
)

// ============================================================
// TYPESCRIPT TYPES
// ============================================================

/**
 * Profile type (for SELECT queries)
 */
export type Profile = typeof profiles.$inferSelect

/**
 * New profile type (for INSERT queries)
 */
export type NewProfile = typeof profiles.$inferInsert
