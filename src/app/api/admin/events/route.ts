import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { events } from '@/lib/db/schema'
import { apiSuccess, apiValidationError } from '@/lib/api/response'
import { requireAdmin, handleApiError } from '@/lib/auth/middleware'
import { z } from 'zod'
import { eq, desc, asc, gte, lt, and } from 'drizzle-orm'

// Create event schema
const createEventSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  lumaUrl: z.string().url(),
  lumaEventId: z.string().optional().nullable(),
  lumaSlug: z.string().optional().nullable(),
  eventType: z.enum(['in-person', 'virtual', 'hybrid']).default('in-person'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional().nullable(),
  timezone: z.string().default('America/Mexico_City'),
  location: z.string().optional().nullable(),
  locationDetails: z.string().optional().nullable(),
  locationUrl: z.string().url().optional().nullable(),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional()
    .nullable(),
  hosts: z
    .array(
      z.object({
        name: z.string(),
        avatarUrl: z.string().optional(),
        handle: z.string().optional(),
      })
    )
    .default([]),
  calendar: z.string().optional().nullable(),
  programId: z.string().uuid().optional().nullable(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  registrationCount: z.number().optional().nullable(),
  maxCapacity: z.number().optional().nullable(),
  registrationType: z.enum(['free', 'paid', 'approval']).default('free'),
})

/**
 * GET /api/admin/events
 * List all events (with optional status filter)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'upcoming' | 'past' | 'all'
    const programId = searchParams.get('programId')

    const now = new Date()

    const query = db.select().from(events)

    // Build where conditions
    const conditions = []

    if (status === 'upcoming') {
      conditions.push(gte(events.startDate, now))
    } else if (status === 'past') {
      conditions.push(lt(events.startDate, now))
    }

    if (programId) {
      conditions.push(eq(events.programId, programId))
    }

    const allEvents = await query
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(
        status === 'past' ? desc(events.startDate) : asc(events.startDate)
      )

    // Compute status for each event based on date
    const eventsWithStatus = allEvents.map((event) => ({
      ...event,
      status: new Date(event.startDate) > now ? 'upcoming' : 'past',
    }))

    return apiSuccess({ events: eventsWithStatus })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/admin/events
 * Create a new event
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const result = createEventSchema.safeParse(body)

    if (!result.success) {
      return apiValidationError(result.error)
    }

    const eventData = result.data

    // Determine status based on date
    const now = new Date()
    const startDate = new Date(eventData.startDate)
    const computedStatus = startDate > now ? 'upcoming' : 'past'

    const [newEvent] = await db
      .insert(events)
      .values({
        ...eventData,
        startDate: new Date(eventData.startDate),
        endDate: eventData.endDate ? new Date(eventData.endDate) : null,
        status: computedStatus,
      })
      .returning()

    return apiSuccess(
      { event: newEvent },
      { message: 'Event created successfully' }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
