import { ProfileCard } from './user-card'
import { SkeletonCard } from './skeleton-card'
import { EmptyState } from './empty-state'
import type { DirectoryProfile } from '@/types/api-v1'

interface DirectoryGridProps {
  profiles: DirectoryProfile[]
  isLoading: boolean
  onClearFilters: () => void
  hasActiveFilters: boolean
}

export function DirectoryGrid({
  profiles,
  isLoading,
  onClearFilters,
  hasActiveFilters,
}: DirectoryGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (profiles.length === 0) {
    return (
      <EmptyState
        onClearFilters={onClearFilters}
        hasActiveFilters={hasActiveFilters}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {profiles.map((profile) => (
        <ProfileCard key={profile.id} profile={profile} />
      ))}
    </div>
  )
}
