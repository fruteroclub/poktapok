import { NextRequest } from 'next/server'
import { getActivities } from '@/lib/db/queries/activities'
import { listActivitiesQuerySchema } from '@/lib/validators/activity'
import { handleApiError, successResponse } from '@/lib/auth/middleware'

/**
 * GET /api/activities
 * List active activities (public endpoint)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    // Parse and validate query params
    const params = listActivitiesQuerySchema.parse({
      type: searchParams.get('type') || undefined,
      category: searchParams.get('category') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      status: searchParams.get('status') || 'active', // Default to active only for public
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 24,
    })

    const result = await getActivities({
      type: params.type,
      category: params.category,
      difficulty: params.difficulty,
      status: params.status,
      search: params.search,
      page: params.page,
      limit: params.limit,
    })

    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
