/**
 * Project Validation Schemas
 *
 * Zod schemas for validating project-related API requests
 */

import { z } from 'zod'

// ============================================================
// ENUMS
// ============================================================

export const projectStatusEnum = z.enum([
  'draft',
  'wip',
  'completed',
  'archived',
])
export const projectTypeEnum = z.enum([
  'personal',
  'bootcamp',
  'hackathon',
  'work-related',
  'freelance',
  'bounty',
])

// ============================================================
// PROJECT SCHEMAS
// ============================================================

/**
 * Create Project Schema
 * Validates POST /api/projects request body
 */
export const createProjectSchema = z
  .object({
    title: z
      .string()
      .min(5, 'Title must be at least 5 characters')
      .max(100, 'Title must be at most 100 characters')
      .trim(),

    description: z
      .string()
      .min(20, 'Description must be at least 20 characters')
      .max(280, 'Description must be at most 280 characters')
      .trim(),

    liveUrl: z
      .string()
      .url('Live URL must be a valid URL')
      .nullish()
      .transform((val) => val || null),

    repositoryUrl: z
      .string()
      .url('Repository URL must be a valid URL')
      .nullish()
      .transform((val) => val || null),

    videoUrl: z
      .string()
      .url('Video URL must be a valid URL')
      .nullish()
      .transform((val) => val || null),

    logoUrl: z
      .string()
      .url('Logo URL must be a valid URL')
      .nullish()
      .transform((val) => val || null),

    imageUrls: z
      .array(z.string().url('Image URL must be a valid URL'))
      .max(5, 'Maximum 5 images allowed')
      .optional()
      .default([]),

    projectType: projectTypeEnum,

    projectStatus: projectStatusEnum.default('draft'),

    skillIds: z
      .array(z.string().uuid('Invalid skill ID'))
      .min(1, 'At least one skill is required')
      .max(10, 'Maximum 10 skills allowed'),
  })
  .refine((data) => data.repositoryUrl || data.videoUrl || data.liveUrl, {
    message: 'At least one URL (repository, video, or live demo) is required',
    path: ['urls'],
  })

/**
 * Update Project Schema
 * Validates PUT /api/projects/:id request body (all fields optional)
 */
export const updateProjectSchema = createProjectSchema.partial().extend({
  skillIds: z
    .array(z.string().uuid('Invalid skill ID'))
    .min(1, 'At least one skill is required')
    .max(10, 'Maximum 10 skills allowed')
    .optional(),
})

/**
 * Publish Project Schema
 * Validates PATCH /api/projects/:id/publish request body
 */
export const publishProjectSchema = z.object({
  status: z.enum(['wip', 'completed', 'archived']),
})

/**
 * List Projects Query Schema
 * Validates GET /api/projects query parameters
 */
export const listProjectsQuerySchema = z.object({
  userId: z.string().uuid('Invalid user ID').optional(),
  status: projectStatusEnum.optional(),
  type: projectTypeEnum.optional(),
  featured: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  limit: z
    .string()
    .default('20')
    .transform((val) => Math.min(parseInt(val, 10), 100)),
  offset: z
    .string()
    .default('0')
    .transform((val) => parseInt(val, 10)),
})

// ============================================================
// TYPE EXPORTS
// ============================================================

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type PublishProjectInput = z.infer<typeof publishProjectSchema>
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>
