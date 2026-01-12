import { apiFetch } from '@/lib/api/fetch'
import type {
  GetProgramEnrollmentsResponse,
  CreateEnrollmentRequest,
  CreateEnrollmentResponse,
  UpdateEnrollmentRequest,
  UpdateEnrollmentResponse,
  DeleteEnrollmentResponse,
} from '@/types/api-v1'

/**
 * Get all enrollments for a program
 */
export async function fetchProgramEnrollments(
  programId: string
): Promise<GetProgramEnrollmentsResponse> {
  return apiFetch<GetProgramEnrollmentsResponse>(
    `/api/admin/programs/${programId}/enrollments`
  )
}

/**
 * Create a new enrollment
 */
export async function createEnrollment(
  programId: string,
  data: CreateEnrollmentRequest
): Promise<CreateEnrollmentResponse> {
  return apiFetch<CreateEnrollmentResponse>(
    `/api/admin/programs/${programId}/enrollments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  )
}

/**
 * Update an enrollment
 */
export async function updateEnrollment(
  programId: string,
  enrollmentId: string,
  data: UpdateEnrollmentRequest
): Promise<UpdateEnrollmentResponse> {
  return apiFetch<UpdateEnrollmentResponse>(
    `/api/admin/programs/${programId}/enrollments/${enrollmentId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  )
}

/**
 * Delete an enrollment
 */
export async function deleteEnrollment(
  programId: string,
  enrollmentId: string
): Promise<DeleteEnrollmentResponse> {
  return apiFetch<DeleteEnrollmentResponse>(
    `/api/admin/programs/${programId}/enrollments/${enrollmentId}`,
    {
      method: 'DELETE',
    }
  )
}
