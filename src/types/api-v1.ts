/**
 * API v1 Types - Centralized API response and request types
 * Single source of truth for all API-related TypeScript interfaces
 */

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  username: string;
  displayName: string | null;
  email: string | null;
  bio: string | null;
  avatarUrl: string | null;
  accountStatus: string;
}

// ============================================================================
// Profile Types
// ============================================================================

export interface Profile {
  id: string;
  userId: string;
  city: string;
  country: string;
  countryCode: string;
  learningTracks: string[];
  availabilityStatus: string;
  socialLinks: {
    github?: string; // Username only (e.g., "octocat")
    twitter?: string; // Username only (e.g., "@username" or "username")
    linkedin?: string; // Username only (e.g., "username" from linkedin.com/in/username)
    telegram?: string; // Username only (e.g., "@username" or "username")
  } | null;
}

// ============================================================================
// Auth API Responses
// ============================================================================

export interface MeResponse {
  user: User;
  profile: Profile | null;
}

// ============================================================================
// Profile API Responses
// ============================================================================

export interface CreateProfileResponse {
  success: boolean;
  profile: Profile;
  message: string;
}
