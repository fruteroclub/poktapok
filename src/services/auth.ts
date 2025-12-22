/**
 * Auth Service - API abstractions for authentication endpoints
 */

import type { MeResponse } from "@/types/api-v1";

/**
 * Fetch current authenticated user and their profile
 * @throws Error if request fails or user is not authenticated
 */
export async function fetchMe(): Promise<MeResponse> {
  const response = await fetch("/api/auth/me");

  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }

  return response.json();
}
