/**
 * Attendance service functions for admin operations
 * Abstracts API calls for attendance management
 */

import { apiFetch } from '@/lib/api/fetch'
import type {
  MarkAttendanceRequest,
  MarkAttendanceResponse,
  BulkAttendanceRequest,
  BulkAttendanceResponse,
  SessionAttendanceResponse,
} from '@/types/api-v1'

/**
 * Mark attendance for users at a session
 */
export async function markAttendance(
  data: MarkAttendanceRequest,
): Promise<MarkAttendanceResponse> {
  return apiFetch<MarkAttendanceResponse>('/api/admin/attendance/mark', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

/**
 * Bulk mark attendance with different statuses per user
 */
export async function bulkMarkAttendance(
  data: BulkAttendanceRequest,
): Promise<BulkAttendanceResponse> {
  return apiFetch<BulkAttendanceResponse>('/api/admin/attendance/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

/**
 * Get attendance records for a specific session
 */
export async function fetchSessionAttendance(
  sessionId: string,
): Promise<SessionAttendanceResponse> {
  return apiFetch<SessionAttendanceResponse>(
    `/api/admin/attendance/session/${sessionId}`,
  )
}
