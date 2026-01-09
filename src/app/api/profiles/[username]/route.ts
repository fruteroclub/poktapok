import { NextRequest } from 'next/server'
import { getProfileByUsername } from '@/lib/db/queries/profiles'
import { getCurrentUser } from '@/lib/auth/helpers'
import { apiSuccess, apiError, apiErrors } from '@/lib/api/response'
import { canViewField, isProfileOwner } from '@/lib/utils/visibility'

/**
 * GET /api/profiles/[username]
 * Get profile by username with visibility rules applied
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params

    // Fetch profile with user data
    const profileData = await getProfileByUsername(username)

    if (!profileData) {
      return apiErrors.notFound('Profile')
    }

    const { profile, user } = profileData

    // Get current user for visibility checks
    const currentUser = await getCurrentUser()

    // Determine if viewer is owner
    const isOwner = isProfileOwner(profile, currentUser?.user || null)

    // Check if viewer can see social links (members-only)
    const canViewSocials = canViewField(
      'socialLinks',
      profile,
      currentUser?.user || null,
    )

    // Check if viewer can see location data
    const canViewLocation = canViewField(
      'city',
      profile,
      currentUser?.user || null,
    )

    // Check if viewer can see learning tracks
    const canViewLearningTracks = canViewField(
      'learningTracks',
      profile,
      currentUser?.user || null,
    )

    // Build response with visibility filtering
    const response = {
      profile: {
        id: profile.id,
        userId: profile.userId,
        // Basic data (always visible)
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        // Location (members-only or private profile hides)
        city: canViewLocation ? profile.city : null,
        country: canViewLocation ? profile.country : null,
        countryCode: canViewLocation ? profile.countryCode : null,
        // Learning tracks (members-only or private profile hides)
        learningTracks: canViewLearningTracks ? profile.learningTracks : null,
        availabilityStatus: canViewLearningTracks
          ? profile.availabilityStatus
          : null,
        // Social links (members-only)
        githubUsername: canViewSocials ? profile.githubUsername : null,
        twitterUsername: canViewSocials ? profile.twitterUsername : null,
        linkedinUrl: canViewSocials ? profile.linkedinUrl : null,
        telegramUsername: canViewSocials ? profile.telegramUsername : null,
        // Stats (members-only)
        completedBounties: canViewSocials ? profile.completedBounties : 0,
        totalEarningsUsd: canViewSocials ? profile.totalEarningsUsd : 0,
        // Metadata
        profileVisibility: profile.profileVisibility,
        createdAt: user.createdAt,
      },
      meta: {
        isOwner,
        canViewSocials,
        canViewLocation,
        canViewLearningTracks,
        isPrivate: profile.profileVisibility === 'private',
      },
    }

    return apiSuccess(response)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return apiErrors.internal()
  }
}
