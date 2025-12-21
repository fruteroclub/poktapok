import { pgTable, uuid, text, timestamp, pgEnum, foreignKey, index } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { timestamps, metadata } from './utils'
import { users } from './users'

// ============================================================
// ENUMS
// ============================================================

/**
 * Application review status
 */
export const applicationStatusEnum = pgEnum('application_status', [
  'pending',   // Awaiting admin review
  'approved',  // Approved by admin (user becomes active)
  'rejected',  // Rejected by admin
])

// ============================================================
// TABLE: applications (Onboarding Queue)
// ============================================================

/**
 * Tracks user signup applications pending admin review
 *
 * Design Decisions:
 * 1. Foreign key to users (SET NULL on user delete for audit trail)
 * 2. Tracks reviewer and review timestamp
 * 3. No soft delete (permanent audit record)
 * 4. Indexes for admin dashboard filtering
 */
export const applications = pgTable(
  'applications',
  {
    // Primary Key
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    // User (applicant)
    userId: uuid('user_id')
      .unique()
      .notNull(),

    // Application Content
    motivationText: text('motivation_text')
      .notNull(),  // Why they want to join

    // Review Status
    status: applicationStatusEnum('status')
      .default('pending')
      .notNull(),

    // Review Tracking
    reviewedByUserId: uuid('reviewed_by_user_id'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    reviewNotes: text('review_notes'),  // Admin notes on decision

    // Timestamps & Audit
    ...timestamps,

    // Metadata
    ...metadata,  // Source tracking, referral context, etc.
  },
  (table) => ({
    // Foreign Keys
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'applications_user_fk',
    }).onDelete('set null'),

    reviewedByFk: foreignKey({
      columns: [table.reviewedByUserId],
      foreignColumns: [users.id],
      name: 'applications_reviewed_by_fk',
    }).onDelete('set null'),

    // Indexes
    userIdIdx: index('idx_applications_user_id').on(table.userId),
    statusIdx: index('idx_applications_status').on(table.status),
    reviewedByIdx: index('idx_applications_reviewed_by').on(table.reviewedByUserId),
    createdAtIdx: index('idx_applications_created_at').on(table.createdAt),

    // Composite index for admin dashboard (filter pending + sort by date)
    statusCreatedIdx: index('idx_applications_status_created')
      .on(table.status, table.createdAt),
  })
)

// ============================================================
// TYPESCRIPT TYPES
// ============================================================

/**
 * Application type (for SELECT queries)
 */
export type Application = typeof applications.$inferSelect

/**
 * New application type (for INSERT queries)
 */
export type NewApplication = typeof applications.$inferInsert
