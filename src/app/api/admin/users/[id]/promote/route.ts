import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users, programEnrollments } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth/middleware'
import { apiSuccess, apiError, apiValidationError, apiErrors } from '@/lib/api/response'

const promoteUserSchema = z.object({
  programEnrollmentId: z.string().uuid('Invalid enrollment ID'),
  promotionNotes: z.string().optional(),
})

/**
 * POST /api/admin/users/[id]/promote
 *
 * Promote a guest user to full member status
 *
 * Requirements:
 * - User must have 'guest' status
 * - Valid program enrollment must exist
 *
 * Updates:
 * - User accountStatus: guest → active
 * - Enrollment promotedAt timestamp
 * - Enrollment metadata with promotion details
 *
 * @param request - Contains programEnrollmentId and optional promotion notes
 * @returns {Object} { success: true, data: { user }, message: "..." }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await requireAdmin(request)

  try {
    const { id: userId } = await params

    // Parse and validate request body
    const body = await request.json()
    const result = promoteUserSchema.safeParse(body)

    if (!result.success) {
      return apiValidationError(result.error)
    }

    const { programEnrollmentId, promotionNotes } = result.data

    // Fetch user
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)

    if (!user) {
      return apiErrors.notFound('User')
    }

    if (user.accountStatus !== 'active') {
      return apiError('User must have active status', {
        code: 'INVALID_STATUS_FOR_PROMOTION',
        status: 400,
        details: { currentStatus: user.accountStatus },
      })
    }

    // Verify enrollment exists and belongs to user
    const [enrollment] = await db
      .select()
      .from(programEnrollments)
      .where(
        and(
          eq(programEnrollments.id, programEnrollmentId),
          eq(programEnrollments.userId, userId),
        ),
      )
      .limit(1)

    if (!enrollment) {
      return apiErrors.notFound('Program enrollment')
    }

    // Promote user in transaction
    await db.transaction(async (tx) => {
      // 1. Update user status to active
      await tx
        .update(users)
        .set({
          accountStatus: 'active',
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))

      // 2. Update enrollment with promotion timestamp and metadata
      const updatedMetadata = {
        ...(enrollment.metadata as object),
        promotedAt: new Date().toISOString(),
        promotedBy: authUser.id,
        promotionNotes: promotionNotes || null,
      }

      await tx
        .update(programEnrollments)
        .set({
          promotedAt: new Date(),
          metadata: updatedMetadata,
          updatedAt: new Date(),
        })
        .where(eq(programEnrollments.id, programEnrollmentId))
    })

    return apiSuccess(
      { user: { ...user, accountStatus: 'active' } },
      { message: 'User promoted to member successfully' },
    )
  } catch (error) {
    console.error('Error promoting user:', error)
    return apiErrors.internal()
  }
}
