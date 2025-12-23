/**
 * API v1 Types - Centralized API response and request types
 * Single source of truth for all API-related TypeScript interfaces
 */

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  username: string | null;
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

// ============================================================================
// Directory Types
// ============================================================================

export interface DirectoryProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  city: string | null;
  country: string | null;
  countryCode: string | null;
  learningTracks: ("ai" | "crypto" | "privacy")[] | null;
  availabilityStatus: "available" | "open_to_offers" | "unavailable";
  completedBounties: number;
  totalEarningsUsd: number;
  githubUrl: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  telegramHandle: string | null;
  createdAt: Date;
}

export interface DirectoryFilters {
  search?: string;
  learningTrack?: "ai" | "crypto" | "privacy";
  availabilityStatus?: "available" | "open_to_offers" | "unavailable";
  country?: string;
  page?: number;
  limit?: number;
}

export interface DirectoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Directory data structure (wrapped in ApiResponse)
 */
export interface DirectoryData {
  profiles: DirectoryProfile[];
}

/**
 * Directory response type (API returns this wrapped in success envelope)
 * The pagination is in the meta field
 */
export interface DirectoryResponse {
  profiles: DirectoryProfile[];
  pagination: DirectoryPagination;
}

export interface DirectoryCountry {
  country: string;
  countryCode: string;
  count: number;
}

/**
 * Directory countries data structure (wrapped in ApiResponse)
 */
export interface DirectoryCountriesData {
  countries: DirectoryCountry[];
}
