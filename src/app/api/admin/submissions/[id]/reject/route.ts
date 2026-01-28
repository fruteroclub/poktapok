import { NextRequest } from 'next/server'
import {
  getSubmissionById,
  updateSubmission,
} from '@/lib/db/queries/activities'
import { rejectSubmissionSchema } from '@/lib/validators/activity'
import {
  handleApiError,
  successResponse,
  requireAdmin,
} from '@/lib/auth/middleware'

/**
 * PATCH /api/admin/submissions/[id]/reject
 * Reject submission (admin only)
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

    const body = await req.json()
    const validated = rejectSubmissionSchema.parse(body)

    const updated = await updateSubmission(id, {
      status: 'rejected',
      reviewedByUserId: admin.id,
      reviewedAt: new Date(),
      reviewNotes: validated.review_notes,
    })

    return successResponse({
      id: updated!.id,
      status: updated!.status,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
