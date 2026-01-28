import { NextRequest } from 'next/server'
import { apiSuccess, apiError, apiValidationError } from '@/lib/api/response'
import { z } from 'zod'

// Request schema
const fetchEventSchema = z.object({
  url: z.string().url('Invalid URL format'),
})

// Response type for lu.ma event metadata
export interface LumaEventMetadata {
  title: string
  description: string | null
  coverImage: string | null
  lumaEventId: string | null
  lumaSlug: string
  eventType: 'in-person' | 'virtual' | 'hybrid'
  startDate: string
  endDate: string | null
  timezone: string
  location: string | null
  locationDetails: string | null
  locationUrl: string | null
  coordinates: { lat: number; lng: number } | null
  hosts: { name: string; avatarUrl?: string; handle?: string }[]
  calendar: string | null
  registrationCount: number | null
  maxCapacity: number | null
  registrationType: 'free' | 'paid' | 'approval'
}

/**
 * Extract lu.ma slug from URL
 * Supports formats:
 * - https://lu.ma/xyz
 * - https://luma.com/xyz
 * - lu.ma/xyz
 */
function extractLumaSlug(url: string): string | null {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?lu\.ma\/([a-zA-Z0-9-_]+)/,
    /(?:https?:\/\/)?(?:www\.)?luma\.com\/([a-zA-Z0-9-_]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Parse event metadata from HTML content
 */
function parseEventMetadata(
  html: string,
  slug: string
): Partial<LumaEventMetadata> {
  const metadata: Partial<LumaEventMetadata> = {
    lumaSlug: slug,
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

  // Extract cover image - try multiple sources
  // 1. First try to find lumacdn event-covers URL (highest quality)
  const lumaCdnMatch = html.match(
    /https:\/\/images\.lumacdn\.com\/[^"'\s]*event-covers[^"'\s]*/i
  )
  // 2. Then try og:image
  const ogImageMatch = html.match(
    /<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i
  )
  // 3. Also check for twitter:image
  const twitterImageMatch = html.match(
    /<meta[^>]*name="twitter:image"[^>]*content="([^"]*)"[^>]*>/i
  )

  // Prefer lumacdn event-covers, then og:image, then twitter:image
  if (lumaCdnMatch?.[0]) {
    // Clean up the URL and use a better quality version
    let coverUrl = lumaCdnMatch[0]
    // Replace with higher quality params if it has CDN params
    if (coverUrl.includes('cdn-cgi/image/')) {
      coverUrl = coverUrl.replace(
        /width=\d+,height=\d+/,
        'width=800,height=450'
      )
    }
    metadata.coverImage = coverUrl
  } else {
    metadata.coverImage = ogImageMatch?.[1] || twitterImageMatch?.[1] || null
  }

  // Try to extract event ID from various sources in the HTML
  const eventIdMatch = html.match(/evt-[a-zA-Z0-9]+/)
  metadata.lumaEventId = eventIdMatch?.[0] || null

  // Extract structured data (JSON-LD)
  const jsonLdMatch = html.match(
    /<script[^>]*type="application\/ld\+json"[^>]*>([^<]*)<\/script>/i
  )
  if (jsonLdMatch?.[1]) {
    try {
      const jsonLd = JSON.parse(jsonLdMatch[1])
      if (jsonLd['@type'] === 'Event') {
        metadata.startDate = jsonLd.startDate
        metadata.endDate = jsonLd.endDate || null
        metadata.location = jsonLd.location?.address?.streetAddress || null

        if (jsonLd.location?.geo) {
          metadata.coordinates = {
            lat: parseFloat(jsonLd.location.geo.latitude),
            lng: parseFloat(jsonLd.location.geo.longitude),
          }
        }
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  // Extract date/time from data attributes or text content
  const dateMatch = html.match(
    /datetime="([^"]+)"|data-start-time="([^"]+)"/i
  )
  if (dateMatch && !metadata.startDate) {
    metadata.startDate = dateMatch[1] || dateMatch[2]
  }

  // Extract timezone
  const tzMatch = html.match(/timezone["\s:]+["']?([A-Za-z_/]+)["']?/i)
  metadata.timezone = tzMatch?.[1] || 'America/Mexico_City'

  // Determine event type based on location info
  if (metadata.location) {
    const isOnline =
      metadata.location.toLowerCase().includes('online') ||
      metadata.location.toLowerCase().includes('virtual') ||
      metadata.location.toLowerCase().includes('zoom')
    metadata.eventType = isOnline ? 'virtual' : 'in-person'
  } else {
    metadata.eventType = 'in-person'
  }

  // Default registration type
  metadata.registrationType = 'free'

  // Extract host info from page content
  const hostMatch = html.match(/hosted by[^<]*<[^>]*>([^<]+)/i)
  if (hostMatch) {
    metadata.hosts = [{ name: hostMatch[1].trim() }]
  } else {
    metadata.hosts = []
  }

  // Extract calendar/organizer name
  const calendarMatch = html.match(
    /data-calendar="([^"]+)"|calendar["\s:]+["']([^"']+)["']/i
  )
  metadata.calendar = calendarMatch?.[1] || calendarMatch?.[2] || null

  return metadata
}

/**
 * POST /api/luma/fetch-event
 * Fetch and parse event metadata from a lu.ma URL
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    const result = fetchEventSchema.safeParse(body)
    if (!result.success) {
      return apiValidationError(result.error)
    }

    const { url } = result.data

    // Extract slug from URL
    const slug = extractLumaSlug(url)
    if (!slug) {
      return apiError('Invalid lu.ma URL. Expected format: lu.ma/xyz or luma.com/xyz', {
        code: 'INVALID_LUMA_URL',
        status: 400,
      })
    }

    // Fetch the lu.ma page
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

    if (!response.ok) {
      return apiError(`Failed to fetch event from lu.ma: ${response.status}`, {
        code: 'LUMA_FETCH_FAILED',
        status: 400,
      })
    }

    const html = await response.text()

    // Parse metadata from HTML
    const metadata = parseEventMetadata(html, slug)

    // Set default startDate if not found
    if (!metadata.startDate) {
      metadata.startDate = new Date().toISOString()
    }

    return apiSuccess({
      ...metadata,
      lumaUrl,
    } as LumaEventMetadata & { lumaUrl: string })
  } catch (error) {
    console.error('Error fetching lu.ma event:', error)
    return apiError('Failed to fetch event metadata', {
      code: 'FETCH_ERROR',
      status: 500,
    })
  }
}
