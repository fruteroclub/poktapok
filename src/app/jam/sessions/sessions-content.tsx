'use client'

/**
 * SessionsContent - Client component for sessions directory
 * Handles data fetching, filtering, and pagination
 */

import { useState, useMemo } from 'react'
import { Calendar, Users, Trophy, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import PageWrapper from '@/components/layout/page-wrapper'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { usePublicSessions } from '@/hooks/use-sessions'
import { useActivePrograms } from '@/hooks/use-onboarding'
import { format, isPast, isFuture } from 'date-fns'
import { es } from 'date-fns/locale'
import type { PublicSession } from '@/types/api-v1'

type TimeFilter = 'all' | 'upcoming' | 'past'
type TypeFilter = 'all' | 'standalone'

export function SessionsContent() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('upcoming')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [programFilter, setProgramFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

  // Fetch data
  const { data: sessionsData, isLoading: sessionsLoading } = usePublicSessions({
    upcoming: timeFilter === 'upcoming' ? true : undefined,
    standalone: typeFilter === 'standalone' ? true : undefined,
    programId: programFilter !== 'all' ? programFilter : undefined,
  })

  const { data: programsData, isLoading: programsLoading } = useActivePrograms()

  // Filter and paginate sessions
  const { paginatedSessions, totalPages, totalCount } = useMemo(() => {
    if (!sessionsData?.sessions) {
      return { paginatedSessions: [], totalPages: 0, totalCount: 0 }
    }

    let filtered = sessionsData.sessions

    // Client-side time filtering (if not using API filter)
    if (timeFilter === 'past') {
      filtered = filtered.filter((s) => isPast(new Date(s.scheduledAt)))
    }

    // Sort by date
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.scheduledAt).getTime()
      const dateB = new Date(b.scheduledAt).getTime()
      return timeFilter === 'past' ? dateB - dateA : dateA - dateB
    })

    const total = filtered.length
    const pages = Math.ceil(total / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const paginated = filtered.slice(startIndex, startIndex + pageSize)

    return { paginatedSessions: paginated, totalPages: pages, totalCount: total }
  }, [sessionsData, timeFilter, currentPage])

  const isLoading = sessionsLoading || programsLoading

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
              <Skeleton key={i} className="h-10 w-24" />
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

  const programs = programsData?.programs || []

  return (
    <PageWrapper>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Sesiones de aprendizaje</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Explora todas las sesiones disponibles y únete a las próximas
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          {/* Time Filter */}
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">Filtrar por tiempo</p>
            <div className="flex gap-2">
              <Button
                variant={timeFilter === 'all' ? 'default' : 'outline'}
                onClick={() => {
                  setTimeFilter('all')
                  setCurrentPage(1)
                }}
              >
                Todas
              </Button>
              <Button
                variant={timeFilter === 'upcoming' ? 'default' : 'outline'}
                onClick={() => {
                  setTimeFilter('upcoming')
                  setCurrentPage(1)
                }}
              >
                Próximas
              </Button>
              <Button
                variant={timeFilter === 'past' ? 'default' : 'outline'}
                onClick={() => {
                  setTimeFilter('past')
                  setCurrentPage(1)
                }}
              >
                Pasadas
              </Button>
            </div>
          </div>

          {/* Type and Program Filters */}
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Type Filter */}
            <div className="flex-1">
              <p className="mb-2 text-sm font-medium text-muted-foreground">Tipo de sesión</p>
              <div className="flex gap-2">
                <Button
                  variant={typeFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => {
                    setTypeFilter('all')
                    setCurrentPage(1)
                  }}
                >
                  Todas
                </Button>
                <Button
                  variant={typeFilter === 'standalone' ? 'default' : 'outline'}
                  onClick={() => {
                    setTypeFilter('standalone')
                    setCurrentPage(1)
                  }}
                >
                  Independientes
                </Button>
              </div>
            </div>

            {/* Program Filter */}
            <div className="flex-1">
              <p className="mb-2 text-sm font-medium text-muted-foreground">Programa</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={programFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => {
                    setProgramFilter('all')
                    setCurrentPage(1)
                  }}
                >
                  Todos
                </Button>
                {programs.map((program) => (
                  <Button
                    key={program.id}
                    size="sm"
                    variant={programFilter === program.id ? 'default' : 'outline'}
                    onClick={() => {
                      setProgramFilter(program.id)
                      setCurrentPage(1)
                    }}
                  >
                    {program.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {totalCount > 0 && (
          <p className="text-sm text-muted-foreground">
            Mostrando {paginatedSessions.length} de {totalCount} sesiones
          </p>
        )}

        {/* Sessions Grid */}
        {paginatedSessions.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="size-4" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-semibold">No se encontraron sesiones</h3>
              <p className="mt-2 text-muted-foreground">
                Intenta ajustar los filtros para ver más resultados
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setTimeFilter('all')
                  setTypeFilter('all')
                  setProgramFilter('all')
                  setCurrentPage(1)
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

interface SessionCardProps {
  session: PublicSession
}

function SessionCard({ session }: SessionCardProps) {
  const sessionDate = new Date(session.scheduledAt)
  const formattedDate = format(sessionDate, "d 'de' MMMM, yyyy", { locale: es })
  const formattedTime = format(sessionDate, 'HH:mm', { locale: es })
  const isUpcoming = isFuture(sessionDate)

  return (
    <Link href={`/jam/sessions/${session.id}`}>
      <Card className="h-full p-6 transition-colors hover:bg-accent">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold line-clamp-2">{session.title}</h3>
              {isUpcoming && (
                <Badge variant="outline" className="shrink-0 border-green-500 text-green-700">
                  Próxima
                </Badge>
              )}
            </div>
            {session.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {session.description}
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4" />
              <span>
                {formattedDate} • {formattedTime}
              </span>
            </div>

            {session.programName && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="size-4 text-muted-foreground" />
                <Badge variant="secondary">{session.programName}</Badge>
              </div>
            )}

            {session.activityCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="size-4" />
                <span>{session.activityCount} actividades</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
