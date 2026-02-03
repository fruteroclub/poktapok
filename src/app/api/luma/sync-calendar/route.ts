import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { events } from '@/lib/db/schema'
import { apiSuccess, apiError, apiValidationError } from '@/lib/api/response'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Request schema
const syncCalendarSchema = z.object({
  calendarSlug: z.string().min(1, 'Calendar slug is required'),
})

// Types for parsed event data
interface LumaCalendarEvent {
  title: string
  url: string
  slug: string
  startDate: string
  endDate: string | null
  location: string | null
  coordinates: { lat: number; lng: number } | null
  coverImage?: string | null
}

interface ParsedEventMetadata {
  title: string
  description: string | null
  coverImage: string | null
  lumaEventId: string | null
  lumaSlug: string
  lumaUrl: string
  eventType: 'in-person' | 'virtual' | 'hybrid'
  startDate: string
  endDate: string | null
  timezone: string
  location: string | null
  locationDetails: string | null
  hosts: { name: string; avatarUrl?: string; handle?: string }[]
  calendar: string | null
}

/**
 * Extract calendar events from JSON-LD structured data
 */
function extractCalendarEvents(html: string): LumaCalendarEvent[] {
  const extractedEvents: LumaCalendarEvent[] = []

  // Find all JSON-LD script tags
  const jsonLdRegex =
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
  let match

  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const jsonLd = JSON.parse(match[1])

      // Handle Organization with events array (Luma calendar format)
      if (jsonLd['@type'] === 'Organization' && Array.isArray(jsonLd.events)) {
        for (const item of jsonLd.events) {
          if (item['@type'] === 'Event') {
            const event = parseJsonLdEvent(item)
            if (event) extractedEvents.push(event)
          }
        }
      }

      // Handle single event
      if (jsonLd['@type'] === 'Event') {
        const event = parseJsonLdEvent(jsonLd)
        if (event) extractedEvents.push(event)
      }

      // Handle array of events
      if (Array.isArray(jsonLd)) {
        for (const item of jsonLd) {
          if (item['@type'] === 'Event') {
            const event = parseJsonLdEvent(item)
            if (event) extractedEvents.push(event)
          }
        }
      }

      // Handle @graph format
      if (jsonLd['@graph'] && Array.isArray(jsonLd['@graph'])) {
        for (const item of jsonLd['@graph']) {
          if (item['@type'] === 'Event') {
            const event = parseJsonLdEvent(item)
            if (event) extractedEvents.push(event)
          }
        }
      }
    } catch {
      // Ignore JSON parse errors for individual blocks
    }
  }

  return extractedEvents
}

/**
 * Parse a single JSON-LD event object
 */
function parseJsonLdEvent(
  jsonLd: Record<string, unknown>
): LumaCalendarEvent | null {
  try {
    // Luma uses @id for the event URL, fallback to url
    const url = (jsonLd['@id'] as string) || (jsonLd.url as string)
    if (!url) return null

    // Extract slug from URL
    const slugMatch = url.match(
      /(?:lu\.ma|luma\.com)\/([a-zA-Z0-9-_]+)(?:\?|$)/
    )
    const slug = slugMatch?.[1]
    if (!slug) return null

    const location = jsonLd.location as Record<string, unknown> | undefined
    const address = location?.address as Record<string, unknown> | undefined
    const geo = location?.geo as Record<string, unknown> | undefined

    // Handle coordinates - can be numbers or strings
    let coordinates: { lat: number; lng: number } | null = null
    if (geo) {
      const lat = geo.latitude as number | string
      const lng = geo.longitude as number | string
      if (lat !== undefined && lng !== undefined) {
        coordinates = {
          lat: typeof lat === 'number' ? lat : parseFloat(lat),
          lng: typeof lng === 'number' ? lng : parseFloat(lng),
        }
      }
    }

    // Get cover image from images array if available
    let coverImage: string | null = null
    if (Array.isArray(jsonLd.image) && jsonLd.image.length > 0) {
      coverImage = jsonLd.image[0] as string
    } else if (typeof jsonLd.image === 'string') {
      coverImage = jsonLd.image
    }

    return {
      title: (jsonLd.name as string) || 'Untitled Event',
      url,
      slug,
      startDate: jsonLd.startDate as string,
      endDate: (jsonLd.endDate as string) || null,
      location: (address?.streetAddress as string) || null,
      coordinates,
      coverImage,
    }
  } catch {
    return null
  }
}

