import { Button } from '@/components/ui/button'
import { SearchX } from 'lucide-react'

interface EmptyStateProps {
  onClearFilters: () => void
  hasActiveFilters: boolean
}

export function EmptyState({
  onClearFilters,
  hasActiveFilters,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16">
      <div className="mb-6 rounded-full bg-gray-100 p-6 dark:bg-gray-800">
        <SearchX className="h-12 w-12 text-gray-400" />
      </div>

      <h3 className="mb-2 text-xl font-semibold">No builders found</h3>

      {hasActiveFilters ? (
        <>
          <p className="mb-6 max-w-md text-center text-gray-600 dark:text-gray-400">
            We couldn&apos;t find any builders matching your filters. Try
            adjusting your search criteria.
          </p>
          <Button onClick={onClearFilters} variant="outline">
            Clear all filters
          </Button>
        </>
      ) : (
        <p className="max-w-md text-center text-gray-600 dark:text-gray-400">
          No builders have joined the directory yet. Check back soon!
        </p>
      )}
    </div>
  )
}
