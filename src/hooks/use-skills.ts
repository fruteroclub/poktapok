/**
 * Skills TanStack Query Hooks
 *
 * React Query hooks for skills operations
 * Provides queries and mutations with optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ListSkillsQuery } from '@/types/api-v1';
import {
  fetchSkills,
  fetchUserSkills,
  linkProjectSkill,
  unlinkProjectSkill,
} from '@/services/skills';

/**
 * Query key factory for skills
 */
export const skillKeys = {
  all: ['skills'] as const,
  lists: () => [...skillKeys.all, 'list'] as const,
  list: (filters?: ListSkillsQuery) => [...skillKeys.lists(), filters] as const,
  userSkills: (userId: string) => [...skillKeys.all, 'user', userId] as const,
};

/**
 * Fetch all available skills with optional filters
 */
export function useSkills(filters?: ListSkillsQuery) {
  return useQuery({
    queryKey: skillKeys.list(filters),
    queryFn: () => fetchSkills(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes (skills change infrequently)
  });
}

/**
 * Fetch user's skills with project counts
 */
export function useUserSkills(userId?: string) {
  return useQuery({
    queryKey: skillKeys.userSkills(userId!),
    queryFn: () => fetchUserSkills(userId!),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId,
  });
}

/**
 * Link a skill to a project
 */
export function useLinkProjectSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, skillId }: { projectId: string; skillId: string }) =>
      linkProjectSkill(projectId, skillId),
    onSuccess: () => {
      // Invalidate skills queries to update usage counts
      queryClient.invalidateQueries({ queryKey: skillKeys.lists() });
      // Invalidate user skills queries
      queryClient.invalidateQueries({ queryKey: ['skills', 'user'] });
    },
  });
}

/**
 * Unlink a skill from a project
 */
export function useUnlinkProjectSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, skillId }: { projectId: string; skillId: string }) =>
      unlinkProjectSkill(projectId, skillId),
    onSuccess: () => {
      // Invalidate skills queries to update usage counts
      queryClient.invalidateQueries({ queryKey: skillKeys.lists() });
      // Invalidate user skills queries
      queryClient.invalidateQueries({ queryKey: ['skills', 'user'] });
    },
  });
}
