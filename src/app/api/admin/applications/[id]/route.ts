import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { applications, users, profiles, programs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { apiSuccess, apiErrors } from '@/lib/api/response'
import { requireAdmin } from '@/lib/auth/middleware'

/**
 * GET /api/admin/applications/:id
 * Get full application details with user and program information
 */
export const GET = requireAdmin(async (request: NextRequest) => {
  // Extract application ID from URL
  const url = new URL(request.url)
  const applicationId = url.pathname.split('/').slice(-1)[0]

  if (!applicationId) {
    return apiErrors.notFound('Application ID')
  }

  try {
    const result = await db
      .select({
        application: {
          id: applications.id,
          userId: applications.userId,
          programId: applications.programId,
          status: applications.status,
          goal: applications.goal,
          githubUsername: applications.githubUsername,
          twitterUsername: applications.twitterUsername,
          linkedinUrl: applications.linkedinUrl,
          telegramUsername: applications.telegramUsername,
          reviewedBy: applications.reviewedBy,
          reviewedAt: applications.reviewedAt,
          reviewNotes: applications.reviewNotes,
          createdAt: applications.createdAt,
          updatedAt: applications.updatedAt,
          metadata: applications.metadata,
        },
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          email: users.email,
          bio: users.bio,
          avatarUrl: users.avatarUrl,
          accountStatus: users.accountStatus,
          role: users.role,
          createdAt: users.createdAt,
        },
        profile: {
          id: profiles.id,
          userId: profiles.userId,
          displayName: profiles.displayName,
          bio: profiles.bio,
          avatarUrl: profiles.avatarUrl,
          city: profiles.city,
          country: profiles.country,
          countryCode: profiles.countryCode,
          learningTracks: profiles.learningTracks,
          availabilityStatus: profiles.availabilityStatus,
          githubUsername: profiles.githubUsername,
          twitterUsername: profiles.twitterUsername,
          linkedinUrl: profiles.linkedinUrl,
          telegramUsername: profiles.telegramUsername,
        },
        program: {
          id: programs.id,
          name: programs.name,
          description: programs.description,
          programType: programs.programType,
          startDate: programs.startDate,
          endDate: programs.endDate,
          isActive: programs.isActive,
        },
      })
      .from(applications)
      .leftJoin(users, eq(applications.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .leftJoin(programs, eq(applications.programId, programs.id))
      .where(eq(applications.id, applicationId))
      .limit(1)

    if (!result || result.length === 0) {
      return apiErrors.notFound('Application')
    }

    const [applicationData] = result

    // If reviewed, fetch reviewer information
    let reviewer = null
    if (applicationData.application.reviewedBy) {
      const [reviewerData] = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
        })
        .from(users)
        .where(eq(users.id, applicationData.application.reviewedBy))
        .limit(1)

      reviewer = reviewerData || null
    }

    return apiSuccess({
      application: applicationData.application,
      user: applicationData.user,
      profile: applicationData.profile,
      program: applicationData.program,
      reviewer,
    })
  } catch (error) {
    console.error('Error fetching application detail:', error)
    return apiErrors.internal()
  }
})
