/**
 * Activities hooks for admin and public activities management
 * TanStack Query hooks for activities operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchActivities,
  createActivity,
  deleteActivity,
  fetchPublicActivities,
  fetchActivityDetail,
  submitActivity,
  type ListActivitiesFilters,
  type CreateActivityRequest,
  type PublicActivitiesFilters,
  type SubmitActivityRequest
} from "@/services/activities";

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
      queryClient.invalidateQueries({ queryKey: ["public", "activities"] });
    },
  });
}

/**
 * Hook to fetch public activities (user-facing, only active activities)
 */
export function usePublicActivities(filters?: PublicActivitiesFilters) {
  return useQuery({
    queryKey: ["public", "activities", filters],
    queryFn: () => fetchPublicActivities(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch activity detail by ID
 */
export function useActivityDetail(activityId: string) {
  return useQuery({
    queryKey: ["activities", "detail", activityId],
    queryFn: () => fetchActivityDetail(activityId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!activityId,
  });
}

/**
 * Hook to submit activity completion
 */
export function useSubmitActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ activityId, data }: { activityId: string; data: SubmitActivityRequest }) =>
      submitActivity(activityId, data),
    onSuccess: (_, variables) => {
      // Invalidate activity detail to refresh submission count
      queryClient.invalidateQueries({ queryKey: ["activities", "detail", variables.activityId] });
      // Invalidate activities list to refresh counts
      queryClient.invalidateQueries({ queryKey: ["public", "activities"] });
    },
  });
}

/**
 * Hook to delete an activity (soft delete)
 */
export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) => deleteActivity(activityId),
    onSuccess: () => {
      // Invalidate all activities queries to refetch
      queryClient.invalidateQueries({ queryKey: ["admin", "activities"] });
      queryClient.invalidateQueries({ queryKey: ["public", "activities"] });
    },
  });
}
