"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/directory/search-bar";
import { Filters } from "@/components/directory/filters";
import { DirectoryGrid } from "@/components/directory/directory-grid";
import {
  useDirectoryProfiles,
  useDirectoryCountries,
} from "@/hooks/use-directory";
import { formatProfileCount } from "@/lib/utils/directory";
import type { DirectoryFilters } from "@/types/api-v1";

export default function DirectoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentFilters, setCurrentFilters] = useState<DirectoryFilters>({
    search: searchParams.get("search") || undefined,
    learningTrack: (searchParams.get("learningTrack") as any) || undefined,
    availabilityStatus:
      (searchParams.get("availabilityStatus") as any) || undefined,
    country: searchParams.get("country") || undefined,
    page: parseInt(searchParams.get("page") || "1"),
    limit: 24,
  });

  const { data, isLoading, isError } = useDirectoryProfiles(currentFilters);
  const { data: countriesData } = useDirectoryCountries();

  const updateFilter = (key: keyof DirectoryFilters, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    if (key !== "page") {
      params.delete("page");
    }

    router.push(`/directory?${params.toString()}`);

    setCurrentFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      ...(key !== "page" && { page: 1 }),
    }));
  };

  const handleClearAll = () => {
    router.push("/directory");
    setCurrentFilters({
      page: 1,
      limit: 24,
    });
  };

  const handleLoadMore = () => {
    const nextPage = (currentFilters.page || 1) + 1;
    updateFilter("page", nextPage.toString());
  };

  const hasActiveFilters =
    currentFilters.search ||
    currentFilters.learningTrack ||
    currentFilters.availabilityStatus ||
    currentFilters.country;

  const profiles = data?.profiles || [];
  const pagination = data?.pagination;
  const countries = countriesData || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Talent Directory</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover talented builders from Latin America
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="sticky top-8">
              <Filters
                filters={currentFilters}
                countries={countries}
                onFilterChange={updateFilter}
                onClearAll={handleClearAll}
              />
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="mb-6">
              <SearchBar
                value={currentFilters.search || ""}
                onChange={(value) => updateFilter("search", value || null)}
                placeholder="Search by name or bio..."
              />
            </div>

            {pagination && !isLoading && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatProfileCount(pagination.total)}
                </p>
              </div>
            )}

            {isError && (
              <div className="text-center py-8">
                <p className="text-red-500">
                  Failed to load directory. Please try again.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            )}

            {!isError && (
              <>
                <DirectoryGrid
                  profiles={profiles}
                  isLoading={isLoading}
                  onClearFilters={handleClearAll}
                  hasActiveFilters={!!hasActiveFilters}
                />

                {pagination && pagination.hasMore && !isLoading && (
                  <div className="mt-8 flex justify-center">
                    <Button onClick={handleLoadMore} size="lg">
                      Load More
                    </Button>
                  </div>
                )}

                {pagination && !pagination.hasMore && profiles.length > 0 && (
                  <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You've reached the end of the directory
                    </p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
