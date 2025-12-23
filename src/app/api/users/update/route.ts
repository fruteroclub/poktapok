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

      updateData.username = username;
    }

    if (email !== undefined) {
      if (!email || email.trim() === "") {
        return apiError("Email cannot be empty", {
          code: API_ERROR_CODES.VALIDATION_ERROR,
          status: 400,
        });
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

    // Update user profile
    const updatedUser = await db
      .update(users)
      .set(updateData)
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
