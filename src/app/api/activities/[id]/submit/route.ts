import { NextRequest } from 'next/server'
import {
  getActivityById,
  hasUserSubmitted,
  createSubmission,
  incrementActivitySubmissionCount,
} from '@/lib/db/queries/activities'
import { submitActivitySchema } from '@/lib/validators/activity'
import {
  handleApiError,
  successResponse,
  requireAuth,
} from '@/lib/auth/middleware'

/**
 * POST /api/activities/[id]/submit
 * Submit activity completion proof (authenticated)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Require authentication
    const user = await requireAuth(req)

    // Get activity
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

    // Check activity is active
    if (activity.status !== 'active') {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: 'Activity is not active',
            code: 'ACTIVITY_NOT_ACTIVE',
          },
        }),
        { status: 400 },
      )
    }

    // Check if activity has expired
    if (activity.expiresAt && new Date(activity.expiresAt) < new Date()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'Activity has expired', code: 'ACTIVITY_EXPIRED' },
        }),
        { status: 400 },
      )
    }

    // Check if user has already submitted
    const alreadySubmitted = await hasUserSubmitted(activity.id, user.id)

    if (alreadySubmitted && activity.maxSubmissionsPerUser === 1) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: 'You have already submitted for this activity',
            code: 'ALREADY_SUBMITTED',
          },
        }),
        { status: 400 },
      )
    }

    // Check if slots are available
    if (
      activity.totalAvailableSlots &&
      activity.currentSubmissionsCount >= activity.totalAvailableSlots
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: 'All slots for this activity are filled',
            code: 'SLOTS_FULL',
          },
        }),
        { status: 400 },
      )
    }

    // Parse and validate submission data
    const body = await req.json()
    const validated = submitActivitySchema.parse(body)

    // Validate against evidence requirements
    const requirements = activity.evidenceRequirements as {
      url_required: boolean
      screenshot_required: boolean
      text_required: boolean
    }

    if (requirements.url_required && !validated.submission_url) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: 'URL is required for this activity',
            code: 'URL_REQUIRED',
          },
        }),
        { status: 400 },
      )
    }

    if (
      requirements.screenshot_required &&
      (!validated.evidence_files || validated.evidence_files.length === 0)
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: 'Screenshot is required for this activity',
            code: 'SCREENSHOT_REQUIRED',
          },
        }),
        { status: 400 },
      )
    }

    if (requirements.text_required && !validated.submission_text) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: 'Text description is required for this activity',
            code: 'TEXT_REQUIRED',
          },
        }),
        { status: 400 },
      )
    }

    // Create submission
    const submission = await createSubmission({
      activityId: activity.id,
      userId: user.id,
      submissionUrl: validated.submission_url || null,
      evidenceFiles: validated.evidence_files
        ? JSON.stringify(validated.evidence_files)
        : JSON.stringify([]),
      submissionText: validated.submission_text || null,
      status: 'pending',
      rewardPulpaAmount: activity.rewardPulpaAmount,
      metadata: JSON.stringify({
        ip_address:
          req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent'),
      }),
    })

    // Increment activity submission count
    await incrementActivitySubmissionCount(activity.id)

    return successResponse(
      {
        id: submission.id,
        activity_id: submission.activityId,
        status: submission.status,
        submitted_at: submission.submittedAt,
      },
      201,
    )
  } catch (error) {
    return handleApiError(error)
  }
}
