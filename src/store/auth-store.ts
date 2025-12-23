import { create } from "zustand";
import type { User, Profile } from "@/lib/db/schema";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setAuthData: (data: { user: User | null; profile: Profile | null }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setProfile: (profile) =>
    set({
      profile,
    }),

  setLoading: (isLoading) =>
    set({
      isLoading,
    }),

  setAuthData: (data) =>
    set({
      user: data.user,
      profile: data.profile,
      isAuthenticated: !!data.user,
    }),

  clearAuth: () =>
    set({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));
