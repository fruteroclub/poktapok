import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sessions } from '@/lib/db/schema'
import { eq, gte, desc, and } from 'drizzle-orm'
import { apiSuccess, apiErrors } from '@/lib/api/response'
import { getUserFromRequest } from '@/lib/auth/middleware'

/**
 * GET /api/programs/:id/sessions
 * Get upcoming sessions for a program
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getUserFromRequest(request)
  if (!authUser) {
    return apiErrors.unauthorized()
  }

  const { id: programId } = await params
  const url = new URL(request.url)
  const upcoming = url.searchParams.get('upcoming') === 'true'

  try {
    const whereConditions = [eq(sessions.programId, programId)]

    if (upcoming) {
      whereConditions.push(gte(sessions.sessionDate, new Date()))
    }

    const sessionsList = await db
      .select({
        id: sessions.id,
        title: sessions.title,
        description: sessions.description,
        sessionDate: sessions.sessionDate,
        sessionType: sessions.sessionType,
        location: sessions.location,
        programId: sessions.programId,
      })
      .from(sessions)
      .where(and(...whereConditions))
      .orderBy(desc(sessions.sessionDate))
      .limit(10)

    return apiSuccess({ sessions: sessionsList })
  } catch (error) {
    console.error('Error fetching program sessions:', error)
    return apiErrors.internal()
  }
}
