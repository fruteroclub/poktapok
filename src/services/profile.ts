/**
 * Profile Service - API abstractions for profile endpoints
 */

import type { ProfileFormData } from "@/lib/validators/profile";

interface CreateProfileResponse {
  success: boolean;
  profile: {
    id: string;
    userId: string;
    city: string;
    country: string;
    countryCode: string;
    learningTracks: string[];
    availabilityStatus: string;
    socialLinks: Record<string, string> | null;
  };
  message: string;
}

/**
 * Create or update a profile
 * @param data - Profile form data
 * @throws Error if request fails or validation errors occur
 */
export async function createProfile(
  data: ProfileFormData
): Promise<CreateProfileResponse> {
  const response = await fetch("/api/profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create profile");
  }

  return response.json();
}
