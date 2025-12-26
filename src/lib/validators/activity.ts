import { z } from 'zod'

// ============================================================
// ACTIVITY VALIDATION SCHEMAS
// ============================================================

/**
 * Evidence requirements schema
 */
export const evidenceRequirementsSchema = z.object({
  url_required: z.boolean(),
  screenshot_required: z.boolean(),
  text_required: z.boolean(),
})

/**
 * Create activity schema
 */
export const createActivitySchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be at most 200 characters'),

  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be at most 2000 characters'),

  instructions: z.string()
    .max(5000, 'Instructions must be at most 5000 characters')
    .optional(),

  activity_type: z.enum([
    'github_commit',
    'x_post',
    'photo',
    'video',
    'blog_post',
    'workshop_completion',
    'build_in_public',
    'code_review',
    'custom'
  ]),

  category: z.string()
    .max(100, 'Category must be at most 100 characters')
    .optional(),

  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),

  reward_pulpa_amount: z.string()
    .regex(/^\d+(\.\d{1,8})?$/, 'Invalid PULPA amount format')
    .refine((val) => parseFloat(val) > 0, 'Reward must be greater than 0'),

  evidence_requirements: evidenceRequirementsSchema,

  verification_type: z.enum(['manual', 'automatic', 'hybrid'])
    .default('manual'),

  max_submissions_per_user: z.number()
    .int()
    .positive()
    .optional()
    .nullable(),

  total_available_slots: z.number()
    .int()
    .positive()
    .optional()
    .nullable(),

  starts_at: z.string()
    .datetime()
    .optional()
    .nullable(),

  expires_at: z.string()
    .datetime()
    .optional()
    .nullable(),

  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled'])
    .default('draft'),
})

/**
 * Update activity schema (all fields optional except those that shouldn't change)
 */
export const updateActivitySchema = createActivitySchema.partial()

/**
 * Update activity status schema
 */
export const updateActivityStatusSchema = z.object({
  status: z.enum(['active', 'paused', 'completed', 'cancelled']),
  reason: z.string().optional(),
})

// ============================================================
// SUBMISSION VALIDATION SCHEMAS
// ============================================================

/**
 * Evidence file schema
 */
export const evidenceFileSchema = z.object({
  url: z.string().url(),
  filename: z.string(),
  size: z.number().positive(),
  type: z.string(),
})

/**
 * Submit activity schema
 */
export const submitActivitySchema = z.object({
  submission_url: z.string()
    .url('Invalid URL format')
    .max(500, 'URL must be at most 500 characters')
    .optional(),

  submission_text: z.string()
    .max(1000, 'Submission text must be at most 1000 characters')
    .optional(),

  evidence_files: z.array(evidenceFileSchema)
    .max(3, 'Maximum 3 files allowed')
    .optional(),
}).refine((data) => {
  // At least one field must be provided
  return data.submission_url || data.submission_text || (data.evidence_files && data.evidence_files.length > 0)
}, {
  message: 'At least one of: submission_url, submission_text, or evidence_files must be provided'
})

/**
 * Approve submission schema
 */
export const approveSubmissionSchema = z.object({
  reward_pulpa_amount: z.string()
    .regex(/^\d+(\.\d{1,8})?$/, 'Invalid PULPA amount format')
    .refine((val) => parseFloat(val) > 0, 'Reward must be greater than 0')
    .optional(), // Optional: can use activity default

  review_notes: z.string()
    .max(1000, 'Review notes must be at most 1000 characters')
    .optional(),
})

/**
 * Reject submission schema
 */
export const rejectSubmissionSchema = z.object({
  review_notes: z.string()
    .min(10, 'Please provide a reason for rejection (min 10 characters)')
    .max(1000, 'Review notes must be at most 1000 characters'),
})

/**
 * Request revision schema
 */
export const requestRevisionSchema = z.object({
  review_notes: z.string()
    .min(10, 'Please provide specific feedback (min 10 characters)')
    .max(1000, 'Review notes must be at most 1000 characters'),
})

// ============================================================
// DISTRIBUTION VALIDATION SCHEMAS
// ============================================================

/**
 * Create distribution schema
 */
export const createDistributionSchema = z.object({
  submission_ids: z.array(z.string().uuid())
    .min(1, 'At least one submission ID required'),

  distribution_method: z.enum(['manual', 'smart_contract', 'claim_portal']),

  transaction_hashes: z.record(z.string().uuid(), z.string().regex(/^0x[a-fA-F0-9]{64}$/))
    .optional(), // Required if method is 'manual'
}).refine((data) => {
  // If manual distribution, transaction hashes are required
  if (data.distribution_method === 'manual') {
    return data.transaction_hashes && Object.keys(data.transaction_hashes).length > 0
  }
  return true
}, {
  message: 'Transaction hashes required for manual distribution',
  path: ['transaction_hashes']
})

/**
 * Update distribution schema
 */
export const updateDistributionSchema = z.object({
  status: z.enum(['processing', 'completed', 'failed', 'cancelled']).optional(),
  transaction_hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/).optional(),
  error_message: z.string().max(1000).optional(),
})

// ============================================================
// QUERY PARAM VALIDATION SCHEMAS
// ============================================================

/**
 * List activities query params
 */
export const listActivitiesQuerySchema = z.object({
  type: z.enum([
    'github_commit',
    'x_post',
    'photo',
    'video',
    'blog_post',
    'workshop_completion',
    'build_in_public',
    'code_review',
    'custom'
  ]).optional(),

  category: z.string().optional(),

  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),

  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']).optional(),

  search: z.string().optional(),

  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().positive().max(100).default(24),
})

/**
 * List submissions query params
 */
export const listSubmissionsQuerySchema = z.object({
  status: z.enum(['pending', 'under_review', 'approved', 'rejected', 'revision_requested', 'distributed']).optional(),

  activity_id: z.string().uuid().optional(),

  user_id: z.string().uuid().optional(),

  sort: z.enum(['submitted_at_asc', 'submitted_at_desc', 'reward_amount_desc'])
    .default('submitted_at_desc'),

  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().positive().max(100).default(24),
})

/**
 * List distributions query params
 */
export const listDistributionsQuerySchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled']).optional(),

  method: z.enum(['manual', 'smart_contract', 'claim_portal']).optional(),

  start_date: z.string().datetime().optional(),

  end_date: z.string().datetime().optional(),

  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().positive().max(100).default(24),
})

// ============================================================
// TYPE EXPORTS
// ============================================================

export type CreateActivityInput = z.infer<typeof createActivitySchema>
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>
export type UpdateActivityStatusInput = z.infer<typeof updateActivityStatusSchema>

export type SubmitActivityInput = z.infer<typeof submitActivitySchema>
export type ApproveSubmissionInput = z.infer<typeof approveSubmissionSchema>
export type RejectSubmissionInput = z.infer<typeof rejectSubmissionSchema>
export type RequestRevisionInput = z.infer<typeof requestRevisionSchema>

export type CreateDistributionInput = z.infer<typeof createDistributionSchema>
export type UpdateDistributionInput = z.infer<typeof updateDistributionSchema>

export type ListActivitiesQuery = z.infer<typeof listActivitiesQuerySchema>
export type ListSubmissionsQuery = z.infer<typeof listSubmissionsQuerySchema>
export type ListDistributionsQuery = z.infer<typeof listDistributionsQuerySchema>
