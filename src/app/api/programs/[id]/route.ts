import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { programs, programEnrollments, sessions as sessionsTable, sessionActivities, activities, programActivities } from '@/lib/db/schema'
import { eq, count, asc, desc } from 'drizzle-orm'
import { apiSuccess, apiErrors } from '@/lib/api/response'
import type { PublicProgramResponse } from '@/types/api-v1'

/**
 * GET /api/programs/:id
 * Public program detail endpoint
 * No authentication required - returns public information only
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: programId } = await params

    // Fetch program data
    const [program] = await db
      .select({
        id: programs.id,
        name: programs.name,
        description: programs.description,
        type: programs.programType,
        isActive: programs.isActive,
        createdAt: programs.createdAt,
        metadata: programs.metadata,
      })
      .from(programs)
      .where(eq(programs.id, programId))
      .limit(1)

    if (!program) {
      return apiErrors.notFound('Program')
    }

    // Fetch enrollment count
    const [enrollmentData] = await db
      .select({ count: count() })
      .from(programEnrollments)
      .where(eq(programEnrollments.programId, programId))

    // Fetch sessions with activity count
    const sessionsData = await db
      .select({
        id: sessionsTable.id,
        title: sessionsTable.title,
        description: sessionsTable.description,
        scheduledAt: sessionsTable.sessionDate,
        activityCount: count(sessionActivities.activityId),
      })
      .from(sessionsTable)
      .leftJoin(sessionActivities, eq(sessionsTable.id, sessionActivities.sessionId))
      .where(eq(sessionsTable.programId, programId))
      .groupBy(sessionsTable.id)
      .orderBy(asc(sessionsTable.sessionDate))

    // Fetch activities
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
      .innerJoin(programActivities, eq(activities.id, programActivities.activityId))
      .where(eq(programActivities.programId, programId))
      .orderBy(desc(activities.rewardPulpaAmount))

    // Count total sessions and activities
    const totalSessions = sessionsData.length
    const totalActivities = activitiesData.length

    const response: PublicProgramResponse = {
      program: {
        id: program.id,
        name: program.name,
        description: program.description,
        type: program.type as 'cohort' | 'evergreen',
        isActive: program.isActive,
        createdAt: program.createdAt.toISOString(),
        metadata: program.metadata as Record<string, unknown>,
      },
      stats: {
        totalEnrollments: enrollmentData?.count || 0,
        totalSessions,
        totalActivities,
      },
      sessions: sessionsData.map((session) => ({
        id: session.id,
        title: session.title,
        description: session.description,
        scheduledAt: session.scheduledAt.toISOString(),
        activityCount: session.activityCount,
      })),
      activities: activitiesData.map((activity) => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        rewardPulpaAmount: activity.rewardPulpaAmount,
        difficulty: activity.difficulty,
        activityType: activity.activityType,
      })),
    }

    return apiSuccess(response)
  } catch (error) {
    console.error('Error fetching public program:', error)
    return apiErrors.internal()
  }
}
