"use client";

import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import type { Profile } from "@/types/api-v1";

export type AuthUser = {
  isAuthenticated: boolean;
  profile: Profile | null;
  user: {
    id: string;
    privyDid: string;
    email: string | null;
    username: string | null;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    accountStatus: string;
    role: string;
    createdAt: string;
  };
};

/**
 * Hook to fetch and cache the current authenticated user's data
 * Syncs with Zustand store for global auth state management
 *
 * @returns React Query result with user data or null if not authenticated
 *
 * @example
 * const { data, isLoading, error } = useAuth();
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (!data) return <div>Not authenticated</div>;
 *
 * const { user, profile } = data;
 */
export function useAuth() {
  const { authenticated, ready } = usePrivy();
  const { clearAuth, isAuthenticated, setAuthData, setLoading } = useAuthStore();

  const query = useQuery<AuthUser | null>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      if (!authenticated) return null;

      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        if (res.status === 401) return null;
        throw new Error("Failed to fetch user");
      }

      const responseData = await res.json();

      // Handle new API response pattern: { success: true, data: { user, profile } }
      if (responseData.success && responseData.data) {
        return {
          ...responseData.data,
          isAuthenticated: !!responseData.data.user,
        };
      }

      // Fallback for old format (backward compatibility)
      return {
        isAuthenticated: isAuthenticated,
        ...responseData,
      };
    },
    enabled: ready && authenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Sync React Query data with Zustand store
  useEffect(() => {
    if (query.isLoading) {
      setLoading(true);
    } else {
      setLoading(false);

      if (query.data) {
        setAuthData({
          profile: query.data.profile,
          user: query.data.user,
        });
      } else if (!authenticated) {
        clearAuth();
      }
    }
  }, [query.data, query.isLoading, authenticated, setAuthData, setLoading, clearAuth]);

  return query;
}
