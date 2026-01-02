import { cookies } from 'next/headers'
import { PrivyClient } from '@privy-io/server-auth'
import { db } from '@/lib/db'
import { users, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { User, Profile } from '@/lib/db/schema'

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!,
)

export type CurrentUser = {
  user: User
  profile: Profile | null
} | null

/**
 * Server-side helper to get the current authenticated user
 * Verifies Privy token and fetches user from database
 *
 * @returns User and profile data, or null if not authenticated
 *
 * @example
 * const currentUser = await getCurrentUser();
 * if (!currentUser) {
 *   return new Response("Unauthorized", { status: 401 });
 * }
 * const { user, profile } = currentUser;
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  try {
    // Get Privy auth token from cookies
    const cookieStore = await cookies()
    const authToken = cookieStore.get('privy-token')?.value

    if (!authToken) {
      return null
    }

    // Verify token with Privy
    const verifiedClaims = await privy.verifyAuthToken(authToken)

    if (!verifiedClaims || !verifiedClaims.userId) {
      return null
    }

    // Fetch user from database using Privy DID
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.privyDid, verifiedClaims.userId))
      .limit(1)

    if (userResult.length === 0) {
      return null
    }

    const user = userResult[0]

    // Fetch profile if exists
    const profileResult = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)

    const profile = profileResult.length > 0 ? profileResult[0] : null

    return {
      user,
      profile,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Server-side helper to require authentication
 * Throws error if not authenticated
 *
 * @example
 * const { user, profile } = await requireAuth();
 */
export async function requireAuth(): Promise<{
  user: User
  profile: Profile | null
}> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  return currentUser
}
