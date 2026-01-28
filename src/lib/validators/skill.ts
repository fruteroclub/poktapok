/**
 * Skill Validation Schemas
 *
 * Zod schemas for validating skill-related API requests
 */

import { z } from 'zod'

// ============================================================
// ENUMS
// ============================================================

export const skillCategoryEnum = z.enum([
  'language',
  'framework',
  'tool',
  'blockchain',
  'other',
])

// ============================================================
// SKILL SCHEMAS
// ============================================================

/**
 * List Skills Query Schema
 * Validates GET /api/skills query parameters
 */
export const listSkillsQuerySchema = z.object({
  category: skillCategoryEnum.optional(),
  search: z.string().optional(),
  limit: z
    .string()
    .default('100')
    .transform((val) => Math.min(parseInt(val, 10), 100)),
  offset: z
    .string()
    .default('0')
    .transform((val) => parseInt(val, 10)),
})

/**
 * Link Project Skill Schema
 * Validates POST /api/projects/:projectId/skills request body
 */
export const linkProjectSkillSchema = z.object({
  skillId: z.string().uuid('Invalid skill ID'),
})

/**
 * Link Multiple Project Skills Schema
 * Validates POST /api/projects/:projectId/skills/batch request body
 */
export const linkProjectSkillsBatchSchema = z.object({
  skillIds: z
    .array(z.string().uuid('Invalid skill ID'))
    .min(1, 'At least one skill is required')
    .max(10, 'Maximum 10 skills allowed'),
})

// ============================================================
// TYPE EXPORTS
// ============================================================

export type ListSkillsQuery = z.infer<typeof listSkillsQuerySchema>
export type LinkProjectSkillInput = z.infer<typeof linkProjectSkillSchema>
export type LinkProjectSkillsBatchInput = z.infer<
  typeof linkProjectSkillsBatchSchema
>
