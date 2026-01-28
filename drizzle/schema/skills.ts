/**
 * Skills Tables Schema
 *
 * Manages the skill library and relationships between users, projects, and skills.
 * Skills are project-validated: users can only have skills that are used in at least one project.
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  pgEnum,
  index,
  primaryKey,
  unique,
} from 'drizzle-orm/pg-core'
import { timestamps, metadata } from './utils'
import { users } from './users'
import { projects } from './projects'

/**
 * Skill Category Enum
 * Categorizes skills by technical domain
 */
export const skillCategoryEnum = pgEnum('skill_category', [
  'language', // Programming languages (JavaScript, Python, Solidity)
  'framework', // Frameworks (React, Next.js, Express)
  'tool', // Development tools (Git, Docker, PostgreSQL)
  'blockchain', // Blockchain platforms (Ethereum, Arbitrum, Base)
  'other', // Other technical skills
])

/**
 * Proficiency Level Enum
 * User's proficiency with a skill (future: computed from projects)
 */
export const proficiencyLevelEnum = pgEnum('proficiency_level', [
  'beginner',
  'intermediate',
  'advanced',
])

/**
 * Skills Table
 * Preset library of available skills
 */
export const skills = pgTable(
  'skills',
  {
    // Primary Key
    id: uuid('id').primaryKey().defaultRandom(),

    // Core Fields
    name: varchar('name', { length: 50 }).notNull().unique(),
    slug: varchar('slug', { length: 50 }).notNull().unique(),
    category: skillCategoryEnum('category').notNull(),

    // Display
    description: text('description'),
    iconUrl: varchar('icon_url', { length: 500 }),

    // Popularity (computed from usage)
    usageCount: integer('usage_count').notNull().default(0),

    // Timestamps
    ...timestamps,
  },
  (table) => ({
    // Indexes
    categoryIdx: index('idx_skills_category').on(table.category),
    usageCountIdx: index('idx_skills_usage_count').on(table.usageCount),
  }),
)

/**
 * User Skills Table (Many-to-Many)
 * Tracks which skills a user has (must be validated through projects)
 */
export const userSkills = pgTable(
  'user_skills',
  {
    // Primary Key
    id: uuid('id').primaryKey().defaultRandom(),

    // Foreign Keys
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    skillId: uuid('skill_id')
      .notNull()
      .references(() => skills.id, { onDelete: 'cascade' }),

    // Proficiency (future: could be computed from projects)
    proficiencyLevel: proficiencyLevelEnum('proficiency_level')
      .notNull()
      .default('intermediate'),

    // Validation: Skill must be used in at least one project
    projectCount: integer('project_count').notNull().default(0),

    // Timestamps
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => ({
    // Indexes
    userIdIdx: index('idx_user_skills_user_id').on(table.userId),
    skillIdIdx: index('idx_user_skills_skill_id').on(table.skillId),
    projectCountIdx: index('idx_user_skills_project_count').on(
      table.projectCount,
    ),

    // Unique constraint
    uniqueUserSkill: unique('unique_user_skill').on(
      table.userId,
      table.skillId,
    ),
  }),
)

/**
 * Project Skills Table (Many-to-Many)
 * Links skills to specific projects
 */
export const projectSkills = pgTable(
  'project_skills',
  {
    // Foreign Keys (Composite Primary Key)
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    skillId: uuid('skill_id')
      .notNull()
      .references(() => skills.id, { onDelete: 'cascade' }),

    // Timestamps
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => ({
    // Composite Primary Key
    pk: primaryKey({ columns: [table.projectId, table.skillId] }),

    // Indexes
    projectIdIdx: index('idx_project_skills_project_id').on(table.projectId),
    skillIdIdx: index('idx_project_skills_skill_id').on(table.skillId),
  }),
)

// Type exports
export type Skill = typeof skills.$inferSelect
export type NewSkill = typeof skills.$inferInsert

export type UserSkill = typeof userSkills.$inferSelect
export type NewUserSkill = typeof userSkills.$inferInsert

export type ProjectSkill = typeof projectSkills.$inferSelect
export type NewProjectSkill = typeof projectSkills.$inferInsert
