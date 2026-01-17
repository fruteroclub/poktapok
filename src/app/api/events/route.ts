import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { events } from '@/lib/db/schema'
import { apiSuccess, apiError } from '@/lib/api/response'
import { eq, and, desc, asc, gte, lt } from 'drizzle-orm'

/**
 * GET /api/events
 * List published events (public endpoint)
 * Query params:
 * - status: 'upcoming' | 'past' | 'all' (default: 'all')
 * - featured: 'true' to only show featured events
 * - limit: number of events to return
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const featured = searchParams.get('featured') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const now = new Date()

    // Build where conditions
    const conditions = [eq(events.isPublished, true)]

    if (status === 'upcoming') {
      conditions.push(gte(events.startDate, now))
    } else if (status === 'past') {
      conditions.push(lt(events.startDate, now))
    }

    if (featured) {
      conditions.push(eq(events.isFeatured, true))
    }

    const allEvents = await db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(
        status === 'past' ? desc(events.startDate) : asc(events.startDate)
      )
      .limit(limit)

    // Compute status for each event based on date
    const eventsWithStatus = allEvents.map((event) => ({
      ...event,
      status: new Date(event.startDate) > now ? 'upcoming' : 'past',
    }))

    return apiSuccess({ events: eventsWithStatus })
  } catch (error) {
    console.error('Error fetching events:', error)
    return apiError('Failed to fetch events', {
      code: 'FETCH_ERROR',
      status: 500,
    })
  }
}
