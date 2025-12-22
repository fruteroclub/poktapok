import { apiFetch } from "@/lib/api/fetch";
import type {
  DirectoryResponse,
  DirectoryFilters,
  DirectoryCountry,
  DirectoryData,
  DirectoryCountriesData,
} from "@/types/api-v1";

/**
 * Fetch directory profiles with filters and pagination
 *
 * Uses the new apiFetch wrapper for automatic error handling
 * and type-safe responses.
 *
 * @param filters - DirectoryFilters object
 * @returns DirectoryResponse with profiles and pagination data
 * @throws ApiError if fetch fails
 */
export async function fetchDirectoryProfiles(
  filters: DirectoryFilters
): Promise<DirectoryResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.learningTrack) params.set("track", filters.learningTrack);
  if (filters.availabilityStatus)
    params.set("status", filters.availabilityStatus);
  if (filters.country) params.set("country", filters.country);
  if (filters.page) params.set("page", filters.page.toString());
  if (filters.limit) params.set("limit", filters.limit.toString());

  const url = `/api/directory?${params.toString()}`;

  // apiFetch automatically unwraps the { success, data, meta } envelope
  // and throws ApiError on failure
  const response = await apiFetch<DirectoryData & { meta?: { pagination: any } }>(url);

  // Extract pagination from meta
  const pagination = response.meta?.pagination || {
    page: filters.page || 1,
    limit: filters.limit || 24,
    total: 0,
    totalPages: 0,
    hasMore: false,
  };

  return {
    profiles: response.profiles,
    pagination,
  };
}

/**
 * Fetch list of countries with profiles
 * Used for country filter dropdown
 *
 * @returns Array of countries with count
 * @throws ApiError if fetch fails
 */
export async function fetchDirectoryCountries(): Promise<DirectoryCountry[]> {
  // apiFetch unwraps { success: true, data: { countries: [...] } }
  const data = await apiFetch<DirectoryCountriesData>("/api/directory/countries");
  return data.countries;
}
