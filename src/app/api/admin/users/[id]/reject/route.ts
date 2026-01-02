import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/privy/middleware'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { apiSuccess, apiErrors } from '@/lib/api/response'

/**
 * POST /api/admin/users/[id]/reject
 *
 * Rejects a pending user by updating their accountStatus to 'rejected'.
 * Admin only endpoint.
 */
export const POST = requireAdmin(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
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
          `User is already ${user.accountStatus}, cannot reject`,
        )
      }

      // Update user status to rejected
      await db
        .update(users)
        .set({
          accountStatus: 'rejected',
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))

      return apiSuccess(
        { userId: id, accountStatus: 'rejected' },
        { message: 'User rejected successfully' },
      )
    } catch (error) {
      console.error('Error rejecting user:', error)
      return apiErrors.internal('Failed to reject user')
    }
  },
)
