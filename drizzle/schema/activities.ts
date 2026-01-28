import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  jsonb,
  foreignKey,
  check,
  index,
  integer,
  decimal,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { timestamps, softDelete, metadata } from './utils'
import { users } from './users'

// ============================================================
// ENUMS
// ============================================================

/**
 * Activity type for categorization
 */
export const activityTypeEnum = pgEnum('activity_type', [
  'github_commit',
  'x_post',
  'photo',
  'video',
  'blog_post',
  'workshop_completion',
  'build_in_public',
  'code_review',
  'custom',
])

/**
 * Difficulty level for activities
 */
export const difficultyEnum = pgEnum('difficulty', [
  'beginner',
  'intermediate',
  'advanced',
])

/**
 * Verification method for submissions
 */
export const verificationEnum = pgEnum('verification_type', [
  'manual', // Admin reviews manually
  'automatic', // API verification (future)
  'hybrid', // Auto-check + manual review
])

/**
 * Activity status lifecycle
 */
export const activityStatusEnum = pgEnum('activity_status', [
  'draft', // Not published
  'active', // Live and accepting submissions
  'paused', // Temporarily disabled
  'completed', // All slots filled or expired
  'cancelled', // Cancelled by admin
])

/**
 * Submission status lifecycle
 */
export const submissionStatusEnum = pgEnum('submission_status', [
  'pending', // Awaiting review
  'under_review', // Admin is reviewing
  'approved', // Approved, ready for distribution
  'rejected', // Rejected
  'revision_requested', // Needs changes
  'distributed', // Tokens distributed
])

/**
 * Distribution method types
 */
export const distributionMethodEnum = pgEnum('distribution_method', [
  'manual', // Admin sends via MetaMask/external wallet
  'smart_contract', // Automated via smart contract (future)
  'claim_portal', // User-initiated claiming (future)
])

/**
 * Distribution status tracking
 */
export const distributionStatusEnum = pgEnum('distribution_status', [
  'pending', // Queued for distribution
  'processing', // Transaction in progress
  'completed', // Successfully distributed
  'failed', // Distribution failed
  'cancelled', // Admin cancelled
])

// ============================================================
// TABLE: activities (Admin-created tasks)
// ============================================================

/**
 * Admin-created tasks for educational/community activities
 *
 * Design Decisions:
 * 1. JSONB for evidence_requirements (flexible validation rules)
 * 2. Decimal(18, 8) for PULPA amounts (supports token decimals)
 * 3. Nullable slots for unlimited availability
 * 4. Soft deletes for audit trail
 * 5. Separate instructions field for step-by-step guides
 */
