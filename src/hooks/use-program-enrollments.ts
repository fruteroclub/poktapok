import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  fetchProgramEnrollments,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
} from '@/services/admin/enrollments'
import type { CreateEnrollmentRequest, UpdateEnrollmentRequest } from '@/types/api-v1'

/**
 * Fetch all enrollments for a program
 */
export function useProgramEnrollments(programId: string) {
  return useQuery({
    queryKey: ['admin', 'programs', programId, 'enrollments'],
    queryFn: () => fetchProgramEnrollments(programId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Create a new enrollment
 */
export function useCreateEnrollment(programId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEnrollmentRequest) => createEnrollment(programId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'programs', programId, 'enrollments'],
      })
      queryClient.invalidateQueries({
        queryKey: ['admin', 'programs', programId],
      })
      toast.success('Student enrolled successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to enroll student')
    },
  })
}

/**
 * Update an enrollment
 */
export function useUpdateEnrollment(programId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ enrollmentId, data }: { enrollmentId: string; data: UpdateEnrollmentRequest }) =>
      updateEnrollment(programId, enrollmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'programs', programId, 'enrollments'],
      })
      queryClient.invalidateQueries({
        queryKey: ['admin', 'programs', programId],
      })
      toast.success('Enrollment updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update enrollment')
    },
  })
}

/**
 * Delete an enrollment
 */
export function useDeleteEnrollment(programId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (enrollmentId: string) => deleteEnrollment(programId, enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'programs', programId, 'enrollments'],
      })
      queryClient.invalidateQueries({
        queryKey: ['admin', 'programs', programId],
      })
      toast.success('Enrollment deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete enrollment')
    },
  })
}
