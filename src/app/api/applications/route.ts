import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { applications, users, programs, profiles } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getAuthUser } from '@/lib/privy/middleware'
import { apiSuccess, apiError, apiValidationError, apiErrors } from '@/lib/api/response'

// Validation schema for application submission
const applicationSchema = z.object({
  programId: z.string().uuid('Invalid program ID'),
  goal: z
    .string()
    .min(140, 'Goal must be at least 140 characters')
    .max(280, 'Goal must not exceed 280 characters'),
  githubUsername: z.string().optional(),
  twitterUsername: z.string().optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  telegramUsername: z.string().optional(),
})

/**
 * POST /api/applications
 *
 * Submit onboarding application with program selection and goal commitment
 *
 * Requirements:
 * - User must be authenticated
 * - User must be in 'incomplete' status (onboarding not yet submitted)
 * - Program must exist and be active
 * - Goal must be 140-280 characters
 *
 * Transaction flow:
 * 1. Create application record
 * 2. Update user status to 'pending'
 * 3. Update profile with social accounts
 *
 * @param request - Contains programId, goal, and optional social accounts
 * @returns {Object} { success: true, data: { application }, message: "..." }
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user (but don't require 'active' status)
    const authUser = await getAuthUser(request)

    if (!authUser) {
      return apiErrors.unauthorized()
    }

    // Parse and validate request body
    const body = await request.json()
    const result = applicationSchema.safeParse(body)

    if (!result.success) {
      return apiValidationError(result.error)
    }

    const { programId, goal, githubUsername, twitterUsername, linkedinUrl, telegramUsername } =
      result.data

    // Fetch full user record to check status
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, authUser.userId))
      .limit(1)

    if (!user) {
      return apiErrors.notFound('User')
    }

    // Verify user is in 'incomplete' status (hasn't submitted application yet)
    if (user.accountStatus !== 'incomplete') {
      return apiError('User has already submitted an application', {
        code: 'APPLICATION_ALREADY_SUBMITTED',
        status: 400,
        details: { currentStatus: user.accountStatus },
      })
    }

    // Verify program exists and is active
    const [program] = await db
      .select()
      .from(programs)
      .where(and(eq(programs.id, programId), eq(programs.isActive, true)))
      .limit(1)

    if (!program) {
      return apiErrors.notFound('Program')
    }

    // Check for existing application (shouldn't happen, but safety check)
    const [existingApplication] = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, authUser.userId))
      .limit(1)

    if (existingApplication) {
      return apiError('Application already exists', {
        code: 'DUPLICATE_APPLICATION',
        status: 409,
      })
    }

    // Create application in transaction
    const transactionResult = await db.transaction(async (tx) => {
      // 1. Create application
      const [application] = await tx
        .insert(applications)
        .values({
          userId: authUser.userId,
          programId,
          goal,
          githubUsername: githubUsername || null,
          twitterUsername: twitterUsername || null,
          status: 'pending',
          motivationText: goal, // Use goal as motivation text for now
        })
        .returning()

      // 2. Update user status to pending
      await tx
        .update(users)
        .set({
          accountStatus: 'pending',
          updatedAt: new Date(),
        })
        .where(eq(users.id, authUser.userId))

      // 3. Update profile with social accounts (create if doesn't exist)
      const profileUpdates = {
        userId: authUser.userId,
        githubUsername: githubUsername || null,
        twitterUsername: twitterUsername || null,
        linkedinUrl: linkedinUrl || null,
        telegramUsername: telegramUsername || null,
        updatedAt: new Date(),
      }

      await tx
        .insert(profiles)
        .values(profileUpdates)
        .onConflictDoUpdate({
          target: profiles.userId,
          set: profileUpdates,
        })

      return { application }
    })

    return apiSuccess(
      { application: transactionResult.application },
      { message: 'Application submitted successfully' },
    )
  } catch (error) {
    console.error('Error submitting application:', error)

    // Handle Zod validation errors (shouldn't reach here due to safeParse)
    if (error instanceof z.ZodError) {
      return apiValidationError(error)
    }

    return apiErrors.internal()
  }
}
