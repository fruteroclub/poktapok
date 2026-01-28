import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { programs, programEnrollments, sessions, activityRelationshipsView } from '@/lib/db/schema'
import { eq, sql, count } from 'drizzle-orm'
import { requireAdmin, handleApiError, successResponse } from '@/lib/auth/middleware'

const updateProgramSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    slug: z.string().min(1).max(100).optional(),
    description: z.string().min(1).optional(),
    programType: z.enum(['cohort', 'evergreen']).optional(),
    startDate: z.string().datetime().nullable().optional(),
    endDate: z.string().datetime().nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate !== undefined && data.endDate !== undefined) {
        if (data.startDate && data.endDate) {
          return new Date(data.startDate) < new Date(data.endDate)
        }
      }
      return true
    },
    { message: 'End date must be after start date', path: ['endDate'] }
  )

/**
 * GET /api/admin/programs/:id - Get single program with statistics
 * @requires Admin authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request)

    const { id } = await params

    // Get program details
    const [program] = await db
      .select()
      .from(programs)
      .where(eq(programs.id, id))
      .limit(1)

    if (!program) {
      return handleApiError({ message: 'Program not found', code: 'NOT_FOUND' })
    }

    // Get enrollment statistics
    const enrollmentStats = await db
      .select({
        total: count(),
        active: sql<number>`COUNT(*) FILTER (WHERE ${programEnrollments.status} = 'enrolled')`,
        completed: sql<number>`COUNT(*) FILTER (WHERE ${programEnrollments.status} = 'completed')`,
        dropped: sql<number>`COUNT(*) FILTER (WHERE ${programEnrollments.status} = 'dropped')`,
      })
      .from(programEnrollments)
      .where(eq(programEnrollments.programId, id))

    // Get session statistics
    const sessionStats = await db
      .select({
        total: count(),
        completed: sql<number>`COUNT(*) FILTER (WHERE ${sessions.sessionDate} < NOW())`,
        upcoming: sql<number>`COUNT(*) FILTER (WHERE ${sessions.sessionDate} >= NOW())`,
      })
      .from(sessions)
      .where(eq(sessions.programId, id))

    // Get activity statistics (includes transitive via sessions)
    const activityStats = await db
      .select({
        total: count(),
        direct: sql<number>`COUNT(*) FILTER (WHERE ${activityRelationshipsView.directProgramId} = ${id})`,
        transitive: sql<number>`COUNT(*) FILTER (WHERE ${activityRelationshipsView.transitiveProgramId} = ${id} AND ${activityRelationshipsView.directProgramId} IS NULL)`,
      })
      .from(activityRelationshipsView)
      .where(eq(activityRelationshipsView.effectiveProgramId, id))

    // Calculate average completion rate (placeholder - needs actual completion tracking)
    const completionRate = enrollmentStats[0]?.total
      ? (Number(enrollmentStats[0].completed) / enrollmentStats[0].total) * 100
      : 0

    // Build response with stats
    const programWithStats = {
      ...program,
      stats: {
        totalEnrollments: enrollmentStats[0]?.total || 0,
        activeEnrollments: Number(enrollmentStats[0]?.active || 0),
        completedEnrollments: Number(enrollmentStats[0]?.completed || 0),
        droppedEnrollments: Number(enrollmentStats[0]?.dropped || 0),
        totalSessions: sessionStats[0]?.total || 0,
        completedSessions: Number(sessionStats[0]?.completed || 0),
        upcomingSessions: Number(sessionStats[0]?.upcoming || 0),
        totalActivities: activityStats[0]?.total || 0,
        directActivities: Number(activityStats[0]?.direct || 0),
        transitiveActivities: Number(activityStats[0]?.transitive || 0),
        averageCompletionRate: Math.round(completionRate),
      },
    }

    return successResponse({ program: programWithStats })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/admin/programs/:id - Update program
 * @requires Admin authentication
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request)

    const { id } = await params
    const body = await request.json()
    const result = updateProgramSchema.safeParse(body)

    if (!result.success) {
      return handleApiError(result.error)
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() }

    if (result.data.name !== undefined) updates.name = result.data.name
    if (result.data.slug !== undefined) updates.slug = result.data.slug
    if (result.data.description !== undefined) updates.description = result.data.description
    if (result.data.programType !== undefined) updates.programType = result.data.programType
    if (result.data.startDate !== undefined) {
      updates.startDate = result.data.startDate ? new Date(result.data.startDate) : null
    }
    if (result.data.endDate !== undefined) {
      updates.endDate = result.data.endDate ? new Date(result.data.endDate) : null
    }
    if (result.data.isActive !== undefined) updates.isActive = result.data.isActive

    const [program] = await db
      .update(programs)
      .set(updates)
      .where(eq(programs.id, id))
      .returning()

    if (!program) {
      return handleApiError({ message: 'Program not found', code: 'NOT_FOUND' })
    }

    return successResponse({ program })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/admin/programs/:id - Soft delete program
 * @requires Admin authentication
 * Sets isActive to false instead of hard delete
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request)

    const { id } = await params

    const [program] = await db
      .update(programs)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(programs.id, id))
      .returning()

    if (!program) {
      return handleApiError({ message: 'Program not found', code: 'NOT_FOUND' })
    }

    return successResponse({ program })
  } catch (error) {
    return handleApiError(error)
  }
}
