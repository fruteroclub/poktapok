'use client'

/**
 * ProgramsContent - Client component for programs directory
 * Handles data fetching, filtering, and search
 */

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import PageWrapper from '@/components/layout/page-wrapper'
import { ProgramsGrid } from '@/components/jam/programs-grid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useActivePrograms } from '@/hooks/use-onboarding'
import type { Program } from '@/types/api-v1'

type ProgramTypeFilter = 'all' | 'cohort' | 'evergreen'

export function ProgramsContent() {
  const [typeFilter, setTypeFilter] = useState<ProgramTypeFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading, isError, error } = useActivePrograms()

  const filteredPrograms = useMemo(() => {
    if (!data?.programs) return []

    let filtered = data.programs as Program[]

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter((program) => program.programType === typeFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (program) =>
          program.name.toLowerCase().includes(query) ||
          program.description?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [data?.programs, typeFilter, searchQuery])

  if (isError) {
    return (
      <PageWrapper>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive">Error al cargar programas</h2>
            <p className="mt-2 text-muted-foreground">
              {error instanceof Error ? error.message : 'Ocurrió un error desconocido'}
            </p>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl font-bold">Programas de aprendizaje</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Explora todos los programas disponibles y encuentra el perfecto para ti
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Type Filter Buttons */}
          <div className="flex gap-2">
            <Button
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setTypeFilter('all')}
            >
              Todos
            </Button>
            <Button
              variant={typeFilter === 'cohort' ? 'default' : 'outline'}
              onClick={() => setTypeFilter('cohort')}
            >
              Cohorts
            </Button>
            <Button
              variant={typeFilter === 'evergreen' ? 'default' : 'outline'}
              onClick={() => setTypeFilter('evergreen')}
            >
              Abiertos
            </Button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar programas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4 rounded-lg border p-6">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPrograms.length > 0 ? (
          <ProgramsGrid
            programs={filteredPrograms}
            title=""
            emptyMessage="No se encontraron programas con los filtros seleccionados."
          />
        ) : (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-semibold">No se encontraron programas</h3>
              <p className="mt-2 text-muted-foreground">
                Intenta ajustar los filtros o la búsqueda
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setTypeFilter('all')
                  setSearchQuery('')
                }}
                className="mt-4"
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
