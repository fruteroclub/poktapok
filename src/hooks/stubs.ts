/**
 * STUB HOOKS - Minimal stubs for features not yet migrated
 *
 * Most hooks have been migrated to Convex.
 * These remain for features that need additional schema work.
 */

'use client'

// ============================================================
// Submissions (TODO: Add submissions table to Convex)
// ============================================================

export function useSubmitApplication() {
  return {
    mutate: () => {},
    mutateAsync: async () => {},
    isPending: false,
  }
}

// Re-export actual implementations for backward compatibility
export { usePublicSessions, useSessionDetail, useSession, useAllSessions, useDeleteSession } from './use-sessions'
export { useActivePrograms, usePublicProgram, useProgramDashboard, useProgramSessions } from './use-programs'
export { usePublicActivities, useActivityDetail, useSubmitActivity } from './use-activities'
export { useDirectoryProfiles } from './use-directory'
export { useProject, useUserProjects } from './use-projects'
export { usePendingUsers, useApproveUser, useRejectUser, useSessionAttendance } from './use-admin'
export { useEvents } from './use-events'
