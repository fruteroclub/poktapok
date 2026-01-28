import { NextRequest } from 'next/server'
import { getActivities, createActivity } from '@/lib/db/queries/activities'
import {
  createActivitySchema,
  listActivitiesQuerySchema,
} from '@/lib/validators/activity'
import {
  handleApiError,
  successResponse,
  requireAdmin,
} from '@/lib/auth/middleware'

/**
 * GET /api/admin/activities
 * List all activities (admin only - includes drafts)
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)

    const { searchParams } = new URL(req.url)

    const params = listActivitiesQuerySchema.parse({
      type: searchParams.get('type') || undefined,
      category: searchParams.get('category') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      status: searchParams.get('status') || undefined, // Admin can see all statuses
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

    // Get stats
    const allActivities = await getActivities({ limit: 1000 })
    const stats = {
      total: allActivities.total,
      active: allActivities.activities.filter((a) => a.status === 'active')
        .length,
      draft: allActivities.activities.filter((a) => a.status === 'draft')
        .length,
      completed: allActivities.activities.filter(
        (a) => a.status === 'completed',
      ).length,
    }

    return successResponse({
      ...result,
      stats,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/admin/activities
 * Create new activity (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req)

    const body = await req.json()
    console.log('📥 Received body:', JSON.stringify(body, null, 2))

    const validated = createActivitySchema.parse(body)
    console.log('✅ Validation passed:', JSON.stringify(validated, null, 2))

    const activity = await createActivity({
      title: validated.title,
      description: validated.description,
      instructions: validated.instructions || null,
      activityType: validated.activity_type,
      category: validated.category || null,
      difficulty: validated.difficulty,
      rewardPulpaAmount: validated.reward_pulpa_amount,
      evidenceRequirements: validated.evidence_requirements,
      verificationType: validated.verification_type,
      maxSubmissionsPerUser: validated.max_submissions_per_user || null,
      totalAvailableSlots: validated.total_available_slots || null,
      startsAt: validated.starts_at ? new Date(validated.starts_at) : null,
      expiresAt: validated.expires_at ? new Date(validated.expires_at) : null,
      status: validated.status,
      createdByUserId: admin.id,
      metadata: {}, // JSONB field expects object, not string
    })

    return successResponse(activity, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
