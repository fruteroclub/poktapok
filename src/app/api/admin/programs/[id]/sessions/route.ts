import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sessions } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { requireAdmin, handleApiError, successResponse } from '@/lib/auth/middleware'

/**
 * GET /api/admin/programs/:id/sessions - Get all sessions for a program
 * @requires Admin authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request)

    const { id } = await params

    const programSessions = await db
      .select({
        id: sessions.id,
        programId: sessions.programId,
        title: sessions.title,
        description: sessions.description,
        sessionType: sessions.sessionType,
        sessionDate: sessions.sessionDate,
        duration: sessions.duration,
        location: sessions.location,
        instructors: sessions.instructors,
        materials: sessions.materials,
        isActive: sessions.isActive,
        createdAt: sessions.createdAt,
        updatedAt: sessions.updatedAt,
        metadata: sessions.metadata,
        activityCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM session_activities
          WHERE session_activities.session_id = ${sessions.id}
        )`,
        attendanceCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM attendance
          WHERE attendance.session_id = ${sessions.id}
        )`,
      })
      .from(sessions)
      .where(eq(sessions.programId, id))
      .orderBy(sessions.sessionDate)

    return successResponse({ sessions: programSessions })
  } catch (error) {
    return handleApiError(error)
  }
}
