/**
 * Projects Table Schema
 *
 * Stores portfolio projects created by users.
 * Each project can have multiple skills and images.
 * Projects are soft-deleted (deletedAt timestamp).
 */

import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
  pgEnum,
  index,
  check,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { timestamps, softDelete, metadata } from './utils'
import { users } from './users'

/**
 * Project Type Enum
 * Categorizes the origin/context of the project
 */
export const projectTypeEnum = pgEnum('project_type', [
  'personal', // Personal side project
  'bootcamp', // Learned in a course/bootcamp
  'hackathon', // Built during a hackathon
  'work-related', // Professional work experience
  'freelance', // Freelance client work
  'bounty', // Completed bounty challenge
])

/**
 * Project Status Enum
 * Tracks the publication and completion status
 */
export const projectStatusEnum = pgEnum('project_status', [
  'draft', // Work in progress, not published
  'wip', // Work in progress, published
  'completed', // Published and finished
  'archived', // No longer showcased
])

/**
 * Projects Table
 * Portfolio projects with links, images, and metadata
 */
export const projects = pgTable(
  'projects',
  {
    // Primary Key
    id: uuid('id').primaryKey().defaultRandom(),

    // Foreign Keys
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Core Fields
    title: varchar('title', { length: 100 }).notNull(),
    description: varchar('description', { length: 280 }).notNull(),

    // Project Links
    liveUrl: varchar('live_url', { length: 500 }),
    repositoryUrl: varchar('repository_url', { length: 500 }),
    videoUrl: varchar('video_url', { length: 500 }),

    // Visual Identity
    logoUrl: varchar('logo_url', { length: 500 }),
    imageUrls: varchar('image_urls', { length: 500 }).array(),

    // Project Metadata
    projectType: projectTypeEnum('project_type').notNull(),
    projectStatus: projectStatusEnum('project_status')
      .notNull()
      .default('draft'),

    // Display & Organization
    displayOrder: integer('display_order').notNull().default(0),
    featured: boolean('featured').notNull().default(false),

    // Analytics
    viewCount: integer('view_count').notNull().default(0),

    // Timestamps
    ...timestamps,
    publishedAt: timestamp('published_at', { mode: 'date' }),

    // Soft Delete
    ...softDelete,

    // Metadata
    ...metadata,
  },
  (table) => ({
    // Indexes for performance
    userIdIdx: index('idx_projects_user_id').on(table.userId),
    statusIdx: index('idx_projects_status').on(table.projectStatus),
    typeIdx: index('idx_projects_type').on(table.projectType),
    featuredIdx: index('idx_projects_featured')
      .on(table.featured)
      .where(sql`${table.featured} = true`),
    displayOrderIdx: index('idx_projects_display_order').on(
      table.userId,
      table.displayOrder,
    ),
    publishedAtIdx: index('idx_projects_published_at')
      .on(table.publishedAt)
      .where(sql`${table.publishedAt} IS NOT NULL`),
    deletedAtIdx: index('idx_projects_deleted_at')
      .on(table.deletedAt)
      .where(sql`${table.deletedAt} IS NULL`),

    // CHECK constraints
    titleLengthCheck: check(
      'projects_title_length',
      sql`char_length(${table.title}) >= 5 AND char_length(${table.title}) <= 100`,
    ),
    descriptionLengthCheck: check(
      'projects_description_length',
      sql`char_length(${table.description}) >= 20 AND char_length(${table.description}) <= 280`,
    ),
    atLeastOneUrlCheck: check(
      'projects_at_least_one_url',
      sql`${table.repositoryUrl} IS NOT NULL OR ${table.videoUrl} IS NOT NULL OR ${table.liveUrl} IS NOT NULL`,
    ),
    liveUrlFormatCheck: check(
      'projects_live_url_format',
      sql`${table.liveUrl} IS NULL OR ${table.liveUrl} ~ '^https?://'`,
    ),
    repositoryUrlFormatCheck: check(
      'projects_repository_url_format',
      sql`${table.repositoryUrl} IS NULL OR ${table.repositoryUrl} ~ '^https?://'`,
    ),
    videoUrlFormatCheck: check(
      'projects_video_url_format',
      sql`${table.videoUrl} IS NULL OR ${table.videoUrl} ~ '^https?://'`,
    ),
    logoUrlFormatCheck: check(
      'projects_logo_url_format',
      sql`${table.logoUrl} IS NULL OR ${table.logoUrl} ~ '^https?://'`,
    ),
    viewCountCheck: check(
      'projects_view_count_check',
      sql`${table.viewCount} >= 0`,
    ),
    displayOrderCheck: check(
      'projects_display_order_check',
      sql`${table.displayOrder} >= 0`,
    ),
  }),
)

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
