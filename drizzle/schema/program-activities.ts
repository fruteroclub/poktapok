import { pgTable, uuid, boolean, integer, timestamp, unique } from 'drizzle-orm/pg-core'
import { programs } from './programs'

export const programActivities = pgTable('program_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  programId: uuid('program_id').notNull().references(() => programs.id, { onDelete: 'cascade' }),
  activityId: uuid('activity_id').notNull(), // Will reference activities.id once activities table is created
  isRequired: boolean('is_required').default(false).notNull(),
  orderIndex: integer('order_index'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueProgramActivity: unique().on(table.programId, table.activityId),
}))
