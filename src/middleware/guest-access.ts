import { NextRequest, NextResponse } from 'next/server'

/**
 * Guest Access Control Middleware
 *
 * Guest capabilities:
 * - ✅ Browse talent directory
 * - ✅ View activities and programs
 * - ✅ Submit to activities (marked as guest)
 * - ✅ Participate in bounties
 * - ✅ Attend program sessions
 * - ❌ Mark attendance (admin only)
 * - ❌ Admin features
 * - ❌ Voting rights (future)
 *
 * This middleware can be used in Next.js middleware.ts or in individual API routes
 */

const GUEST_ALLOWED_ROUTES = [
  '/api/profiles', // Browse directory
  '/api/activities', // View activities
  '/api/submissions', // Submit work
  '/api/bounties', // View and participate in bounties
  '/api/programs', // View program details
  '/api/auth/me', // Get own profile
]

const GUEST_RESTRICTED_ROUTES = [
  '/api/admin/', // All admin routes
  '/api/attendance/mark', // Mark attendance
  '/api/votes/', // Voting (future)
]

/**
 * Check if a guest user has access to the requested route
 *
 * @param request - Next.js request object
 * @param userStatus - User account status from auth
 * @returns boolean - true if access allowed, false if restricted
 */
export function checkGuestAccess(request: NextRequest, userStatus: string): boolean {
  const pathname = request.nextUrl.pathname

  // If not a guest, allow access (handled by other middleware)
  if (userStatus !== 'guest') {
    return true
  }

  // Check if route is explicitly restricted for guests
  const isRestricted = GUEST_RESTRICTED_ROUTES.some((route) => pathname.startsWith(route))

  if (isRestricted) {
    return false
  }

  // Check if route is in allowed list
  const isAllowed = GUEST_ALLOWED_ROUTES.some((route) => pathname.startsWith(route))

  return isAllowed
}

/**
 * Guest access middleware function
 * Returns error response if access is denied, null if allowed
 *
 * @param request - Next.js request object
 * @param userStatus - User account status
 * @returns NextResponse with error or null to continue
 */
export function guestAccessMiddleware(
  request: NextRequest,
  userStatus: string,
): NextResponse | null {
  const hasAccess = checkGuestAccess(request, userStatus)

  if (!hasAccess) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Guest users do not have access to this resource',
          code: 'GUEST_ACCESS_RESTRICTED',
        },
      },
      { status: 403 },
    )
  }

  return null // Continue to next middleware/route
}

/**
 * Higher-order function to protect API routes with guest access control
 *
 * Usage in API routes:
 * ```typescript
 * export const GET = requireGuestAccess(async (req, user) => {
 *   // Handler code
 * });
 * ```
 *
 * @param handler - Route handler function
 * @returns Protected route handler
 */
export function requireGuestAccess<T = unknown>(
  handler: (req: NextRequest, user: { accountStatus: string }) => Promise<Response | T>,
) {
  return async (req: NextRequest, user: { accountStatus: string }): Promise<Response> => {
    const accessError = guestAccessMiddleware(req, user.accountStatus)

    if (accessError) {
      return accessError
    }

    const result = await handler(req, user)

    if (result instanceof Response) {
      return result
    }

    return NextResponse.json(result)
  }
}
