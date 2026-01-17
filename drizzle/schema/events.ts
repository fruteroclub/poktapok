import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
  integer,
} from 'drizzle-orm/pg-core'
import { programs } from './programs'
import { timestamps, metadata } from './utils'

/**
 * Events table - Community events with lu.ma integration
 *
 * Events can be standalone or linked to a program via optional programId.
 * Supports automatic metadata fetch from lu.ma URLs.
 *
 * Example lu.ma event: https://lu.ma/qq2u3tf6
 * - Cover: https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover/event-covers/...
 * - Event ID: evt-JkQd9kh99THTWSF
 */
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  programId: uuid('program_id').references(() => programs.id, {
    onDelete: 'set null',
  }),

  // Core event info
  title: varchar('title', { length: 300 }).notNull(),
  description: text('description'),
  coverImage: text('cover_image'), // URL from lumacdn.com

  // Lu.ma integration
  lumaUrl: text('luma_url').notNull(), // Original lu.ma URL (e.g., https://lu.ma/qq2u3tf6)
  lumaEventId: varchar('luma_event_id', { length: 100 }), // e.g., evt-JkQd9kh99THTWSF
  lumaSlug: varchar('luma_slug', { length: 100 }), // e.g., qq2u3tf6

  // Event details
  eventType: varchar('event_type', { length: 50 })
    .notNull()
    .default('in-person'), // 'in-person' | 'virtual' | 'hybrid'
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  timezone: varchar('timezone', { length: 100 }).default('America/Mexico_City'),

  // Location
  location: text('location'), // Full address
  locationDetails: text('location_details'), // Additional notes (e.g., "entrada al lado izquierdo...")
  locationUrl: text('location_url'), // Google Maps or venue link
  coordinates: jsonb('coordinates').$type<{
    lat: number
    lng: number
  } | null>(),

  // Organizer info
  hosts: jsonb('hosts')
    .$type<{ name: string; avatarUrl?: string; handle?: string }[]>()
    .default([]),
  calendar: varchar('calendar', { length: 100 }), // e.g., "Frutero Club"

  // Status
  status: varchar('status', { length: 20 }).notNull().default('upcoming'), // 'upcoming' | 'live' | 'past' | 'cancelled'
  isPublished: boolean('is_published').default(false).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),

  // Registration
  registrationCount: integer('registration_count').default(0),
  maxCapacity: integer('max_capacity'),
  registrationType: varchar('registration_type', { length: 50 }).default(
    'free'
  ), // 'free' | 'paid' | 'approval'

  ...timestamps,
  ...metadata,
})

export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
