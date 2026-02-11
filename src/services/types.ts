/**
 * Service Types
 *
 * Stub types for services that haven't been migrated to Convex yet.
 */

export interface Activity {
  id: string
  title: string
  description: string | null
  activityType: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  rewardPulpaAmount: string
  status: string
  createdAt: string
  totalAvailableSlots?: number
  currentSubmissionsCount?: number
}

export interface ActivityDetail extends Activity {
  instructions?: string
  submissionCount?: number
}

export type EventStatus = 'upcoming' | 'live' | 'past' | 'cancelled'

export interface LumaEventMetadata {
  title: string
  description?: string
  startDate: string
  endDate?: string
  location?: string
  coverImage?: string
  lumaUrl: string
  lumaSlug?: string
}

export interface Submission {
  id: string
  activityId: string
  userId: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
}

export interface User {
  id: string
  username: string | null
  email: string | null
  displayName: string | null
  role: string
  accountStatus: string
}
