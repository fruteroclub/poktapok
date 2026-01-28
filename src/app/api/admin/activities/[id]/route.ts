import { NextRequest } from 'next/server'
import {
  getActivityById,
  updateActivity,
  deleteActivity,
} from '@/lib/db/queries/activities'
import { updateActivitySchema } from '@/lib/validators/activity'
import {
  handleApiError,
  successResponse,
  requireAdmin,
} from '@/lib/auth/middleware'

/**
 * PATCH /api/admin/activities/[id]
 * Update activity (admin only)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req)

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

    const body = await req.json()
    const validated = updateActivitySchema.parse(body)

    const updated = await updateActivity(id, {
      title: validated.title,
      description: validated.description,
      instructions: validated.instructions,
      activityType: validated.activity_type,
      category: validated.category,
      difficulty: validated.difficulty,
      rewardPulpaAmount: validated.reward_pulpa_amount,
      evidenceRequirements: validated.evidence_requirements,
      verificationType: validated.verification_type,
      maxSubmissionsPerUser: validated.max_submissions_per_user,
      totalAvailableSlots: validated.total_available_slots,
      startsAt: validated.starts_at ? new Date(validated.starts_at) : undefined,
      expiresAt: validated.expires_at
        ? new Date(validated.expires_at)
        : undefined,
      status: validated.status,
    })

    return successResponse(updated)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/admin/activities/[id]
 * Soft delete activity (admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req)

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

    await deleteActivity(id)

    return successResponse({ message: 'Activity deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
