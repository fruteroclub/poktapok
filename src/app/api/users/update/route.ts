import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/privy/middleware";
import { apiSuccess, apiError, apiErrors } from "@/lib/api/response";
import { API_ERROR_CODES } from "@/types/api-response";
import { DatabaseError } from "pg";

/**
 * Helper: Check if profile is complete (ready to transition from "incomplete" to "pending")
 *
 * Account status flow:
 * - incomplete: Authenticated but onboarding not completed
 * - pending: Onboarding complete, waiting for approval
 * - active: Approved and active
 *
 * Temporary patterns from login route (src/app/api/auth/login/route.ts:80-89):
 * - Temp email: `${privyDid}@${loginMethod}.incomplete.user`
 * - Temp username: `user_${privyDid.slice(-12)}`
 * - Temp displayName: `"${LoginMethod} User"` or `"New User"`
 *
 * A profile is complete when all required onboarding fields are valid:
 * - username: not a temp username, matches pattern
 * - email: not a temp email
 * - displayName: exists and not a temp name
 */
function isProfileComplete(userData: {
  username?: string | null;
  email?: string | null;
  displayName?: string | null;
}): boolean {
  const { username, email, displayName } = userData;

  // All required fields must exist
  if (!username || !email || !displayName) {
    return false;
  }

  // Username must not be a temp username (user_*)
  if (username.startsWith("user_")) {
    return false;
  }

  // Email must not be a temp email (*@*.incomplete.user)
  if (email.includes(".incomplete.user")) {
    return false;
  }

  // DisplayName must not be a temp name
  if (displayName === "New User" || displayName.endsWith(" User")) {
    return false;
  }

  // Username must match the onboarding pattern (3-50 chars, lowercase alphanumeric + underscore)
  const usernamePattern = /^[a-z0-9_]{3,50}$/;
  if (!usernamePattern.test(username)) {
    return false;
  }

  return true;
}

export const PATCH = requireAuth(async (request: NextRequest, authUser) => {
  try {
    const body = await request.json();
    const { email, username, displayName, bio, avatarUrl } = body;

    // Use privyDid from verified token, not from request body
    const privyDid = authUser.privyDid;

    // Build update object with only provided fields
    const updateData: Partial<typeof users.$inferInsert> & { updatedAt: Date } = {
      updatedAt: new Date(),
    };

    // Only validate and update fields that are provided
    if (username !== undefined) {
      if (!username || username.trim() === "") {
        return apiError("Username cannot be empty", {
          code: API_ERROR_CODES.VALIDATION_ERROR,
          status: 400,
        });
      }
      updateData.username = username;
    }

    if (email !== undefined) {
      if (!email || email.trim() === "") {
        return apiError("Email cannot be empty", {
          code: API_ERROR_CODES.VALIDATION_ERROR,
          status: 400,
        });
      }
      updateData.email = email;
    }

    if (displayName !== undefined) {
      updateData.displayName = displayName.trim() || null;
    }

    if (bio !== undefined) {
      updateData.bio = bio ? bio.trim() : null;
    }

    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl || null;
    }

    // Get current user data to check if profile will be complete after update
    const currentUserResults = await db
      .select()
      .from(users)
      .where(eq(users.privyDid, privyDid))
      .limit(1);

    if (currentUserResults.length === 0) {
      return apiErrors.notFound("User");
    }

    const currentUser = currentUserResults[0];

    // Merge current data with updates to check completion status
    const mergedData = {
      username: updateData.username ?? currentUser.username,
      email: updateData.email ?? currentUser.email,
      displayName: updateData.displayName ?? currentUser.displayName,
    };

    // Auto-complete profile: transition from "incomplete" to "pending" if all required fields are now valid
    if (currentUser.accountStatus === "incomplete" && isProfileComplete(mergedData)) {
      updateData.accountStatus = "pending";
    }

    // Optimistic update: let database constraints handle uniqueness
    let updatedUser;
    try {
      updatedUser = await db
        .update(users)
        .set(updateData)
        .where(eq(users.privyDid, privyDid))
        .returning();
    } catch (error) {
      // Handle PostgreSQL unique constraint violations (error code 23505)
      if (error instanceof DatabaseError && error.code === "23505") {
        // Parse constraint name to return specific error
        const constraintName = error.constraint || "";

        if (constraintName.includes("username")) {
          return apiErrors.conflict("Username already taken");
        }
        if (constraintName.includes("email")) {
          return apiErrors.conflict("Email already taken");
        }

        // Generic constraint violation
        return apiErrors.conflict("Value already exists");
      }

      // Re-throw other errors
      throw error;
    }

    if (updatedUser.length === 0) {
      return apiErrors.notFound("User");
    }

    return apiSuccess(
      { user: updatedUser[0] },
      { message: "Profile updated successfully" }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return apiErrors.internal("Failed to update profile");
  }
});
