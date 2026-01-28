'use client'

/**
 * ActivitiesContent - Client component for activities directory
 * Handles data fetching, filtering, and search
 */

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import PageWrapper from '@/components/layout/page-wrapper'
import { ActivityCard } from '@/components/club/activity-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { usePublicActivities } from '@/hooks/use-activities'

type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced'

export function ActivitiesContent() {
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading, isError, error } = usePublicActivities({
    status: 'active',
  })

  const filteredActivities = useMemo(() => {
    if (!data?.activities) return []

    let filtered = data.activities

    // Filter by difficulty
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter((activity) => activity.difficulty === difficultyFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (activity) =>
          activity.title.toLowerCase().includes(query) ||
          activity.description.toLowerCase().includes(query) ||
          activity.activityType.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [data?.activities, difficultyFilter, searchQuery])

  if (isError) {
    return (
      <PageWrapper>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive">Error al cargar actividades</h2>
            <p className="mt-2 text-muted-foreground">
              {error instanceof Error ? error.message : 'Ocurrió un error desconocido'}
            </p>
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-6 w-3/4" />
          </div>

          {/* Filters Skeleton */}
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-32" />
            ))}
          </div>

          {/* Grid Skeleton */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-4 h-4 w-1/2" />
              </Card>
            ))}
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Actividades disponibles</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Completa actividades y gana $PULPA tokens mientras aprendes Web3
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          {/* Difficulty Filter */}
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">Dificultad</p>
            <div className="flex gap-2">
              <Button
                variant={difficultyFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setDifficultyFilter('all')}
              >
                Todas
              </Button>
              <Button
                variant={difficultyFilter === 'beginner' ? 'default' : 'outline'}
                onClick={() => setDifficultyFilter('beginner')}
              >
                Principiante
              </Button>
              <Button
                variant={difficultyFilter === 'intermediate' ? 'default' : 'outline'}
                onClick={() => setDifficultyFilter('intermediate')}
              >
                Intermedio
              </Button>
              <Button
                variant={difficultyFilter === 'advanced' ? 'default' : 'outline'}
                onClick={() => setDifficultyFilter('advanced')}
              >
                Avanzado
              </Button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar actividades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Results Count */}
        {filteredActivities.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredActivities.length} actividades
          </p>
        )}

        {/* Activities Grid */}
        {filteredActivities.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-semibold">No se encontraron actividades</h3>
              <p className="mt-2 text-muted-foreground">
                Intenta ajustar los filtros o la búsqueda
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setDifficultyFilter('all')
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
