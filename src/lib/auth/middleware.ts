import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { PrivyClient } from '@privy-io/server-auth'

const privyClient = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
)

/**
 * Error classes for authentication/authorization
 */
export class UnauthorizedError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Access forbidden') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

/**
 * Get user from Privy authentication
 */
export async function getUserFromRequest(req: NextRequest) {
  try {
    // Get auth token from cookie
    const authToken = req.cookies.get('privy-token')?.value

    if (!authToken) {
      return null
    }

    // Verify token with Privy
    const claims = await privyClient.verifyAuthToken(authToken)
    const privyDid = claims.userId

    // Get user from database
    const result = await db
      .select()
      .from(users)
      .where(eq(users.privyDid, privyDid))
      .limit(1)

    return result[0] || null
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

/**
 * Require authentication middleware
 * Returns user or throws UnauthorizedError
 */
export async function requireAuth(req: NextRequest) {
  const user = await getUserFromRequest(req)

  if (!user) {
    throw new UnauthorizedError('Authentication required')
  }

  if (user.accountStatus !== 'active') {
    throw new ForbiddenError('Account is not active')
  }

  return user
}

/**
 * Require admin middleware
 * Returns admin user or throws ForbiddenError
 */
export async function requireAdmin(req: NextRequest) {
  const user = await requireAuth(req)

  if (user.role !== 'admin') {
    throw new ForbiddenError('Admin access required')
  }

  return user
}

/**
 * API error handler
 * Converts errors to appropriate HTTP responses
 */
export function handleApiError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      { success: false, error: { message: error.message, code: 'UNAUTHORIZED' } },
      { status: 401 }
    )
  }

  if (error instanceof ForbiddenError) {
    return NextResponse.json(
      { success: false, error: { message: error.message, code: 'FORBIDDEN' } },
      { status: 403 }
    )
  }

  // Validation errors (from Zod)
  if (error && typeof error === 'object' && 'issues' in error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          issues: (error as any).issues,
        },
      },
      { status: 400 }
    )
  }

  // Generic error
  console.error('API Error:', error)
  return NextResponse.json(
    {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    },
    { status: 500 }
  )
}

/**
 * Success response helper
 */
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  )
}
