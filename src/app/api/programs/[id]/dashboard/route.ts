import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  programEnrollments,
  programs,
  applications,
  attendance,
  activitySubmissions,
  users,
} from '@/lib/db/schema'
import { eq, and, count, sql } from 'drizzle-orm'
import { apiSuccess, apiErrors } from '@/lib/api/response'
import { getUserFromRequest } from '@/lib/auth/middleware'

/**
 * GET /api/programs/:id/dashboard
 * Get user's program dashboard data
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

  try {
    // Get enrollment
    const [enrollment] = await db
      .select()
      .from(programEnrollments)
      .where(
        and(
          eq(programEnrollments.userId, authUser.id),
          eq(programEnrollments.programId, programId),
        ),
      )
      .limit(1)

    if (!enrollment) {
      return apiErrors.notFound('Program enrollment')
    }

    // Get application (for goal)
    const [application] = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.userId, authUser.id),
          eq(applications.programId, programId),
        ),
      )
      .limit(1)

    // Get program details
    const [program] = await db
      .select()
      .from(programs)
      .where(eq(programs.id, programId))
      .limit(1)

    if (!program) {
      return apiErrors.notFound('Program')
    }

    // Get user details
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        accountStatus: users.accountStatus,
      })
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1)

    // Get participation statistics
    const [attendanceStats] = await db
      .select({
        total: count(),
        present: sql<number>`SUM(CASE WHEN ${attendance.status} = 'present' THEN 1 ELSE 0 END)`,
      })
      .from(attendance)
      .where(eq(attendance.userId, authUser.id))

    const [submissionStats] = await db
      .select({
        total: count(),
        approved: sql<number>`SUM(CASE WHEN ${activitySubmissions.status} = 'approved' THEN 1 ELSE 0 END)`,
        pending: sql<number>`SUM(CASE WHEN ${activitySubmissions.status} = 'pending' THEN 1 ELSE 0 END)`,
      })
      .from(activitySubmissions)
      .where(eq(activitySubmissions.userId, authUser.id))

    // Calculate average quality score from approved submissions
    const [qualityStats] = await db
      .select({
        avgScore: sql<number>`COALESCE(AVG(CAST(${activitySubmissions.metadata}->>'score' AS NUMERIC)), 0)`,
      })
      .from(activitySubmissions)
      .where(
        and(
          eq(activitySubmissions.userId, authUser.id),
          eq(activitySubmissions.status, 'approved'),
        ),
      )

    return apiSuccess({
      enrollment: {
        id: enrollment.id,
        status: enrollment.status,
        enrolledAt: enrollment.createdAt,
        promotedAt: enrollment.promotedAt,
      },
      application: application
        ? {
            id: application.id,
            goal: application.goal,
            status: application.status,
          }
        : null,
      program: {
        id: program.id,
        name: program.name,
        description: program.description,
        programType: program.programType,
        startDate: program.startDate,
        endDate: program.endDate,
      },
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        accountStatus: user.accountStatus,
      },
      stats: {
        attendance: {
          total: attendanceStats?.total || 0,
          present: Number(attendanceStats?.present) || 0,
        },
        submissions: {
          total: submissionStats?.total || 0,
          approved: Number(submissionStats?.approved) || 0,
          pending: Number(submissionStats?.pending) || 0,
        },
        qualityScore: Number(qualityStats?.avgScore) || 0,
      },
    })
  } catch (error) {
    console.error('Error fetching program dashboard:', error)
    return apiErrors.internal()
  }
}
