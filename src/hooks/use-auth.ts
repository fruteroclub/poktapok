/**
 * Auth Hooks - TanStack Query hooks for authentication
 */

import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "@/services/auth";

/**
 * Hook to fetch current authenticated user and their profile
 * @returns Query result with user and profile data
 */
export function useMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}
