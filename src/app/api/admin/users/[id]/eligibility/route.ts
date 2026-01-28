import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/middleware'
import { calculatePromotionEligibility } from '@/lib/promotion/calculate-eligibility'
import { apiSuccess, apiErrors } from '@/lib/api/response'

/**
 * GET /api/admin/users/[id]/eligibility?enrollmentId=xxx
 *
 * Get promotion eligibility status for a guest user
 *
 * Query params:
 * - enrollmentId: Program enrollment ID
 *
 * Returns eligibility criteria with progress indicators
 *
 * @param request - Contains enrollment ID in query params
 * @returns {Object} { success: true, data: PromotionEligibility }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin(request)

  try {
    const { id: userId } = await params
    const url = new URL(request.url)
    const enrollmentId = url.searchParams.get('enrollmentId')

    if (!enrollmentId) {
      return apiErrors.notFound('Enrollment ID is required')
    }

    // Calculate eligibility
    const eligibility = await calculatePromotionEligibility(userId, enrollmentId)

    return apiSuccess(eligibility)
  } catch (error) {
    console.error('Error calculating eligibility:', error)

    if (error instanceof Error && error.message === 'Program enrollment not found') {
      return apiErrors.notFound('Program enrollment')
    }

    return apiErrors.internal()
  }
}
