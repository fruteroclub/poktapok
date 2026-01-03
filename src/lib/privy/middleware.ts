import { NextRequest, NextResponse } from 'next/server'
import { PrivyClient } from '@privy-io/server-auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Initialize Privy client for server-side token verification
const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!,
)

/**
 * Authenticated user context from verified Privy token
 * Enhanced with user data from database (fetched once per request)
 */
export type AuthUser = {
  privyDid: string
  userId: string
  role: string
  accountStatus: string
}

/**
 * Extract and verify Privy access token from request
 *
 * Checks Authorization header (Bearer token) and cookies (privy-token)
 * Verifies token with Privy server-side API
 * Fetches user context from database (role, accountStatus) for authorization
 *
 * @param req - Next.js request object
 * @returns Authenticated user with context or null if invalid/missing token
 */
export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  try {
    // 1. Extract access token from Authorization header or cookies
    const authHeader = req.headers.get('authorization')
    const accessToken =
      authHeader?.replace('Bearer ', '') ||
      req.cookies.get('privy-token')?.value

    if (!accessToken) {
      return null
    }

    // 2. Verify token with Privy
    const claims = await privy.verifyAuthToken(accessToken)

    if (!claims.userId) {
      return null
    }

    // 3. Fetch user context from database (single query for role & status)
    const userResults = await db
      .select({
        id: users.id,
        role: users.role,
        accountStatus: users.accountStatus,
      })
      .from(users)
      .where(eq(users.privyDid, claims.userId))
      .limit(1)

    if (userResults.length === 0) {
      return null
    }

    const user = userResults[0]

    // 4. Return enriched auth context
    return {
      privyDid: claims.userId,
      userId: user.id,
      role: user.role,
      accountStatus: user.accountStatus,
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Higher-order function to protect API routes with authentication
 *
 * Usage:
 * ```typescript
 * export const GET = requireAuth(async (req, user) => {
 *   // user.privyDid is available and verified
 *   return NextResponse.json({ data: "protected" });
 * });
 * ```
 *
 * @param handler - Route handler that receives verified user
 * @returns Protected route handler that verifies authentication first
 */
export function requireAuth<T = unknown>(
  handler: (req: NextRequest, user: AuthUser) => Promise<Response | T>,
) {
  return async (req: NextRequest): Promise<Response> => {
    const authUser = await getAuthUser(req)

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await handler(req, authUser)

    // If handler returns a Response, return it directly
    if (result instanceof Response) {
      return result
    }

    // Otherwise, wrap in JSON response
    return NextResponse.json(result)
  }
}

/**
 * Verify Privy token without requiring database user
 *
 * Used for login/signup endpoints where user may not exist in DB yet
 * Only verifies the Privy token is valid, returns the privyDid
 *
 * Usage:
 * ```typescript
 * export const POST = requirePrivyAuth(async (req, privyDid) => {
 *   // privyDid is verified, but user may not exist in DB yet
 *   return NextResponse.json({ data: "signup-or-login" });
 * });
 * ```
 *
 * @param handler - Route handler that receives verified privyDid
 * @returns Protected route handler that only verifies Privy token
 */
export function requirePrivyAuth<T = unknown>(
  handler: (req: NextRequest, privyDid: string) => Promise<Response | T>,
) {
  return async (req: NextRequest): Promise<Response> => {
    try {
      // Extract access token from Authorization header or cookies
      const authHeader = req.headers.get('authorization')
      const accessToken =
        authHeader?.replace('Bearer ', '') ||
        req.cookies.get('privy-token')?.value

      if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Verify token with Privy (doesn't check DB)
      const claims = await privy.verifyAuthToken(accessToken)

      if (!claims.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Call handler with verified privyDid
      const result = await handler(req, claims.userId)

      // If handler returns a Response, return it directly
      if (result instanceof Response) {
        return result
      }

      // Otherwise, wrap in JSON response
      return NextResponse.json(result)
    } catch (error) {
      console.error('Privy token verification failed:', error)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
}

/**
 * Higher-order function to protect API routes with admin authorization
 *
 * Requires user to have role === 'admin'
 * Uses cached role from AuthUser (no additional DB query)
 *
 * Usage:
 * ```typescript
 * export const GET = requireAdmin(async (req, adminUser) => {
 *   // adminUser.role === 'admin' (guaranteed)
 *   return NextResponse.json({ data: "admin-only" });
 * });
 * ```
 *
 * @param handler - Route handler that receives verified admin user
 * @returns Protected route handler that verifies admin role
 */
export function requireAdmin<T = unknown>(
  handler: (req: NextRequest, user: AuthUser) => Promise<Response | T>,
) {
  return requireAuth(async (req: NextRequest, authUser: AuthUser) => {
    // Check admin role (no DB query - role already in authUser)
    if (authUser.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Admin access required',
            code: 'FORBIDDEN',
          },
        },
        { status: 403 },
      )
    }

    // User is admin - proceed with handler
    return handler(req, authUser)
  })
}
