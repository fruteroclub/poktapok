import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { applications, users, programEnrollments } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth/middleware'
import { apiSuccess, apiError, apiValidationError, apiErrors } from '@/lib/api/response'

const approveApplicationSchema = z.object({
  decision: z.enum(['approve_guest', 'approve_member', 'reject']),
  reviewNotes: z.string().optional(),
})

/**
 * POST /api/admin/applications/[id]/approve
 *
 * Approve or reject a pending application
 *
 * Decisions:
 * - approve_guest: User becomes 'guest' (limited access, can be promoted later)
 * - approve_member: User becomes 'active' (full member access)
 * - reject: User becomes 'rejected'
 *
 * Transaction flow:
 * 1. Update application status
 * 2. Update user account status
 * 3. Create program enrollment (if approved)
 *
 * @param request - Contains decision and optional review notes
 * @param params - Application ID
 * @returns {Object} { success: true, data: { application }, message: "..." }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await requireAdmin(request)

  try {
    const { id: applicationId } = await params

    // Parse and validate request body
    const body = await request.json()
    const result = approveApplicationSchema.safeParse(body)

    if (!result.success) {
      return apiValidationError(result.error)
    }

    const { decision, reviewNotes } = result.data

    // Fetch application
    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, applicationId))
      .limit(1)

    if (!application) {
      return apiErrors.notFound('Application')
    }

    if (application.status !== 'pending') {
      return apiError('Application has already been reviewed', {
        code: 'APPLICATION_ALREADY_REVIEWED',
        status: 400,
        details: { currentStatus: application.status },
      })
    }

    // Determine new status based on decision
    const statusMap = {
      approve_guest: 'approved' as const,
      approve_member: 'approved' as const,
      reject: 'rejected' as const,
    }

    const accountStatusMap = {
      approve_guest: 'active' as const, // Both guest and member are "active" users
      approve_member: 'active' as const,
      reject: 'suspended' as const, // Rejected applications result in suspended accounts
    }

    // Process approval/rejection in transaction
    await db.transaction(async (tx) => {
      // 1. Update application
      await tx
        .update(applications)
        .set({
          status: statusMap[decision],
          reviewedByUserId: authUser.id,
          reviewedAt: new Date(),
          reviewNotes: reviewNotes || null,
          updatedAt: new Date(),
        })
        .where(eq(applications.id, applicationId))

      // 2. Update user account status
      await tx
        .update(users)
        .set({
          accountStatus: accountStatusMap[decision],
          updatedAt: new Date(),
        })
        .where(eq(users.id, application.userId))

      // 3. If approved, create program enrollment
      if (decision === 'approve_guest' || decision === 'approve_member') {
        if (application.programId) {
          await tx.insert(programEnrollments).values({
            userId: application.userId,
            programId: application.programId,
            applicationId: application.id,
            status: 'enrolled',
            enrolledAt: new Date(),
          })
        }
      }
    })

    const actionMessage =
      decision === 'reject'
        ? 'Application rejected'
        : decision === 'approve_guest'
          ? 'Application approved - User is now a Guest'
          : 'Application approved - User is now a Member'

    return apiSuccess({ application }, { message: actionMessage })
  } catch (error) {
    console.error('Error approving application:', error)
    return apiErrors.internal()
  }
}
