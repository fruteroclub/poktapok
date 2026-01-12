import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sessions, programs, activities, sessionActivities, users, programEnrollments } from '@/lib/db/schema'
import { eq, and, inArray, desc, isNull } from 'drizzle-orm'
import { apiSuccess, apiErrors } from '@/lib/api/response'
import { getCurrentUser } from '@/lib/auth/helpers'
import type { SessionDetailResponse } from '@/types/api-v1'

/**
 * GET /api/sessions/:id
 * Session detail endpoint with conditional meeting URL access
 * Authentication optional - affects meeting URL visibility
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params

    // Check authentication (optional)
    const currentUser = await getCurrentUser()
    const userId = currentUser?.user?.id

    // Fetch session with program info
    const [sessionData] = await db
      .select({
        id: sessions.id,
        title: sessions.title,
        description: sessions.description,
        scheduledAt: sessions.sessionDate,
        meetingUrl: sessions.location,
        programId: sessions.programId,
        programName: programs.name,
        createdAt: sessions.createdAt,
      })
      .from(sessions)
      .leftJoin(programs, eq(sessions.programId, programs.id))
      .where(eq(sessions.id, sessionId))
      .limit(1)

    if (!sessionData) {
      return apiErrors.notFound('Session')
    }

    // Fetch linked activities
    const activitiesData = await db
      .select({
        id: activities.id,
        title: activities.title,
        description: activities.description,
        rewardPulpaAmount: activities.rewardPulpaAmount,
        difficulty: activities.difficulty,
        activityType: activities.activityType,
      })
      .from(activities)
      .innerJoin(sessionActivities, eq(activities.id, sessionActivities.activityId))
      .where(eq(sessionActivities.sessionId, sessionId))
      .orderBy(desc(activities.rewardPulpaAmount))

    // Determine if user can access meeting URL
    let userCanAccess = false
    let meetingUrl: string | null = null

    if (userId) {
      // Check if user is admin
      const [user] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)

      if (user?.role === 'admin') {
        userCanAccess = true
      } else if (sessionData.programId) {
        // Check if user is enrolled in the program
        const [enrollment] = await db
          .select({ id: programEnrollments.id })
          .from(programEnrollments)
          .where(
            and(
              eq(programEnrollments.programId, sessionData.programId),
              eq(programEnrollments.userId, userId),
              inArray(programEnrollments.status, ['enrolled', 'completed'])
            )
          )
          .limit(1)
        userCanAccess = !!enrollment
      } else {
        // Standalone session - accessible to all authenticated users
        userCanAccess = true
      }
    }

    // Only include meeting URL if user can access
    if (userCanAccess) {
      meetingUrl = sessionData.meetingUrl
    }

    const response: SessionDetailResponse = {
      session: {
        id: sessionData.id,
        title: sessionData.title,
        description: sessionData.description,
        scheduledAt: sessionData.scheduledAt.toISOString(),
        meetingUrl,
        programId: sessionData.programId,
        programName: sessionData.programName,
        createdAt: sessionData.createdAt.toISOString(),
      },
      activities: activitiesData.map((activity) => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        rewardPulpaAmount: activity.rewardPulpaAmount,
        difficulty: activity.difficulty,
        activityType: activity.activityType,
      })),
      userCanAccess,
    }

    return apiSuccess(response)
  } catch (error) {
    console.error('Error fetching session detail:', error)
    return apiErrors.internal()
  }
}
