import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

interface EmptyStateProps {
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function EmptyState({ onClearFilters, hasActiveFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-6">
        <SearchX className="h-12 w-12 text-gray-400" />
      </div>

      <h3 className="text-xl font-semibold mb-2">No builders found</h3>

      {hasActiveFilters ? (
        <>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
            We couldn't find any builders matching your filters. Try adjusting your
            search criteria.
          </p>
          <Button onClick={onClearFilters} variant="outline">
            Clear all filters
          </Button>
        </>
      ) : (
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          No builders have joined the directory yet. Check back soon!
        </p>
      )}
    </div>
  );
}
