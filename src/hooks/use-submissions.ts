/**
 * Submissions hooks for admin submissions management
 * TanStack Query hooks for submissions operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSubmissions,
  approveSubmission,
  rejectSubmission,
  type ApproveSubmissionRequest,
  type RejectSubmissionRequest,
} from "@/services/submissions";
import type { ApiError } from "@/lib/api/fetch";

/**
 * Hook to fetch all submissions with optional status filter
 */
export function useSubmissions(status: string = 'pending') {
  return useQuery({
    queryKey: ["admin", "submissions", status],
    queryFn: () => fetchSubmissions(status),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to approve a submission
 */
export function useApproveSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      submissionId,
      data
    }: {
      submissionId: string;
      data: ApproveSubmissionRequest
    }) => approveSubmission(submissionId, data),
    onSuccess: () => {
      // Invalidate submissions query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["admin", "submissions"] });
    },
    onError: (error: ApiError) => {
      console.error("Failed to approve submission:", error);
    },
  });
}

/**
 * Hook to reject a submission
 */
export function useRejectSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      submissionId,
      data
    }: {
      submissionId: string;
      data: RejectSubmissionRequest
    }) => rejectSubmission(submissionId, data),
    onSuccess: () => {
      // Invalidate submissions query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["admin", "submissions"] });
    },
    onError: (error: ApiError) => {
      console.error("Failed to reject submission:", error);
    },
  });
}