export const activities = pgTable(
  'activities',
  {
    // Primary Key
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    // Content
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description').notNull(),
    instructions: text('instructions'),

    // Categorization
    activityType: activityTypeEnum('activity_type').notNull(),
    category: varchar('category', { length: 100 }),
    difficulty: difficultyEnum('difficulty').notNull(),

    // Rewards
    rewardPulpaAmount: decimal('reward_pulpa_amount', {
      precision: 18,
      scale: 8,
    }).notNull(),

    // Submission Requirements
    evidenceRequirements: jsonb('evidence_requirements')
      .notNull()
      .default(
        sql`'{"url_required": false, "screenshot_required": false, "text_required": false}'::jsonb`,
      ),
    verificationType: verificationEnum('verification_type')
      .notNull()
      .default('manual'),

    // Limits & Availability
    maxSubmissionsPerUser: integer('max_submissions_per_user'), // null = unlimited
    totalAvailableSlots: integer('total_available_slots'), // null = unlimited
    currentSubmissionsCount: integer('current_submissions_count')
      .notNull()
      .default(0),

    status: activityStatusEnum('status').notNull().default('draft'),

    // Timing
    startsAt: timestamp('starts_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),

    // Management
    createdByUserId: uuid('created_by_user_id').notNull(),

    // Timestamps & Audit
    ...timestamps,
    ...softDelete,

    // Metadata
    ...metadata,
  },
  (table) => ({
    // Foreign Keys
    createdByFk: foreignKey({
      columns: [table.createdByUserId],
      foreignColumns: [users.id],
      name: 'activities_created_by_fk',
    }).onDelete('restrict'),

    // Constraints
    titleLengthCheck: check(
      'title_length',
      sql`char_length(${table.title}) >= 5`,
    ),

    descriptionLengthCheck: check(
      'description_length',
      sql`char_length(${table.description}) >= 20`,
    ),

    rewardPositiveCheck: check(
      'reward_positive',
      sql`${table.rewardPulpaAmount} > 0`,
    ),

    slotsPositiveCheck: check(
      'slots_positive',
      sql`${table.totalAvailableSlots} IS NULL OR ${table.totalAvailableSlots} > 0`,
    ),

    maxSubmissionsPositiveCheck: check(
      'max_submissions_positive',
      sql`${table.maxSubmissionsPerUser} IS NULL OR ${table.maxSubmissionsPerUser} > 0`,
    ),

    currentCountPositiveCheck: check(
      'current_count_positive',
      sql`${table.currentSubmissionsCount} >= 0`,
    ),

    // Indexes
    statusIdx: index('idx_activities_status').on(table.status),
    typeIdx: index('idx_activities_type').on(table.activityType),
    categoryIdx: index('idx_activities_category').on(table.category),
    createdByIdx: index('idx_activities_created_by').on(table.createdByUserId),
    expiresAtIdx: index('idx_activities_expires_at').on(table.expiresAt),

    // Soft delete partial index
    deletedAtIdx: index('idx_activities_deleted_at')
      .on(table.deletedAt)
      .where(sql`${table.deletedAt} IS NULL`),

    // Full-text search index
    searchIdx: index('idx_activities_search').using(
      'gin',
      sql`to_tsvector('english', ${table.title} || ' ' || ${table.description})`,
    ),
  }),
)

// ============================================================
// TABLE: activity_submissions (User submission proofs)
// ============================================================

/**
 * User submissions for activity completion proofs
 *
 * Design Decisions:
 * 1. Unique constraint prevents duplicate submissions per user per activity
 * 2. JSONB for evidence_files array (supports multiple uploads)
 * 3. Nullable reviewed fields until admin reviews
 * 4. Separate reward amount allows partial credit
 * 5. Metadata stores IP, user agent for spam prevention
 */
export const activitySubmissions = pgTable(
  'activity_submissions',
  {
    // Primary Key
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    // Relationships
    activityId: uuid('activity_id').notNull(),
    userId: uuid('user_id').notNull(),

    // Submission Content
    submissionUrl: varchar('submission_url', { length: 500 }),
    evidenceFiles: jsonb('evidence_files')
      .default(sql`'[]'::jsonb`)
      .notNull(),
    submissionText: text('submission_text'),

    // Review Status
    status: submissionStatusEnum('status').notNull().default('pending'),

    // Admin Review
    reviewedByUserId: uuid('reviewed_by_user_id'),
    reviewNotes: text('review_notes'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),

    // Reward
    rewardPulpaAmount: decimal('reward_pulpa_amount', {
      precision: 18,
      scale: 8,
    }),

    // Timestamps
    submittedAt: timestamp('submitted_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),

    // Metadata
    ...metadata,
  },
  (table) => ({
    // Foreign Keys
    activityFk: foreignKey({
      columns: [table.activityId],
      foreignColumns: [activities.id],
      name: 'submissions_activity_fk',
    }).onDelete('cascade'),

    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'submissions_user_fk',
    }).onDelete('cascade'),

    reviewedByFk: foreignKey({
      columns: [table.reviewedByUserId],
      foreignColumns: [users.id],
      name: 'submissions_reviewed_by_fk',
    }).onDelete('set null'),

    // Constraints
    submissionTextLengthCheck: check(
      'submission_text_length',
      sql`${table.submissionText} IS NULL OR char_length(${table.submissionText}) <= 1000`,
    ),

    rewardPositiveCheck: check(
      'submission_reward_positive',
      sql`${table.rewardPulpaAmount} IS NULL OR ${table.rewardPulpaAmount} > 0`,
    ),

    // Unique constraint: One submission per user per activity
    uniqueUserActivityIdx: index('idx_submissions_unique_user_activity')
      .on(table.activityId, table.userId)
      .where(sql`${table.status} != 'rejected'`),

    // Indexes
    activityIdx: index('idx_submissions_activity').on(table.activityId),
    userIdx: index('idx_submissions_user').on(table.userId),
    statusIdx: index('idx_submissions_status').on(table.status),
    reviewedByIdx: index('idx_submissions_reviewed_by').on(
      table.reviewedByUserId,
    ),
    submittedAtIdx: index('idx_submissions_submitted_at').on(table.submittedAt),

    // Composite index for admin queue
    queueIdx: index('idx_submissions_queue')
      .on(table.status, table.submittedAt)
      .where(sql`${table.status} IN ('pending', 'under_review')`),
  }),
)

// ============================================================
// TABLE: pulpa_distributions (Token distribution tracking)
// ============================================================

