/**
 * Submissions service functions
 * Abstracts API calls for admin submissions management
 */

import { apiFetch } from "@/lib/api/fetch";

export interface Submission {
  submission: {
    id: string;
    userId: string;
    activityId: string;
    status: string;
    submissionUrl: string | null;
    submissionText: string | null;
    reviewNotes: string | null;
    rewardPulpaAmount: string | null;
    submittedAt: string;
    reviewedAt: string | null;
  };
  user: {
    id: string;
    username: string | null;
    email: string | null;
    appWallet: string | null;
  };
  activity: {
    id: string;
    title: string;
    activityType: string;
    rewardPulpaAmount: string;
  };
}

export interface ListSubmissionsResponse {
  submissions: Submission[];
}

export interface ApproveSubmissionRequest {
  review_notes?: string;
}

export interface RejectSubmissionRequest {
  review_notes: string;
}

export interface ApproveSubmissionResponse {
  submissionId: string;
  status: string;
}

export interface RejectSubmissionResponse {
  submissionId: string;
  status: string;
}

/**
 * Fetch all submissions with optional status filter
 */
export async function fetchSubmissions(
  status: string = 'pending'
): Promise<ListSubmissionsResponse> {
  const params = new URLSearchParams({ status });
  return apiFetch<ListSubmissionsResponse>(`/api/admin/submissions?${params.toString()}`);
}

/**
 * Approve a submission
 */
export async function approveSubmission(
  submissionId: string,
  data: ApproveSubmissionRequest
): Promise<ApproveSubmissionResponse> {
  return apiFetch<ApproveSubmissionResponse>(
    `/api/admin/submissions/${submissionId}/approve`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
}

/**
 * Reject a submission
 */
export async function rejectSubmission(
  submissionId: string,
  data: RejectSubmissionRequest
): Promise<RejectSubmissionResponse> {
  return apiFetch<RejectSubmissionResponse>(
    `/api/admin/submissions/${submissionId}/reject`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
}
