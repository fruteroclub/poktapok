/**
 * Activities service functions
 * Abstracts API calls for admin activities management
 */

import { apiFetch } from "@/lib/api/fetch";

export interface Activity {
  id: string;
  title: string;
  description: string;
  activityType: string;
  category: string | null;
  difficulty: string;
  rewardPulpaAmount: string;
  status: string;
  currentSubmissionsCount: number;
  totalAvailableSlots: number | null;
  createdAt: string;
}

export interface ListActivitiesFilters {
  status?: string;
  type?: string;
  search?: string;
}

export interface ListActivitiesResponse {
  activities: Activity[];
}

/**
 * Fetch all activities with optional filters
 */
export async function fetchActivities(
  filters?: ListActivitiesFilters
): Promise<ListActivitiesResponse> {
  const params = new URLSearchParams();

  if (filters?.status && filters.status !== 'all') {
    params.append('status', filters.status);
  }
  if (filters?.type && filters.type !== 'all') {
    params.append('type', filters.type);
  }
  if (filters?.search) {
    params.append('search', filters.search);
  }

  const queryString = params.toString();
  const url = queryString ? `/api/admin/activities?${queryString}` : '/api/admin/activities';

  return apiFetch<ListActivitiesResponse>(url);
}

export interface CreateActivityRequest {
  title: string;
  description: string;
  instructions?: string;
  activity_type: string;
  category?: string;
  difficulty: string;
  reward_pulpa_amount: string;
  evidence_requirements: {
    url_required: boolean;
    screenshot_required: boolean;
    text_required: boolean;
  };
  verification_type: string;
  max_submissions_per_user?: number;
  total_available_slots?: number;
  starts_at?: string;
  expires_at?: string;
  status: string;
}

export interface CreateActivityResponse {
  activity: Activity;
}

/**
 * Create a new activity
 */
export async function createActivity(
  data: CreateActivityRequest
): Promise<CreateActivityResponse> {
  return apiFetch<CreateActivityResponse>('/api/admin/activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export interface PublicActivitiesFilters {
  type?: string;
  difficulty?: string;
  search?: string;
  status?: string;
}

export interface PublicActivitiesResponse {
  activities: Activity[];
}

/**
 * Fetch public activities (user-facing, only active activities)
 */
export async function fetchPublicActivities(
  filters?: PublicActivitiesFilters
): Promise<PublicActivitiesResponse> {
  const params = new URLSearchParams({ status: filters?.status || 'active' });

  if (filters?.type && filters.type !== 'all') {
    params.append('type', filters.type);
  }
  if (filters?.difficulty && filters.difficulty !== 'all') {
    params.append('difficulty', filters.difficulty);
  }
  if (filters?.search) {
    params.append('search', filters.search);
  }

  const queryString = params.toString();
  const url = queryString ? `/api/activities?${queryString}` : '/api/activities';

  return apiFetch<PublicActivitiesResponse>(url);
}

export interface ActivityDetail {
  id: string;
  title: string;
  description: string;
  instructions: string | null;
  activityType: string;
  category: string | null;
  difficulty: string;
  rewardPulpaAmount: string;
  evidenceRequirements: {
    url_required: boolean;
    screenshot_required: boolean;
    text_required: boolean;
  };
  maxSubmissionsPerUser: number | null;
  totalAvailableSlots: number | null;
  currentSubmissionsCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  status: string;
}

export interface ActivityDetailResponse {
  activity: ActivityDetail;
}

// The API returns the activity directly with userHasSubmitted field
type ActivityDetailApiResponse = ActivityDetail & { userHasSubmitted: boolean };

/**
 * Fetch activity detail by ID
 * Note: API returns the activity object directly, we wrap it for consistency
 */
export async function fetchActivityDetail(
  activityId: string
): Promise<ActivityDetailResponse> {
  const activity = await apiFetch<ActivityDetailApiResponse>(`/api/activities/${activityId}`);
  return { activity };
}

export interface SubmitActivityRequest {
  submission_url?: string;
  submission_text?: string;
}

export interface SubmitActivityResponse {
  submission: {
    id: string;
    status: string;
  };
}

/**
 * Submit activity completion
 */
export async function submitActivity(
  activityId: string,
  data: SubmitActivityRequest
): Promise<SubmitActivityResponse> {
  return apiFetch<SubmitActivityResponse>(`/api/activities/${activityId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
