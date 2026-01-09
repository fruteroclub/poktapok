import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { sessions, programs } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { requireAdmin, handleApiError, successResponse } from '@/lib/auth/middleware'

const createSessionSchema = z.object({
  programId: z.string().uuid('Invalid program ID'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().optional(),
  sessionType: z.enum(['in-person', 'virtual', 'hybrid']),
  sessionDate: z.string().datetime('Invalid date format'),
  duration: z.string().optional(),
  location: z.string().optional(),
  meetingUrl: z.string().url('Invalid meeting URL').optional(),
  instructors: z.array(z.string()).optional(),
  materials: z
    .array(
      z.object({
        title: z.string(),
        url: z.string().url('Invalid material URL'),
        type: z.string(),
      })
    )
    .optional(),
  isActive: z.boolean().default(true),
})

/**
 * POST /api/admin/sessions - Create a new session
 * @requires Admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)

    const body = await request.json()
    const result = createSessionSchema.safeParse(body)

    if (!result.success) {
      return handleApiError(result.error)
    }

    // Verify program exists
    const [program] = await db
      .select()
      .from(programs)
      .where(eq(programs.id, result.data.programId))
      .limit(1)

    if (!program) {
      return handleApiError({ message: 'Program not found', code: 'NOT_FOUND' })
    }

    const [session] = await db
      .insert(sessions)
      .values({
        programId: result.data.programId,
        title: result.data.title,
        description: result.data.description || null,
        sessionType: result.data.sessionType,
        sessionDate: new Date(result.data.sessionDate),
        duration: result.data.duration || null,
        location: result.data.location || null,
        meetingUrl: result.data.meetingUrl || null,
        instructors: result.data.instructors || [],
        materials: result.data.materials || [],
        isActive: result.data.isActive,
      })
      .returning()

    return successResponse({ session }, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * GET /api/admin/sessions - Get all sessions with activity and attendance counts
 * @requires Admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const sessionsWithCounts = await db
      .select({
        id: sessions.id,
        programId: sessions.programId,
        title: sessions.title,
        description: sessions.description,
        sessionType: sessions.sessionType,
        sessionDate: sessions.sessionDate,
        duration: sessions.duration,
        location: sessions.location,
        meetingUrl: sessions.meetingUrl,
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
      .orderBy(sessions.sessionDate)

    return successResponse({ sessions: sessionsWithCounts })
  } catch (error) {
    return handleApiError(error)
  }
}
