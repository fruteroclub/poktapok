import { pgTable, uuid, integer, timestamp, unique } from 'drizzle-orm/pg-core'
import { sessions } from './sessions'
import { activities } from './activities'

/**
 * Session Activities Junction Table
 *
 * Links sessions to their related activities (deliverables/assignments).
 * Allows activities to be reused across multiple sessions.
 */
export const sessionActivities = pgTable(
  'session_activities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    activityId: uuid('activity_id')
      .notNull()
      .references(() => activities.id, { onDelete: 'cascade' }),
    orderIndex: integer('order_index'), // Order of activities within session
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueSessionActivity: unique().on(table.sessionId, table.activityId),
  })
)

export type SessionActivity = typeof sessionActivities.$inferSelect
export type NewSessionActivity = typeof sessionActivities.$inferInsert
