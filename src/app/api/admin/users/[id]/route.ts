import { NextRequest } from 'next/server'
import { getUserDetails } from '@/lib/db/queries/users'
import { apiSuccess, apiErrors } from '@/lib/api/response'
import { requireAdmin, handleApiError } from '@/lib/auth/middleware'

/**
 * GET /api/admin/users/[id]
 *
 * Get detailed information about a specific user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    await requireAdmin(request)

    // Await params (Next.js 16 requirement)
    const { id } = await params

    // Get user details
    const userDetails = await getUserDetails(id)

    if (!userDetails) {
      return apiErrors.notFound('User')
    }

    // Transform to API response format
    const responseData = {
      user: {
        id: userDetails.id,
        username: userDetails.username,
        displayName: userDetails.displayName,
        email: userDetails.email,
        avatarUrl: userDetails.avatarUrl,
        appWallet: userDetails.appWallet,
        role: userDetails.role,
        accountStatus: userDetails.accountStatus,
        primaryAuthMethod: userDetails.primaryAuthMethod,
        createdAt: userDetails.createdAt.toISOString(),
        updatedAt: userDetails.updatedAt.toISOString(),
        profile: userDetails.profile,
        stats: userDetails.stats,
        recentSubmissions: userDetails.recentSubmissions.map((s) => ({
          id: s.id,
          activityId: s.activityId,
          activityTitle: s.activityTitle,
          status: s.status,
          submittedAt: s.submittedAt.toISOString(),
          rewardPulpaAmount: s.rewardPulpaAmount,
        })),
      },
    }

    return apiSuccess(responseData)
  } catch (error) {
    console.error('Failed to get user details:', error)
    return handleApiError(error)
  }
}
