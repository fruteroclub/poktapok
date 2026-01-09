import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { users, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/privy/middleware'
import { apiSuccess, apiErrors } from '@/lib/api/response'
import { API_ERROR_CODES } from '@/types/api-response'

export const GET = requireAuth(async (_request: NextRequest, authUser) => {
  try {
    // Use privyDid from verified token
    const privyDid = authUser.privyDid

    // Get user from database
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.privyDid, privyDid))
      .limit(1)

    if (userResults.length === 0) {
      return apiErrors.notFound('User')
    }

    const dbUser = userResults[0]

    // Get profile if exists
    const profileResults = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, dbUser.id))
      .limit(1)

    // Transform database profile to API Profile format
    const dbProfile = profileResults.length > 0 ? profileResults[0] : null
    const profile = dbProfile
      ? {
          id: dbProfile.id,
          userId: dbProfile.userId,
          city: dbProfile.city || '',
          country: dbProfile.country || '',
          countryCode: dbProfile.countryCode || '',
          learningTracks: dbProfile.learningTracks || [],
          availabilityStatus: dbProfile.availabilityStatus,
          socialLinks: {
            github: dbProfile.githubUsername || undefined,
            twitter: dbProfile.twitterUsername || undefined,
            linkedin: dbProfile.linkedinUrl || undefined,
            telegram: dbProfile.telegramUsername || undefined,
          },
        }
      : null

    return apiSuccess({
      user: {
        id: dbUser.id,
        privyDid: dbUser.privyDid,
        email: dbUser.email,
        username: dbUser.username,
        displayName: dbUser.displayName,
        bio: dbUser.bio,
        avatarUrl: dbUser.avatarUrl,
        accountStatus: dbUser.accountStatus,
        role: dbUser.role,
        createdAt: dbUser.createdAt,
      },
      profile,
    })
  } catch (error) {
    console.error('Error fetching current user:', error)
    return apiErrors.internal('Failed to fetch user')
  }
})
