import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { users, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/privy/middleware'
import { apiSuccess, apiErrors, apiError } from '@/lib/api/response'

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

export const PATCH = requireAuth(async (request: NextRequest, authUser) => {
  try {
    // Use privyDid from verified token
    const privyDid = authUser.privyDid

    // Parse request body
    const body = await request.json()
    const { username, email, displayName, bio, avatarUrl } = body

    // Validate required fields
    if (username !== undefined && !username) {
      return apiError('Username cannot be empty', { status: 400 })
    }

    if (email !== undefined && !email) {
      return apiError('Email cannot be empty', { status: 400 })
    }

    // Get current user
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.privyDid, privyDid))
      .limit(1)

    if (userResults.length === 0) {
      return apiErrors.notFound('User')
    }

    const currentUser = userResults[0]

    // Check if username is being changed and is already taken
    if (username && username !== currentUser.username) {
      const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, username))
        .limit(1)

      if (existingUser.length > 0) {
        return apiErrors.conflict('Username already taken')
      }
    }

    // Check if email is being changed and is already taken
    if (email && email !== currentUser.email) {
      const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1)

      if (existingUser.length > 0) {
        return apiErrors.conflict('Email already in use')
      }
    }

    // Prepare update data (only include fields that were provided)
    const updateData: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    }

    if (username !== undefined) updateData.username = username
    if (email !== undefined) updateData.email = email
    if (displayName !== undefined) updateData.displayName = displayName
    if (bio !== undefined) updateData.bio = bio
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl

    // Update user
    await db
      .update(users)
      .set(updateData)
      .where(eq(users.privyDid, privyDid))

    // Get updated user
    const updatedUserResults = await db
      .select()
      .from(users)
      .where(eq(users.privyDid, privyDid))
      .limit(1)

    const updatedUser = updatedUserResults[0]

    // Get profile if exists
    const profileResults = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, updatedUser.id))
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

    return apiSuccess(
      {
        user: {
          id: updatedUser.id,
          privyDid: updatedUser.privyDid,
          email: updatedUser.email,
          username: updatedUser.username,
          displayName: updatedUser.displayName,
          bio: updatedUser.bio,
          avatarUrl: updatedUser.avatarUrl,
          accountStatus: updatedUser.accountStatus,
          role: updatedUser.role,
          createdAt: updatedUser.createdAt,
        },
        profile,
      },
      { message: 'Profile updated successfully' }
    )
  } catch (error) {
    console.error('Error updating user profile:', error)
    return apiErrors.internal('Failed to update profile')
  }
})
