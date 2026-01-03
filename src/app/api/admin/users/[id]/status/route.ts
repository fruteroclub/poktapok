import { NextRequest } from 'next/server'
import { apiSuccess, apiError, apiErrors } from '@/lib/api/response'
import { requireAdmin, handleApiError } from '@/lib/auth/middleware'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { z } from 'zod'

// Validation schema
const updateStatusSchema = z.object({
  accountStatus: z.enum(['active', 'suspended', 'banned']),
  reason: z.string().optional(),
})

/**
 * PATCH /api/admin/users/[id]/status
 *
 * Update a user's account status with validation
 *
 * Validation Rules:
 * - Reason required for suspend/ban
 * - Cannot change your own status
 * - Cannot modify other admins
 * - Admin role required
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const currentUser = await requireAdmin(request)

    // Await params (Next.js 16 requirement)
    const { id } = await params

    // Parse and validate request body
    const body = await request.json()
    const result = updateStatusSchema.safeParse(body)

    if (!result.success) {
      return apiError('Invalid request body', {
        status: 400,
        details: result.error.issues,
      })
    }

    const { accountStatus, reason } = result.data

    // Validation: Reason required for suspend/ban
    if (
      (accountStatus === 'suspended' || accountStatus === 'banned') &&
      !reason
    ) {
      return apiError('Reason is required for suspending or banning users', {
        status: 400,
      })
    }

    // Validation: Moderators cannot ban
    if (currentUser.role === 'moderator' && accountStatus === 'banned') {
      return apiError('Moderators cannot ban users', { status: 403 })
    }

    // Get target user
    const targetUsers = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1)

    if (targetUsers.length === 0) {
      return apiErrors.notFound('User')
    }

    const targetUser = targetUsers[0]

    // Validation: Cannot change your own status
    if (targetUser.id === currentUser.id) {
      return apiError('Cannot change your own account status', { status: 403 })
    }

    // Validation: Cannot modify other admins
    if (targetUser.role === 'admin') {
      return apiError('Cannot modify admin accounts', { status: 403 })
    }

    const oldStatus = targetUser.accountStatus

    // Update user status
    await db
      .update(users)
      .set({
        accountStatus,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))

    // Log the change (basic console log for now, audit table in Phase 2)
    console.log(
      `Status change: User ${id} (${targetUser.username}) changed from ${oldStatus} to ${accountStatus} by ${currentUser.username}${reason ? ` - Reason: ${reason}` : ''}`
    )

    return apiSuccess({
      userId: id,
      oldStatus,
      newStatus: accountStatus,
      reason: reason || null,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to update user status:', error)
    return handleApiError(error)
  }
}
