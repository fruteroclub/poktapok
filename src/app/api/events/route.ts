import { NextResponse } from 'next/server'

/**
 * GET /api/events
 *
 * DEPRECATED: Use Convex queries instead.
 * This route is kept for backwards compatibility but returns empty.
 * 
 * Frontend should use:
 * - useUpcomingEvents() from '@/hooks/use-events-convex'
 * - usePublishedEvents() from '@/hooks/use-events-convex'
 */
export async function GET() {
  // Return empty array for backwards compatibility
  return NextResponse.json({
    success: true,
    data: {
      events: [],
    },
    message: 'DEPRECATED: Use Convex queries instead',
  })
}
