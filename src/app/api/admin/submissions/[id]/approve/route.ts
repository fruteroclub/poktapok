import { NextRequest } from 'next/server'
import {
  getSubmissionById,
  updateSubmission,
} from '@/lib/db/queries/activities'
import { approveSubmissionSchema } from '@/lib/validators/activity'
import {
  handleApiError,
  successResponse,
  requireAdmin,
} from '@/lib/auth/middleware'
import {
  distributeSubmissionReward,
  hasExistingDistribution,
} from '@/lib/blockchain/distribute-reward'

/**
 * PATCH /api/admin/submissions/[id]/approve
 * Approve submission and optionally distribute PULPA tokens (admin only)
 *
 * Request body:
 * - reward_pulpa_amount: string (optional, defaults to activity reward)
 * - review_notes: string (optional)
 * - distribute_tokens: boolean (optional, default true - auto-distribute PULPA)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
        { status: 404 },
      )
    }

    if (
      submission.submission.status !== 'pending' &&
      submission.submission.status !== 'under_review'
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: 'Only pending or under review submissions can be approved',
            code: 'INVALID_STATUS',
          },
        }),
        { status: 400 },
      )
    }

    const body = await req.json()
    const validated = approveSubmissionSchema.parse(body)

    // Use custom reward amount if provided, otherwise use submission's default
    const rewardAmount =
      validated.reward_pulpa_amount || submission.submission.rewardPulpaAmount

    // Default to auto-distribute unless explicitly disabled
    const shouldDistribute = validated.distribute_tokens !== false

    let distributionResult = null

    // PULPA distribution is required for approval - distribute first, then approve
    if (shouldDistribute && rewardAmount && parseFloat(rewardAmount) > 0) {
      // Check if distribution already exists
      const alreadyDistributed = await hasExistingDistribution(id)

      if (!alreadyDistributed) {
        distributionResult = await distributeSubmissionReward(
          id,
          submission.submission.activityId,
          submission.submission.userId,
          rewardAmount,
          admin.id
        )

        // If distribution failed, don't approve the submission
        if (!distributionResult.success) {
          return new Response(
            JSON.stringify({
              success: false,
              error: {
                message: `PULPA distribution failed: ${distributionResult.error}`,
                code: 'DISTRIBUTION_FAILED',
              },
              distribution: {
                success: false,
                error: distributionResult.error,
              },
            }),
            { status: 400 },
          )
        }
      }
    }

    // Only update submission status AFTER successful distribution
    const updated = await updateSubmission(id, {
      status: distributionResult?.success ? 'distributed' : 'approved',
      reviewedByUserId: admin.id,
      reviewedAt: new Date(),
      reviewNotes: validated.review_notes || null,
      rewardPulpaAmount: rewardAmount,
    })

    return successResponse({
      id: updated!.id,
      status: updated!.status,
      reward_pulpa_amount: updated!.rewardPulpaAmount,
      distribution: distributionResult
        ? {
            success: distributionResult.success,
            transactionHash: distributionResult.transactionHash,
            error: distributionResult.error,
          }
        : null,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
