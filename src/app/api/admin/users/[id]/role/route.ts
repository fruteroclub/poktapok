import { NextRequest } from 'next/server'
import { apiSuccess, apiError, apiErrors } from '@/lib/api/response'
import { requireAdmin, handleApiError } from '@/lib/auth/middleware'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { z } from 'zod'

// Validation schema
const updateRoleSchema = z.object({
  role: z.enum(['member', 'moderator', 'admin']),
  reason: z.string().optional(),
})

/**
 * PATCH /api/admin/users/[id]/role
 *
 * Update a user's role with validation
 *
 * Validation Rules:
 * - Cannot change your own role
 * - Moderators cannot promote to admin
 * - Admin role required to make changes
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
    const result = updateRoleSchema.safeParse(body)

    if (!result.success) {
      return apiError('Invalid request body', {
        status: 400,
        details: result.error.issues,
      })
    }

    const { role, reason } = result.data

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

    // Validation: Cannot change your own role
    if (targetUser.id === currentUser.id) {
      return apiError('Cannot change your own role', { status: 403 })
    }

    // Validation: Moderators cannot promote to admin
    if (currentUser.role === 'moderator' && role === 'admin') {
      return apiError('Moderators cannot promote users to admin', {
        status: 403,
      })
    }

    const oldRole = targetUser.role

    // Update user role
    await db
      .update(users)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))

    // Log the change (basic console log for now, audit table in Phase 2)
    console.log(
      `Role change: User ${id} (${targetUser.username}) changed from ${oldRole} to ${role} by ${currentUser.username}${reason ? ` - Reason: ${reason}` : ''}`
    )

    return apiSuccess({
      userId: id,
      oldRole,
      newRole: role,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to update user role:', error)
    return handleApiError(error)
  }
}
