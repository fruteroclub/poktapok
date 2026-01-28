import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import {
  fetchDirectoryProfiles,
  fetchDirectoryCountries,
} from '@/services/directory'
import type { DirectoryFilters } from '@/types/api-v1'

/**
 * Hook for fetching directory profiles with filters and pagination
 *
 * Features:
 * - Automatic caching with TanStack Query
 * - Stale time: 2 minutes (directory data changes infrequently)
 * - Refetch on window focus
 *
 * @param filters - DirectoryFilters object
 * @returns TanStack Query result with profiles and pagination
 */
export function useDirectoryProfiles(filters: DirectoryFilters) {
  return useQuery({
    queryKey: ['directory', 'profiles', filters],
    queryFn: () => fetchDirectoryProfiles(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook for infinite scroll directory profiles
 *
 * Used for mobile infinite scroll implementation
 * Desktop uses regular pagination with "Load More" button
 *
 * @param filters - DirectoryFilters object (without page)
 * @returns TanStack Infinite Query result
 */
export function useDirectoryProfilesInfinite(
  filters: Omit<DirectoryFilters, 'page'>,
) {
  return useInfiniteQuery({
    queryKey: ['directory', 'profiles', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) =>
      fetchDirectoryProfiles({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore
        ? lastPage.pagination.page + 1
        : undefined
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook for fetching list of countries with profiles
 *
 * Used for populating country filter dropdown
 * Data is cached aggressively as it changes very infrequently
 *
 * @returns TanStack Query result with countries array
 */
export function useDirectoryCountries() {
  return useQuery({
    queryKey: ['directory', 'countries'],
    queryFn: fetchDirectoryCountries,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}
