import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/privy/middleware'
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
 * @param authUser - Admin user from middleware
 * @returns {Object} { success: true, data: PromotionEligibility }
 */
export const GET = requireAdmin(async (request: NextRequest, authUser) => {
  try {
    // Get user ID from URL params
    const url = new URL(request.url)
    const userId = url.pathname.split('/').slice(-2)[0]
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
})
