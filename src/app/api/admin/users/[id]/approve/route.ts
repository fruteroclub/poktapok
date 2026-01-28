import { NextRequest } from 'next/server'
import { requireAdmin, handleApiError } from '@/lib/auth/middleware'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { apiSuccess, apiErrors } from '@/lib/api/response'

/**
 * POST /api/admin/users/[id]/approve
 *
 * Approves a pending user by updating their accountStatus to 'active'.
 * Admin only endpoint.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    await requireAdmin(request)

    // Await params (Next.js 16 requirement)
    const { id } = await params

      // Validate user exists and is pending
      const userResults = await db
        .select({
          id: users.id,
          accountStatus: users.accountStatus,
        })
        .from(users)
        .where(eq(users.id, id))
        .limit(1)

      if (userResults.length === 0) {
        return apiErrors.notFound('User')
      }

      const user = userResults[0]

      if (user.accountStatus !== 'pending') {
        return apiErrors.conflict(
          `User is already ${user.accountStatus}, cannot approve`,
        )
      }

      // Update user status to active
      await db
        .update(users)
        .set({
          accountStatus: 'active',
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))

    return apiSuccess(
      { userId: id, accountStatus: 'active' },
      { message: 'User approved successfully' }
    )
  } catch (error) {
    console.error('Error approving user:', error)
    return handleApiError(error)
  }
}
