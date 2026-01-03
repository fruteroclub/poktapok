import { NextRequest } from 'next/server'
import { listUsers } from '@/lib/db/queries/users'
import { apiSuccess, apiError, apiErrors } from '@/lib/api/response'
import { requireAdmin, handleApiError } from '@/lib/auth/middleware'

/**
 * GET /api/admin/users
 *
 * List all users with pagination and filters
 *
 * Query params:
 * - search: string (username, email, displayName)
 * - role: 'member' | 'moderator' | 'admin' | 'all'
 * - accountStatus: 'active' | 'pending' | 'suspended' | 'banned' | 'all'
 * - sortBy: 'createdAt' | 'username' | 'totalEarnings' | 'submissionsCount'
 * - sortOrder: 'asc' | 'desc'
 * - page: number (default: 1)
 * - limit: number (default: 24)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdmin(request)

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const filters = {
      search: searchParams.get('search') || undefined,
      role: searchParams.get('role') || undefined,
      accountStatus: searchParams.get('accountStatus') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '24'),
    }

    // Validate page and limit
    if (filters.page < 1) {
      return apiError('Invalid page number', { status: 400 })
    }
    if (filters.limit < 1 || filters.limit > 100) {
      return apiError('Limit must be between 1 and 100', { status: 400 })
    }

    // Query users with filters
    const result = await listUsers(filters)

    // Transform results to match API response format
    const usersData = result.users.map((user) => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      accountStatus: user.accountStatus,
      createdAt: user.createdAt.toISOString(),
      stats: {
        totalEarnings: user.totalEarnings,
        submissionsCount: user.submissionsCount,
        approvedCount: user.approvedCount,
        activitiesCompleted: user.activitiesCompleted,
      },
      profile: user.profileId
        ? {
            city: user.city,
            country: user.country,
            learningTracks: user.learningTracks,
          }
        : null,
    }))

    return apiSuccess(
      { users: usersData },
      { meta: { pagination: result.pagination } }
    )
  } catch (error) {
    console.error('Failed to list users:', error)
    return handleApiError(error)
  }
}
