import { NextRequest, NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";

// Initialize Privy client for server-side token verification
const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

/**
 * Authenticated user context from verified Privy token
 */
export type AuthUser = {
  privyDid: string;
};

/**
 * Extract and verify Privy access token from request
 *
 * Checks Authorization header (Bearer token) and cookies (privy-token)
 * Verifies token with Privy server-side API
 *
 * @param req - Next.js request object
 * @returns Authenticated user or null if invalid/missing token
 */
export async function getAuthUser(
  req: NextRequest
): Promise<AuthUser | null> {
  try {
    // Extract access token from Authorization header or cookies
    const authHeader = req.headers.get("authorization");
    const accessToken =
      authHeader?.replace("Bearer ", "") ||
      req.cookies.get("privy-token")?.value;

    if (!accessToken) {
      return null;
    }

    // Verify token with Privy
    const claims = await privy.verifyAuthToken(accessToken);

    if (!claims.userId) {
      return null;
    }

    return { privyDid: claims.userId };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
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
  handler: (req: NextRequest, user: AuthUser) => Promise<Response | T>
) {
  return async (req: NextRequest): Promise<Response> => {
    const authUser = await getAuthUser(req);

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await handler(req, authUser);

    // If handler returns a Response, return it directly
    if (result instanceof Response) {
      return result;
    }

    // Otherwise, wrap in JSON response
    return NextResponse.json(result);
  };
}
