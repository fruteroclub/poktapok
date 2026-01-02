import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/privy/middleware'
import { db } from '@/lib/db'
import { users, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { apiSuccess, apiErrors } from '@/lib/api/response'

/**
 * GET /api/admin/pending-users
 *
 * Returns all users with accountStatus === 'pending' along with their profile data.
 * Admin only endpoint.
 */
export const GET = requireAdmin(async (_req: NextRequest) => {
  try {
    // Query pending users with their profiles
    const pendingUsers = await db
      .select({
        user: users,
        profile: profiles,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.accountStatus, 'pending'))
      .orderBy(users.createdAt)

    // Transform the data to match the expected response format
    const formattedUsers = pendingUsers.map(({ user, profile }) => ({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        accountStatus: user.accountStatus,
        role: user.role,
        createdAt: user.createdAt,
      },
      profile: profile
        ? {
            id: profile.id,
            userId: profile.userId,
            location: profile.location,
            linkedin: profile.linkedin,
            github: profile.github,
            twitter: profile.twitter,
            telegram: profile.telegram,
            learningTrack: profile.learningTrack,
            experienceLevel: profile.experienceLevel,
            interests: profile.interests,
            website: profile.website,
          }
        : null,
    }))

    return apiSuccess(
      { pendingUsers: formattedUsers },
      { message: `Found ${formattedUsers.length} pending users` },
    )
  } catch (error) {
    console.error('Error fetching pending users:', error)
    return apiErrors.internal('Failed to fetch pending users')
  }
})