/**
 * Fetch full event metadata from a lu.ma event page
 */
async function fetchEventMetadata(
  slug: string
): Promise<ParsedEventMetadata | null> {
  try {
    const lumaUrl = `https://lu.ma/${slug}`
    const response = await fetch(lumaUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; Poktapok/1.0; +https://poktapok.com)',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    })

    if (!response.ok) return null

    const html = await response.text()
    return parseEventMetadata(html, slug, lumaUrl)
  } catch {
    return null
  }
}

/**
 * Parse event metadata from HTML content
 */
function parseEventMetadata(
  html: string,
  slug: string,
  lumaUrl: string
): ParsedEventMetadata {
  const metadata: ParsedEventMetadata = {
    title: 'Untitled Event',
    description: null,
    coverImage: null,
    lumaEventId: null,
    lumaSlug: slug,
    lumaUrl,
    eventType: 'in-person',
    startDate: new Date().toISOString(),
    endDate: null,
    timezone: 'America/Mexico_City',
    location: null,
    locationDetails: null,
    hosts: [],
    calendar: null,
  }

  // Extract title from og:title or title tag
  const ogTitleMatch = html.match(
    /<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i
  )
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  metadata.title = ogTitleMatch?.[1] || titleMatch?.[1] || 'Untitled Event'

  // Extract description from og:description
  const descMatch = html.match(
    /<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i
  )
  metadata.description = descMatch?.[1] || null

  // Extract cover image - prefer lumacdn event-covers
  const lumaCdnMatch = html.match(
    /https:\/\/images\.lumacdn\.com\/[^"'\s]*event-covers[^"'\s]*/i
  )
  const ogImageMatch = html.match(
    /<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i
  )

  if (lumaCdnMatch?.[0]) {
    let coverUrl = lumaCdnMatch[0]
    if (coverUrl.includes('cdn-cgi/image/')) {
      coverUrl = coverUrl.replace(/width=\d+,height=\d+/, 'width=800,height=450')
    }
    metadata.coverImage = coverUrl
  } else {
    metadata.coverImage = ogImageMatch?.[1] || null
  }

  // Extract event ID
  const eventIdMatch = html.match(/evt-[a-zA-Z0-9]+/)
  metadata.lumaEventId = eventIdMatch?.[0] || null

  // Extract structured data (JSON-LD)
  const jsonLdMatch = html.match(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i
  )
  if (jsonLdMatch?.[1]) {
    try {
      const jsonLd = JSON.parse(jsonLdMatch[1])
      if (jsonLd['@type'] === 'Event') {
        metadata.startDate = jsonLd.startDate || metadata.startDate
        metadata.endDate = jsonLd.endDate || null

        const location = jsonLd.location as Record<string, unknown> | undefined
        const address = location?.address as Record<string, unknown> | undefined
        metadata.location = (address?.streetAddress as string) || null
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  // Extract timezone
  const tzMatch = html.match(/timezone["\s:]+["']?([A-Za-z_/]+)["']?/i)
  metadata.timezone = tzMatch?.[1] || 'America/Mexico_City'

  // Determine event type
  if (metadata.location) {
    const isOnline =
      metadata.location.toLowerCase().includes('online') ||
      metadata.location.toLowerCase().includes('virtual') ||
      metadata.location.toLowerCase().includes('zoom')
    metadata.eventType = isOnline ? 'virtual' : 'in-person'
  }

  // Extract host info
  const hostMatch = html.match(/hosted by[^<]*<[^>]*>([^<]+)/i)
  if (hostMatch) {
    metadata.hosts = [{ name: hostMatch[1].trim() }]
  }

  // Extract calendar name
  const calendarMatch = html.match(
    /data-calendar="([^"]+)"|calendar["\s:]+["']([^"']+)["']/i
  )
  metadata.calendar = calendarMatch?.[1] || calendarMatch?.[2] || null

  return metadata
}

/**
 * POST /api/luma/sync-calendar
 * Sync events from a Luma calendar to the database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    const result = syncCalendarSchema.safeParse(body)
    if (!result.success) {
      return apiValidationError(result.error)
    }

    const { calendarSlug } = result.data

    // Fetch the calendar page
    const calendarUrl = `https://luma.com/${calendarSlug}`
    const response = await fetch(calendarUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; Poktapok/1.0; +https://poktapok.com)',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    })

    if (!response.ok) {
      return apiError(
        `Failed to fetch calendar from Luma: ${response.status}`,
        {
          code: 'LUMA_FETCH_FAILED',
          status: 400,
        }
      )
    }

    const html = await response.text()

    // Extract events from JSON-LD
    const calendarEvents = extractCalendarEvents(html)

    if (calendarEvents.length === 0) {
      return apiSuccess({
        synced: 0,
        created: 0,
        updated: 0,
        events: [],
        message: 'No events found in calendar',
      })
    }

    // Process each event
    const results = {
      synced: 0,
      created: 0,
      updated: 0,
      errors: 0,
      events: [] as { slug: string; title: string; action: string }[],
    }

    for (const calendarEvent of calendarEvents) {
      try {
        // Check if event already exists by lumaSlug
        const existingEvent = await db
          .select()
          .from(events)
          .where(eq(events.lumaSlug, calendarEvent.slug))
          .limit(1)

        if (existingEvent.length > 0) {
          // Update existing event with new date info
          await db
            .update(events)
            .set({
              startDate: new Date(calendarEvent.startDate),
              endDate: calendarEvent.endDate
                ? new Date(calendarEvent.endDate)
                : null,
              location: calendarEvent.location || existingEvent[0].location,
              coordinates: calendarEvent.coordinates,
              updatedAt: new Date(),
            })
            .where(eq(events.id, existingEvent[0].id))

          results.updated++
          results.events.push({
            slug: calendarEvent.slug,
            title: existingEvent[0].title,
            action: 'updated',
          })
        } else {
          // Try to fetch full metadata for new event
          const metadata = await fetchEventMetadata(calendarEvent.slug)

          // Use metadata if available, otherwise use calendar event data
          const eventData = {
            title: metadata?.title || calendarEvent.title,
            description: metadata?.description || null,
            coverImage: metadata?.coverImage || calendarEvent.coverImage || null,
            lumaUrl: calendarEvent.url,
            lumaEventId: metadata?.lumaEventId || null,
            lumaSlug: calendarEvent.slug,
            eventType: metadata?.eventType || 'in-person' as const,
            startDate: new Date(calendarEvent.startDate),
            endDate: calendarEvent.endDate ? new Date(calendarEvent.endDate) : null,
            timezone: metadata?.timezone || 'America/Mexico_City',
            location: calendarEvent.location || metadata?.location || null,
            locationDetails: metadata?.locationDetails || null,
            hosts: metadata?.hosts || [],
            calendar: metadata?.calendar || calendarSlug,
            coordinates: calendarEvent.coordinates,
            isPublished: true, // Auto-publish synced events
            isFeatured: false,
          }

          // Create new event
          const newEvent = await db
            .insert(events)
            .values(eventData)
            .returning()

          results.created++
          results.events.push({
            slug: calendarEvent.slug,
            title: newEvent[0].title,
            action: 'created',
          })
        }

        results.synced++
      } catch (error) {
        console.error(`Error processing event ${calendarEvent.slug}:`, error)
        results.errors++
      }
    }

    return apiSuccess({
      synced: results.synced,
      created: results.created,
      updated: results.updated,
      errors: results.errors,
      events: results.events,
      message: `Synced ${results.synced} events (${results.created} created, ${results.updated} updated)`,
    })
  } catch (error) {
    console.error('Error syncing Luma calendar:', error)
    return apiError('Failed to sync calendar', {
      code: 'SYNC_ERROR',
      status: 500,
    })
  }
}
