import { NextRequest } from 'next/server'
import { getSubmissionById, updateSubmission } from '@/lib/db/queries/activities'
import { approveSubmissionSchema } from '@/lib/validators/activity'
import { handleApiError, successResponse, requireAdmin } from '@/lib/auth/middleware'

/**
 * PATCH /api/admin/submissions/[id]/approve
 * Approve submission (admin only)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(req)

    const { id } = await params
    const submission = await getSubmissionById(id)

    if (!submission) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'Submission not found', code: 'NOT_FOUND' },
        }),
        { status: 404 }
      )
    }

    if (submission.submission.status !== 'pending' && submission.submission.status !== 'under_review') {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: 'Only pending or under review submissions can be approved',
            code: 'INVALID_STATUS',
          },
        }),
        { status: 400 }
      )
    }

    const body = await req.json()
    const validated = approveSubmissionSchema.parse(body)

    // Use custom reward amount if provided, otherwise use submission's default
    const rewardAmount = validated.reward_pulpa_amount || submission.submission.rewardPulpaAmount

    const updated = await updateSubmission(id, {
      status: 'approved',
      reviewedByUserId: admin.id,
      reviewedAt: new Date(),
      reviewNotes: validated.review_notes || null,
      rewardPulpaAmount: rewardAmount,
    })

    return successResponse({
      id: updated!.id,
      status: updated!.status,
      reward_pulpa_amount: updated!.rewardPulpaAmount,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
