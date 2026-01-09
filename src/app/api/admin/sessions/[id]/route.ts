import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { sessions, programs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin, handleApiError, successResponse } from '@/lib/auth/middleware'

const updateSessionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  sessionType: z.enum(['in-person', 'virtual', 'hybrid']).optional(),
  sessionDate: z.string().datetime().optional(),
  duration: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  meetingUrl: z.string().url().nullable().optional(),
  instructors: z.array(z.string()).nullable().optional(),
  materials: z
    .array(
      z.object({
        title: z.string(),
        url: z.string().url(),
        type: z.string(),
      })
    )
    .nullable()
    .optional(),
  isActive: z.boolean().optional(),
})

/**
 * GET /api/admin/sessions/:id - Get session details with program info
 * @requires Admin authentication
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request)

    const [sessionWithProgram] = await db
      .select({
        session: sessions,
        program: {
          id: programs.id,
          name: programs.name,
          slug: programs.slug,
        },
      })
      .from(sessions)
      .innerJoin(programs, eq(sessions.programId, programs.id))
      .where(eq(sessions.id, params.id))
      .limit(1)

    if (!sessionWithProgram) {
      return handleApiError({ message: 'Session not found', code: 'NOT_FOUND' })
    }

    return successResponse({
      session: {
        ...sessionWithProgram.session,
        program: sessionWithProgram.program,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/admin/sessions/:id - Update session
 * @requires Admin authentication
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request)

    const body = await request.json()
    const result = updateSessionSchema.safeParse(body)

    if (!result.success) {
      return handleApiError(result.error)
    }

    // Check session exists
    const [existingSession] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, params.id))
      .limit(1)

    if (!existingSession) {
      return handleApiError({ message: 'Session not found', code: 'NOT_FOUND' })
    }

    const updateData: Record<string, unknown> = {}

    if (result.data.title !== undefined) updateData.title = result.data.title
    if (result.data.description !== undefined) updateData.description = result.data.description
    if (result.data.sessionType !== undefined) updateData.sessionType = result.data.sessionType
    if (result.data.sessionDate !== undefined)
      updateData.sessionDate = new Date(result.data.sessionDate)
    if (result.data.duration !== undefined) updateData.duration = result.data.duration
    if (result.data.location !== undefined) updateData.location = result.data.location
    if (result.data.meetingUrl !== undefined) updateData.meetingUrl = result.data.meetingUrl
    if (result.data.instructors !== undefined) updateData.instructors = result.data.instructors
    if (result.data.materials !== undefined) updateData.materials = result.data.materials
    if (result.data.isActive !== undefined) updateData.isActive = result.data.isActive

    const [updatedSession] = await db
      .update(sessions)
      .set(updateData)
      .where(eq(sessions.id, params.id))
      .returning()

    return successResponse({ session: updatedSession })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/admin/sessions/:id - Delete session (hard delete with cascade)
 * @requires Admin authentication
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request)

    const [deletedSession] = await db
      .delete(sessions)
      .where(eq(sessions.id, params.id))
      .returning()

    if (!deletedSession) {
      return handleApiError({ message: 'Session not found', code: 'NOT_FOUND' })
    }

    return successResponse({ session: deletedSession })
  } catch (error) {
    return handleApiError(error)
  }
}
