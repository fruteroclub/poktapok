'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/directory/search-bar'
import { Filters } from '@/components/directory/filters'
import { DirectoryGrid } from '@/components/directory/directory-grid'
import {
  useDirectoryProfiles,
  useDirectoryCountries,
} from '@/hooks/use-directory'
import { formatProfileCount } from '@/lib/utils/directory'
import type { DirectoryFilters } from '@/types/api-v1'
import PageWrapper from '@/components/layout/page-wrapper'
import { Section } from '@/components/layout/section'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { SlidersHorizontal } from 'lucide-react'

export default function DirectoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Parse skills from URL (comma-separated)
  const skillsParam = searchParams.get('skills')
  const skillsFromUrl = skillsParam
    ? skillsParam.split(',').filter(Boolean)
    : undefined

  const [currentFilters, setCurrentFilters] = useState<DirectoryFilters>({
    search: searchParams.get('search') || undefined,
    learningTrack:
      (searchParams.get('learningTrack') as
        | 'ai'
        | 'crypto'
        | 'privacy'
        | undefined) || undefined,
    availabilityStatus:
      (searchParams.get('availabilityStatus') as
        | 'available'
        | 'open_to_offers'
        | 'unavailable'
        | undefined) || undefined,
    country: searchParams.get('country') || undefined,
    skills: skillsFromUrl,
    page: parseInt(searchParams.get('page') || '1'),
    limit: 24,
  })

  const { data, isLoading, isError } = useDirectoryProfiles(currentFilters)
  const { data: countriesData } = useDirectoryCountries()

  const updateFilter = (
    key: keyof DirectoryFilters,
    value: string | string[] | null,
  ) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      // Handle array values (skills)
      if (Array.isArray(value)) {
        params.set(key, value.join(','))
      } else {
        params.set(key, value)
      }
    } else {
      params.delete(key)
    }

    if (key !== 'page') {
      params.delete('page')
    }

    router.push(`/directory?${params.toString()}`)

    setCurrentFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      ...(key !== 'page' && { page: 1 }),
    }))
  }

  const handleClearAll = () => {
    router.push('/directory')
    setCurrentFilters({
      page: 1,
      limit: 24,
    })
  }

  const handleLoadMore = () => {
    const nextPage = (currentFilters.page || 1) + 1
    updateFilter('page', nextPage.toString())
  }

  const hasActiveFilters =
    currentFilters.search ||
    currentFilters.learningTrack ||
    currentFilters.availabilityStatus ||
    currentFilters.country ||
    (currentFilters.skills && currentFilters.skills.length > 0)

  const profiles = data?.profiles || []
  const pagination = data?.pagination
  const countries = countriesData || []

  return (
    <PageWrapper>
      <div className="page">
        <div className="page-content">
          <div className="header-section">
            <h1 className="mb-2 text-4xl font-bold">Talent Directory</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Discover talented builders from Latin America
            </p>
          </div>

          <Section className="grid grid-cols-1 items-start gap-4 lg:grid-cols-4">
            {/* Desktop Sidebar - Hidden on mobile */}
            <aside className="hidden lg:col-span-1 lg:block">
              <div className="lg:sticky lg:top-8">
                <Filters
                  filters={currentFilters}
                  countries={countries}
                  onFilterChange={updateFilter}
                  onClearAll={handleClearAll}
                />
              </div>
            </aside>

            <div className="min-h-[600px] space-y-4 lg:col-span-3">
              <div className="flex items-center gap-2">
                {/* Mobile Filter Button */}
                <Sheet
                  open={mobileFiltersOpen}
                  onOpenChange={setMobileFiltersOpen}
                >
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-[300px] px-4 sm:w-[400px]"
                  >
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div>
                      <Filters
                        filters={currentFilters}
                        countries={countries}
                        onFilterChange={(key, value) => {
                          updateFilter(key, value)
                          setMobileFiltersOpen(false)
                        }}
                        onClearAll={() => {
                          handleClearAll()
                          setMobileFiltersOpen(false)
                        }}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Search Bar */}
                <div className="flex-1">
                  <SearchBar
                    value={currentFilters.search || ''}
                    onChange={(value) => updateFilter('search', value || null)}
                    placeholder="Search by name or bio..."
                  />
                </div>
              </div>

              {!isLoading && profiles.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatProfileCount(pagination?.total || profiles.length)}
                  </p>
                </div>
              )}

              {isError && (
                <div className="py-8 text-center">
                  <p className="text-red-500">
                    Failed to load directory. Please try again.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
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
                    <div className="flex justify-center">
                      <Button onClick={handleLoadMore} size="lg">
                        Load More
                      </Button>
                    </div>
                  )}

                  {pagination && !pagination.hasMore && profiles.length > 0 && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        You&apos;ve reached the end of the directory
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </Section>
        </div>
      </div>
    </PageWrapper>
  )
}
