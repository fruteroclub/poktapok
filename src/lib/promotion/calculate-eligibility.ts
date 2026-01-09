import { db } from '@/lib/db'
import { programEnrollments, activitySubmissions, attendance } from '@/lib/db/schema'
import { eq, and, count, sql } from 'drizzle-orm'

export interface PromotionEligibility {
  isEligible: boolean
  criteria: {
    attendanceCount: number
    attendanceRequired: number
    submissionCount: number
    submissionRequired: number
    qualityScore: number
    qualityRequired: number
  }
  reasons: string[]
}

/**
 * Calculate promotion eligibility for a guest user
 *
 * Criteria for promotion from Guest → Member:
 * - Minimum 5 attended sessions
 * - Minimum 3 approved submissions
 * - Average submission score >= 70%
 *
 * @param userId - User ID to check
 * @param programEnrollmentId - Program enrollment ID
 * @returns Eligibility status with detailed criteria
 */
export async function calculatePromotionEligibility(
  userId: string,
  programEnrollmentId: string,
): Promise<PromotionEligibility> {
  const reasons: string[] = []

  // Fetch enrollment to verify it exists
  const [enrollment] = await db
    .select()
    .from(programEnrollments)
    .where(eq(programEnrollments.id, programEnrollmentId))
    .limit(1)

  if (!enrollment) {
    throw new Error('Program enrollment not found')
  }

  // 1. Count attendance records (present status only)
  const attendanceResult = await db
    .select({ count: count() })
    .from(attendance)
    .where(and(eq(attendance.userId, userId), eq(attendance.status, 'present')))

  const attendanceCount = attendanceResult[0]?.count || 0
  const attendanceRequired = 5

  if (attendanceCount < attendanceRequired) {
    reasons.push(`Need ${attendanceRequired - attendanceCount} more attended sessions`)
  }

  // 2. Count approved submissions
  const submissionResult = await db
    .select({ count: count() })
    .from(activitySubmissions)
    .where(and(eq(activitySubmissions.userId, userId), eq(activitySubmissions.status, 'approved')))

  const submissionCount = submissionResult[0]?.count || 0
  const submissionRequired = 3

  if (submissionCount < submissionRequired) {
    reasons.push(`Need ${submissionRequired - submissionCount} more approved submissions`)
  }

  // 3. Calculate quality score (average of approved submissions)
  // Assuming metadata has a 'score' field as a number between 0-100
  const qualityResult = await db
    .select({
      avgScore: sql<number>`COALESCE(AVG(CAST(${activitySubmissions.metadata}->>'score' AS NUMERIC)), 0)`,
    })
    .from(activitySubmissions)
    .where(and(eq(activitySubmissions.userId, userId), eq(activitySubmissions.status, 'approved')))

  const qualityScore = qualityResult[0]?.avgScore || 0
  const qualityRequired = 70

  if (qualityScore < qualityRequired) {
    reasons.push(`Quality score ${qualityScore.toFixed(1)}% is below ${qualityRequired}%`)
  }

  // Determine eligibility
  const isEligible =
    attendanceCount >= attendanceRequired &&
    submissionCount >= submissionRequired &&
    qualityScore >= qualityRequired

  return {
    isEligible,
    criteria: {
      attendanceCount,
      attendanceRequired,
      submissionCount,
      submissionRequired,
      qualityScore,
      qualityRequired,
    },
    reasons,
  }
}
