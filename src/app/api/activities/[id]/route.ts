import { NextRequest } from 'next/server'
import { getActivityById, hasUserSubmitted } from '@/lib/db/queries/activities'
import {
  handleApiError,
  successResponse,
  getUserFromRequest,
} from '@/lib/auth/middleware'

/**
 * GET /api/activities/[id]
 * Get activity details (public endpoint with optional user context)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const activity = await getActivityById(id)

    if (!activity) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'Activity not found', code: 'NOT_FOUND' },
        }),
        { status: 404 },
      )
    }

    // If user is authenticated, check if they've already submitted
    const user = await getUserFromRequest(req)
    let userHasSubmitted = false

    if (user) {
      userHasSubmitted = await hasUserSubmitted(activity.id, user.id)
    }

    return successResponse({
      ...activity,
      userHasSubmitted,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
