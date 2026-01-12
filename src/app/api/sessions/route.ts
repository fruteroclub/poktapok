import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sessions, programs, sessionActivities } from '@/lib/db/schema'
import { eq, gte, isNull, count, and, asc, sql } from 'drizzle-orm'
import { apiSuccess, apiErrors, apiValidationError } from '@/lib/api/response'
import type { PublicSessionsResponse } from '@/types/api-v1'
import { z } from 'zod'

const SessionQuerySchema = z.object({
  upcoming: z.string().optional().transform((val) => val === 'true'),
  programId: z.string().uuid().optional(),
  standalone: z.string().optional().transform((val) => val === 'true'),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => {
    const parsed = val ? parseInt(val, 10) : 20
    return Math.min(parsed, 50) // Max 50 items per page
  }),
})

/**
 * GET /api/sessions
 * Public sessions list endpoint with filtering and pagination
 * No authentication required
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryResult = SessionQuerySchema.safeParse({
      upcoming: searchParams.get('upcoming') ?? undefined,
      programId: searchParams.get('programId') ?? undefined,
      standalone: searchParams.get('standalone') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    })

    if (!queryResult.success) {
      return apiValidationError(queryResult.error)
    }

    const { upcoming, programId, standalone, page, limit } = queryResult.data

    // Build base query
    const baseQuery = db
      .select({
        id: sessions.id,
        title: sessions.title,
        description: sessions.description,
        scheduledAt: sessions.sessionDate,
        programId: sessions.programId,
        programName: programs.name,
        activityCount: count(sessionActivities.activityId),
        createdAt: sessions.createdAt,
      })
      .from(sessions)
      .leftJoin(programs, eq(sessions.programId, programs.id))
      .leftJoin(sessionActivities, eq(sessions.id, sessionActivities.sessionId))
      .$dynamic()

    // Apply filters
    const conditions = []

    if (upcoming) {
      conditions.push(gte(sessions.sessionDate, new Date()))
    }

    if (programId) {
      conditions.push(eq(sessions.programId, programId))
    }

    if (standalone) {
      conditions.push(isNull(sessions.programId))
    }

    const where = conditions.length > 1 ? and(...conditions) : conditions[0]

    // Fetch sessions with pagination
    const sessionsData = await baseQuery
      .where(where)
      .groupBy(sessions.id, programs.name)
      .orderBy(asc(sessions.sessionDate))
      .limit(limit)
      .offset((page - 1) * limit)

    // Count total sessions for pagination
    const [totalCount] = await db
      .select({ count: count() })
      .from(sessions)
      .where(where)

    const total = totalCount?.count || 0
    const totalPages = Math.ceil(total / limit)
    const hasMore = page < totalPages

    const response: PublicSessionsResponse = {
      sessions: sessionsData.map((session) => ({
        id: session.id,
        title: session.title,
        description: session.description,
        scheduledAt: session.scheduledAt.toISOString(),
        programId: session.programId,
        programName: session.programName,
        activityCount: session.activityCount,
        createdAt: session.createdAt.toISOString(),
      })),
    }

    return apiSuccess(response, {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching public sessions:', error)
    return apiErrors.internal()
  }
}
