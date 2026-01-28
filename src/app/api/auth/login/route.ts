import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { users, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requirePrivyAuth } from '@/lib/privy/middleware'
import { apiSuccess, apiErrors } from '@/lib/api/response'

/**
 * POST /api/auth/login
 *
 * Get-or-create user during Privy authentication flow.
 * Called after Privy authentication completes on client-side.
 *
 * - If user exists: Returns existing user + profile
 * - If user doesn't exist: Creates new user with Privy metadata, returns user with null profile
 *
 * Request body (optional metadata from Privy):
 * - email: string | null
 * - appWallet: string | null
 * - extWallet: string | null
 * - primaryAuthMethod: "email" | "wallet" | "social"
 *
 * Security: Uses requirePrivyAuth middleware to verify Privy token (doesn't require existing DB user)
 */
export const POST = requirePrivyAuth(async (request: NextRequest, privyDid: string) => {
  try {
    // privyDid comes from verified Privy token (secure)

    // Get optional Privy metadata from request body
    const body = await request.json().catch(() => ({}))
    const { email, appWallet, extWallet, primaryAuthMethod, loginMethod } = body

    console.log('Login request for privyDid:', privyDid)
    console.log('Login method:', loginMethod)
    console.log('Email provided:', email || 'none')

    // Check if user exists
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.privyDid, privyDid))
      .limit(1)

    if (existingUsers.length > 0) {
      // User exists - return with profile
      const dbUser = existingUsers[0]
      console.log('Existing user logged in:', dbUser.id)

      // Get profile if exists
      const profileResults = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, dbUser.id))
        .limit(1)

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
        profile: profileResults.length > 0 ? profileResults[0] : null,
      })
    }

    // User doesn't exist - create new minimal record
    // Generate temporary values for required fields (will be updated during onboarding)
    console.log('Creating new user for privyDid:', privyDid)

    // Generate temporary email if not provided by Privy
    // Use login method to make it more specific (e.g., github, google, wallet)
    const emailSuffix = loginMethod
      ? `${loginMethod}.incomplete.user`
      : 'incomplete.user'
    const tempEmail =
      email || `${privyDid.replace('did:privy:', '')}@${emailSuffix}`

    // Generate temporary username from privyDid (last 12 chars)
    const tempUsername = `user_${privyDid.slice(-12)}`

    // Use temporary display name based on login method
    const tempDisplayName = loginMethod
      ? `${loginMethod.charAt(0).toUpperCase() + loginMethod.slice(1)} User`
      : 'New User'

    const newUserResults = await db
      .insert(users)
      .values({
        privyDid,
        email: tempEmail,
        username: tempUsername,
        displayName: tempDisplayName,
        bio: null,
        avatarUrl: null,
        appWallet: appWallet || null,
        extWallet: extWallet || null,
        primaryAuthMethod: primaryAuthMethod || 'wallet',
        accountStatus: 'incomplete', // Needs to complete onboarding
      })
      .returning()

    const newUser = newUserResults[0]
    console.log('New user created:', newUser.id)

    return apiSuccess({
      user: {
        id: newUser.id,
        privyDid: newUser.privyDid,
        email: newUser.email,
        username: newUser.username,
        displayName: newUser.displayName,
        bio: newUser.bio,
        avatarUrl: newUser.avatarUrl,
        accountStatus: newUser.accountStatus,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
      profile: null, // New users don't have profiles yet
    })
  } catch (error) {
    console.error('Error during login get-or-create:', error)
    return apiErrors.internal('Failed to login')
  }
})
