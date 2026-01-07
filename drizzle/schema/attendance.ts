import { pgTable, uuid, varchar, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { users } from './users'
import { programs } from './programs'
import { metadata } from './utils'

export const attendance = pgTable('attendance', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionId: uuid('session_id').notNull(), // Will reference sessions.id once sessions table is created
  programId: uuid('program_id').references(() => programs.id, { onDelete: 'set null' }),
  markedBy: uuid('marked_by').notNull().references(() => users.id), // Admin/moderator
  status: varchar('status', { length: 50 }).notNull(), // 'present' | 'absent' | 'excused'
  notes: text('notes'),
  markedAt: timestamp('marked_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  ...metadata,
}, (table) => ({
  uniqueUserSession: unique().on(table.userId, table.sessionId),
}))
