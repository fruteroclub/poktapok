import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/privy/middleware";
import { apiSuccess, apiError, apiErrors } from "@/lib/api/response";
import { API_ERROR_CODES } from "@/types/api-response";

export const PATCH = requireAuth(async (request: NextRequest, authUser) => {
  try {
    const body = await request.json();
    const { email, username, displayName, bio, avatarUrl } = body;

    // Use privyDid from verified token, not from request body
    const privyDid = authUser.privyDid;

    if (!email || !username || !displayName) {
      return apiError("email, username and displayName are required", {
        code: API_ERROR_CODES.VALIDATION_ERROR,
        status: 400,
      });
    }

    // Check if username is already taken by another user
    const existingUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (
      existingUsername.length > 0 &&
      existingUsername[0].privyDid !== privyDid
    ) {
      return apiErrors.conflict("Username already taken");
    }

    // Check if email is already taken by another user
    const existingEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingEmail.length > 0 && existingEmail[0].privyDid !== privyDid) {
      return apiErrors.conflict("Email already taken");
    }

    // Update user profile and change status to active (auto-approve for MVP)
    const updatedUser = await db
      .update(users)
      .set({
        email,
        username,
        displayName,
        bio: bio || null,
        avatarUrl: avatarUrl || null,
        accountStatus: "active", // Auto-approve for MVP (was: "pending")
        updatedAt: new Date(),
      })
      .where(eq(users.privyDid, privyDid))
      .returning();

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
