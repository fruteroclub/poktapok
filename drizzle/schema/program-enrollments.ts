import { pgTable, uuid, varchar, timestamp, unique } from 'drizzle-orm/pg-core'
import { users } from './users'
import { programs } from './programs'
import { applications } from './applications'
import { timestamps, metadata } from './utils'

export const programEnrollments = pgTable('program_enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  programId: uuid('program_id').notNull().references(() => programs.id, { onDelete: 'cascade' }),
  applicationId: uuid('application_id').references(() => applications.id),
  status: varchar('status', { length: 50 }).default('enrolled').notNull(), // 'enrolled' | 'completed' | 'dropped'
  enrolledAt: timestamp('enrolled_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  promotedAt: timestamp('promoted_at', { withTimezone: true }), // When guest → active
  ...timestamps,
  ...metadata,
}, (table) => ({
  uniqueUserProgram: unique().on(table.userId, table.programId),
}))
