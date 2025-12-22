import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/privy/middleware";
import { profileSchema } from "@/lib/validators/profile";
import { z } from "zod";
import { apiSuccess, apiValidationError, apiErrors } from "@/lib/api/response";

/**
 * POST /api/profiles
 *
 * Create or update profile for authenticated user
 * - Creates new profile if doesn't exist
 * - Updates existing profile if already exists
 * - Profile is linked to user via userId
 *
 * Request body:
 * - city: string
 * - country: string
 * - countryCode: string (ISO 3166-1 alpha-2)
 * - learningTrack: "ai" | "crypto" | "privacy"
 * - availabilityStatus: "available" | "open_to_offers" | "unavailable"
 * - socialLinks: { github?, twitter?, linkedin?, telegram? }
 *
 * Security: Uses requireAuth middleware to extract privyDid from verified token
 */
export const POST = requireAuth(async (request: NextRequest, authUser) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validated = profileSchema.parse(body);

    // Use privyDid from verified token
    const privyDid = authUser.privyDid;

    console.log("Profile creation request for privyDid:", privyDid);

    // Get user from database
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.privyDid, privyDid))
      .limit(1);

    if (userResults.length === 0) {
      return apiErrors.notFound("User");
    }

    const user = userResults[0];

    // Prepare profile data
    const profileData = {
      userId: user.id,
      city: validated.city,
      country: validated.country,
      countryCode: validated.countryCode,
      // Convert single selection to array for database compatibility
      learningTracks: [validated.learningTrack],
      availabilityStatus: validated.availabilityStatus,
      githubUrl: validated.socialLinks?.github || null,
      twitterUrl: validated.socialLinks?.twitter || null,
      linkedinUrl: validated.socialLinks?.linkedin || null,
      telegramHandle: validated.socialLinks?.telegram || null,
      profileVisibility: "public" as const,
      updatedAt: new Date(),
    };

    // Insert or update profile (upsert)
    const upsertedProfiles = await db
      .insert(profiles)
      .values(profileData)
      .onConflictDoUpdate({
        target: profiles.userId,
        set: profileData,
      })
      .returning();

    const profile = upsertedProfiles[0];

    console.log("Profile created/updated for user:", user.id);

    return apiSuccess(
      { profile },
      { message: "Profile created successfully" }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return apiValidationError(error);
    }

    // Handle unexpected errors
    console.error("Error creating profile:", error);
    return apiErrors.internal("Failed to create profile");
  }
});
