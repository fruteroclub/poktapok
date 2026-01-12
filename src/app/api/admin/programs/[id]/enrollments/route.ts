import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { programEnrollments, users } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { requireAdmin, handleApiError } from '@/lib/auth/middleware'
import { apiSuccess } from '@/lib/api/response'

const createEnrollmentSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(['enrolled', 'completed', 'dropped']).default('enrolled'),
  enrolledAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().nullable().optional(),
})

/**
 * GET /api/admin/programs/:id/enrollments - Get all enrollments for a program
 * @requires Admin authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request)

    const { id: programId } = await params

    // Get enrollments with user and profile data
    const enrollments = await db
      .select({
        id: programEnrollments.id,
        userId: programEnrollments.userId,
        programId: programEnrollments.programId,
        status: programEnrollments.status,
        enrolledAt: programEnrollments.enrolledAt,
        completedAt: programEnrollments.completedAt,
        createdAt: programEnrollments.createdAt,
        updatedAt: programEnrollments.updatedAt,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(programEnrollments)
      .innerJoin(users, eq(programEnrollments.userId, users.id))
      .where(eq(programEnrollments.programId, programId))
      .orderBy(desc(programEnrollments.enrolledAt))

    return apiSuccess({ enrollments })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/admin/programs/:id/enrollments - Create a new enrollment
 * @requires Admin authentication
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request)

    const { id: programId } = await params
    const body = await request.json()
    const result = createEnrollmentSchema.safeParse(body)

    if (!result.success) {
      return handleApiError(result.error)
    }

    // Check if enrollment already exists
    const existing = await db
      .select()
      .from(programEnrollments)
      .where(
        and(
          eq(programEnrollments.programId, programId),
          eq(programEnrollments.userId, result.data.userId)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      return handleApiError({
        message: 'User is already enrolled in this program',
        code: 'ENROLLMENT_EXISTS',
      })
    }

    // Create enrollment
    const [enrollment] = await db
      .insert(programEnrollments)
      .values({
        programId,
        userId: result.data.userId,
        status: result.data.status,
        enrolledAt: result.data.enrolledAt ? new Date(result.data.enrolledAt) : new Date(),
        completedAt: result.data.completedAt ? new Date(result.data.completedAt) : null,
      })
      .returning()

    return apiSuccess({ enrollment }, { message: 'Enrollment created successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
