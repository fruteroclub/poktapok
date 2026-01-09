import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sessions } from '@/lib/db/schema'
import { eq, gte, desc } from 'drizzle-orm'
import { apiSuccess, apiErrors } from '@/lib/api/response'
import { getUserFromRequest } from '@/lib/auth/middleware'

/**
 * GET /api/programs/:id/sessions
 * Get upcoming sessions for a program
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authUser = await getUserFromRequest(request)
  if (!authUser) {
    return apiErrors.unauthorized()
  }

  const programId = params.id
  const url = new URL(request.url)
  const upcoming = url.searchParams.get('upcoming') === 'true'

  try {
    let query = db
      .select({
        id: sessions.id,
        title: sessions.title,
        description: sessions.description,
        sessionDate: sessions.sessionDate,
        sessionType: sessions.sessionType,
        location: sessions.location,
        meetingUrl: sessions.meetingUrl,
        programId: sessions.programId,
      })
      .from(sessions)
      .where(eq(sessions.programId, programId))

    if (upcoming) {
      // Only get future sessions
      query = query.where(gte(sessions.sessionDate, new Date().toISOString()))
    }

    const sessionsList = await query.orderBy(desc(sessions.sessionDate)).limit(10)

    return apiSuccess({ sessions: sessionsList })
  } catch (error) {
    console.error('Error fetching program sessions:', error)
    return apiErrors.internal()
  }
}
