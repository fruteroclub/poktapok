import type {
  DirectoryResponse,
  DirectoryFilters,
  DirectoryCountry,
} from "@/types/api-v1";

/**
 * Fetch directory profiles with filters and pagination
 *
 * @param filters - DirectoryFilters object
 * @returns DirectoryResponse with profiles and pagination data
 * @throws Error if fetch fails
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

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to fetch directory profiles");
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch directory profiles");
  }
}

/**
 * Fetch list of countries with profiles
 * Used for country filter dropdown
 *
 * @returns Array of countries with count
 * @throws Error if fetch fails
 */
export async function fetchDirectoryCountries(): Promise<DirectoryCountry[]> {
  try {
    const response = await fetch("/api/directory/countries");

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to fetch countries");
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch countries");
  }
}
