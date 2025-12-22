/**
 * Auth Service - API abstractions for authentication endpoints
 */

import { apiFetch } from "@/lib/api/fetch";
import type { MeResponse } from "@/types/api-v1";

/**
 * Fetch current authenticated user and their profile
 *
 * Uses the new apiFetch wrapper for automatic error handling
 * and type-safe responses.
 *
 * @throws ApiError if request fails or user is not authenticated
 */
export async function fetchMe(): Promise<MeResponse> {
  // apiFetch automatically unwraps { success: true, data: { user, profile } }
  return apiFetch<MeResponse>("/api/auth/me");
}
