import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sessionActivities } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAdmin, handleApiError, successResponse } from '@/lib/auth/middleware'

/**
 * DELETE /api/admin/sessions/:id/activities/:activityId - Unlink activity from session
 * @requires Admin authentication
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; activityId: string }> }
) {
  try {
    await requireAdmin(request)

    const { id: sessionId, activityId } = await params

    const [deletedLink] = await db
      .delete(sessionActivities)
      .where(
        and(
          eq(sessionActivities.sessionId, sessionId),
          eq(sessionActivities.activityId, activityId)
        )
      )
      .returning()

    if (!deletedLink) {
      return handleApiError({ message: 'Link not found', code: 'NOT_FOUND' })
    }

    return successResponse({ link: deletedLink })
  } catch (error) {
    return handleApiError(error)
  }
}
