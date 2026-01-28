import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { programEnrollments } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin, handleApiError } from '@/lib/auth/middleware'
import { apiSuccess } from '@/lib/api/response'

const updateEnrollmentSchema = z.object({
  status: z.enum(['enrolled', 'completed', 'dropped']).optional(),
  completedAt: z.string().datetime().nullable().optional(),
})

/**
 * PATCH /api/admin/programs/:id/enrollments/:enrollmentId - Update enrollment
 * @requires Admin authentication
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; enrollmentId: string }> }
) {
  try {
    await requireAdmin(request)

    const { enrollmentId } = await params
    const body = await request.json()
    const result = updateEnrollmentSchema.safeParse(body)

    if (!result.success) {
      return handleApiError(result.error)
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() }

    if (result.data.status !== undefined) {
      updates.status = result.data.status

      // Auto-set completedAt timestamp if status is completed
      if (result.data.status === 'completed' && result.data.completedAt === undefined) {
        updates.completedAt = new Date()
      }
    }

    if (result.data.completedAt !== undefined) {
      updates.completedAt = result.data.completedAt ? new Date(result.data.completedAt) : null
    }

    const [enrollment] = await db
      .update(programEnrollments)
      .set(updates)
      .where(eq(programEnrollments.id, enrollmentId))
      .returning()

    if (!enrollment) {
      return handleApiError({ message: 'Enrollment not found', code: 'NOT_FOUND' })
    }

    return apiSuccess({ enrollment }, { message: 'Enrollment updated successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/admin/programs/:id/enrollments/:enrollmentId - Delete enrollment
 * @requires Admin authentication
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; enrollmentId: string }> }
) {
  try {
    await requireAdmin(request)

    const { enrollmentId } = await params

    const [enrollment] = await db
      .delete(programEnrollments)
      .where(eq(programEnrollments.id, enrollmentId))
      .returning()

    if (!enrollment) {
      return handleApiError({ message: 'Enrollment not found', code: 'NOT_FOUND' })
    }

    return apiSuccess({ enrollment }, { message: 'Enrollment deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
