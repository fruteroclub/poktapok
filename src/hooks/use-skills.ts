'use client'

/**
 * Skill type for the skills filter
 */
interface Skill {
  id: string
  name: string
  category: string
}

/**
 * Hook for skills list
 */
export function useSkills() {
  // TODO: Implement when skills table has data
  // For now, return empty array with proper typing
  const skills: Skill[] = []
  
  return {
    data: { skills },
    isLoading: false,
    isError: false,
    error: null,
  }
}
