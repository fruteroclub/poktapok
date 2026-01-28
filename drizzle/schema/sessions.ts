import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core'
import { programs } from './programs'
import { timestamps, metadata } from './utils'

/**
 * Sessions table - Content delivery units for programs
 *
 * Sessions can be standalone OR linked to a program via optional programId.
 * This supports both structured program sessions and standalone events
 * (e.g., open coworking sessions, workshops, community events).
 */
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  programId: uuid('program_id')
    .references(() => programs.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  sessionType: varchar('session_type', { length: 50 }).notNull().default('in-person'), // 'in-person' | 'virtual' | 'hybrid'
  sessionDate: timestamp('session_date', { withTimezone: true }).notNull(),
  duration: varchar('duration', { length: 50 }), // e.g., "2 hours", "90 minutes"
  location: text('location'), // Physical location or meeting link
  instructors: jsonb('instructors').$type<string[]>().default([]), // User IDs of instructors
  materials: jsonb('materials').$type<{ title: string; url: string; type: string }[]>().default([]), // Session materials/resources
  isActive: boolean('is_active').default(true).notNull(),
  ...timestamps,
  ...metadata,
})

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