/**
 * Track $PULPA token distribution history
 *
 * Design Decisions:
 * 1. Unique constraint: One distribution per submission
 * 2. Transaction hash nullable for manual distributions
 * 3. Chain ID defaults to Optimism (10)
 * 4. Retry count for failed distributions
 * 5. Metadata stores gas fees, exchange rates
 */
export const pulpaDistributions = pgTable(
  'pulpa_distributions',
  {
    // Primary Key
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    // Relationships
    submissionId: uuid('submission_id').notNull(),
    userId: uuid('user_id').notNull(),
    activityId: uuid('activity_id').notNull(),

    // Distribution Details
    pulpaAmount: decimal('pulpa_amount', { precision: 18, scale: 8 }).notNull(),
    recipientWallet: varchar('recipient_wallet', { length: 42 }).notNull(),

    // Blockchain Info
    chainId: integer('chain_id').notNull().default(10), // Optimism Mainnet
    transactionHash: varchar('transaction_hash', { length: 66 }),

    // Distribution Method
    distributionMethod: distributionMethodEnum('distribution_method').notNull(),

    // Status
    status: distributionStatusEnum('status').notNull().default('pending'),

    // Management
    distributedByUserId: uuid('distributed_by_user_id').notNull(),

    // Error Handling
    errorMessage: text('error_message'),
    retryCount: integer('retry_count').notNull().default(0),

    // Timestamps
    initiatedAt: timestamp('initiated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    distributedAt: timestamp('distributed_at', { withTimezone: true }),
    confirmedAt: timestamp('confirmed_at', { withTimezone: true }),

    // Metadata
    ...metadata,
  },
  (table) => ({
    // Foreign Keys
    submissionFk: foreignKey({
      columns: [table.submissionId],
      foreignColumns: [activitySubmissions.id],
      name: 'distributions_submission_fk',
    }).onDelete('cascade'),

    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'distributions_user_fk',
    }).onDelete('cascade'),

    activityFk: foreignKey({
      columns: [table.activityId],
      foreignColumns: [activities.id],
      name: 'distributions_activity_fk',
    }).onDelete('cascade'),

    distributedByFk: foreignKey({
      columns: [table.distributedByUserId],
      foreignColumns: [users.id],
      name: 'distributions_distributed_by_fk',
    }).onDelete('restrict'),

    // Constraints
    pulpaAmountPositiveCheck: check(
      'distribution_pulpa_positive',
      sql`${table.pulpaAmount} > 0`,
    ),

    walletFormatCheck: check(
      'wallet_format',
      sql`${table.recipientWallet} ~* '^0x[a-fA-F0-9]{40}$'`,
    ),

    txHashFormatCheck: check(
      'tx_hash_format',
      sql`${table.transactionHash} IS NULL OR ${table.transactionHash} ~* '^0x[a-fA-F0-9]{64}$'`,
    ),

    retryCountPositiveCheck: check(
      'retry_count_positive',
      sql`${table.retryCount} >= 0`,
    ),

    // Unique constraint: One distribution per submission
    submissionUniqueIdx: index('idx_distributions_submission_unique').on(
      table.submissionId,
    ),

    // Indexes
    userIdx: index('idx_distributions_user').on(table.userId),
    activityIdx: index('idx_distributions_activity').on(table.activityId),
    statusIdx: index('idx_distributions_status').on(table.status),
    txHashIdx: index('idx_distributions_tx_hash').on(table.transactionHash),
    distributedByIdx: index('idx_distributions_distributed_by').on(
      table.distributedByUserId,
    ),
    distributedAtIdx: index('idx_distributions_distributed_at').on(
      table.distributedAt,
    ),
  }),
)

// ============================================================
// TYPESCRIPT TYPES
// ============================================================

/**
 * Activity type (for SELECT queries)
 */
export type Activity = typeof activities.$inferSelect

/**
 * New activity type (for INSERT queries)
 */
export type NewActivity = typeof activities.$inferInsert

/**
 * Activity submission type (for SELECT queries)
 */
export type ActivitySubmission = typeof activitySubmissions.$inferSelect

/**
 * New activity submission type (for INSERT queries)
 */
export type NewActivitySubmission = typeof activitySubmissions.$inferInsert

/**
 * PULPA distribution type (for SELECT queries)
 */
export type PulpaDistribution = typeof pulpaDistributions.$inferSelect

/**
 * New PULPA distribution type (for INSERT queries)
 */
export type NewPulpaDistribution = typeof pulpaDistributions.$inferInsert

/**
 * Evidence requirements schema
 */
export interface EvidenceRequirements {
  url_required: boolean
  screenshot_required: boolean
  text_required: boolean
}

/**
 * Evidence file schema
 */
export interface EvidenceFile {
  url: string
  filename: string
  size: number
  type: string
}
