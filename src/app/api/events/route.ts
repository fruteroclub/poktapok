import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { events } from '@/lib/db/schema'
import { apiSuccess, apiError } from '@/lib/api/response'
import { eq, and, desc, asc, gte, lt } from 'drizzle-orm'

// Track last sync time in memory (resets on cold start, which is fine)
let lastSyncTime: number | null = null
const SYNC_INTERVAL_MS = 60 * 60 * 1000 // 1 hour

/**
 * Background sync from Luma calendar (non-blocking)
 */
async function syncFromLumaBackground() {
  try {
    // Fetch from internal sync endpoint
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    fetch(`${baseUrl}/api/luma/sync-calendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calendarSlug: 'fruteroclub' }),
    }).catch((err) => {
      console.error('Background Luma sync failed:', err)
    })

    lastSyncTime = Date.now()
  } catch (error) {
    console.error('Error triggering background sync:', error)
  }
}

/**
 * Check if sync is needed based on time or empty events
 */
function shouldSync(eventCount: number): boolean {
  // Always sync if no events
  if (eventCount === 0) return true

  // Sync if never synced or interval passed
  if (!lastSyncTime) return true
  if (Date.now() - lastSyncTime > SYNC_INTERVAL_MS) return true

  return false
}

/**
 * GET /api/events
 * List published events (public endpoint)
 * Query params:
 * - status: 'upcoming' | 'past' | 'all' (default: 'all')
 * - featured: 'true' to only show featured events
 * - limit: number of events to return
 *
 * Auto-syncs from Luma calendar in background every hour
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

    // Trigger background sync if needed (non-blocking)
    if (shouldSync(allEvents.length)) {
      // Don't await - let it run in background
      syncFromLumaBackground()
    }

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
