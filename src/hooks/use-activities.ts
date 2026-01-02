/**
 * Activities hooks for admin activities management
 * TanStack Query hooks for activities operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchActivities, createActivity, type ListActivitiesFilters, type CreateActivityRequest } from "@/services/activities";

/**
 * Hook to fetch all activities with optional filters
 */
export function useActivities(filters?: ListActivitiesFilters) {
  return useQuery({
    queryKey: ["admin", "activities", filters],
    queryFn: () => fetchActivities(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to create a new activity
 */
export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateActivityRequest) => createActivity(data),
    onSuccess: () => {
      // Invalidate all activities queries to refetch with new data
      queryClient.invalidateQueries({ queryKey: ["admin", "activities"] });
    },
  });
}
