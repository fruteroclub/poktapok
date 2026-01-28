'use client'

/**
 * ProgramDetailContent - Client component for program detail page
 * Fetches and displays comprehensive program information
 */

import { ArrowLeft, Calendar, Users, Trophy } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageWrapper from '@/components/layout/page-wrapper'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { usePublicProgram } from '@/hooks/use-programs'
import { usePrivy } from '@privy-io/react-auth'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ProgramDetailContentProps {
  programId: string
}

export function ProgramDetailContent({ programId }: ProgramDetailContentProps) {
  const router = useRouter()
  const { authenticated } = usePrivy()
  const { data, isLoading, isError, error } = usePublicProgram(programId)

  if (isError) {
    return (
      <PageWrapper>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive">Error al cargar programa</h2>
            <p className="mt-2 text-muted-foreground">
              {error instanceof Error ? error.message : 'Ocurrió un error desconocido'}
            </p>
            <Button variant="outline" onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="mr-2 size-4" />
              Volver
            </Button>
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
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </Card>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <Skeleton className="h-8 w-1/2" />
              <div className="mt-4 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="mt-2 h-4 w-full" />
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <Skeleton className="h-8 w-1/2" />
              <div className="mt-4 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="mt-2 h-4 w-full" />
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (!data) {
    return null
  }

  const { program, stats, sessions, activities } = data

  return (
    <PageWrapper>
      <div className="space-y-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 size-4" />
          Volver a programas
        </Button>

        {/* Program Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold">{program.name}</h1>
                <Badge variant={program.type === 'cohort' ? 'default' : 'secondary'}>
                  {program.type === 'cohort' ? 'Cohort' : 'Abierto'}
                </Badge>
                {program.isActive && (
                  <Badge variant="outline" className="border-green-500 text-green-700">
                    Activo
                  </Badge>
                )}
              </div>
              <p className="mt-2 text-lg text-muted-foreground">{program.description}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Users className="size-8 text-primary" />
              <div>
                <p className="text-3xl font-bold">{stats.totalEnrollments}</p>
                <p className="text-sm text-muted-foreground">Participantes</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="size-8 text-primary" />
              <div>
                <p className="text-3xl font-bold">{stats.totalSessions}</p>
                <p className="text-sm text-muted-foreground">Sesiones</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Trophy className="size-8 text-primary" />
              <div>
                <p className="text-3xl font-bold">{stats.totalActivities}</p>
                <p className="text-sm text-muted-foreground">Actividades</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upcoming Sessions */}
          <div>
            <h2 className="text-2xl font-bold">Próximas sesiones</h2>
            {sessions.length > 0 ? (
              <div className="mt-4 space-y-4">
                {sessions.slice(0, 5).map((session) => {
                  const sessionDate = new Date(session.scheduledAt)
                  const formattedDate = format(sessionDate, "d 'de' MMMM, yyyy", { locale: es })
                  const formattedTime = format(sessionDate, 'HH:mm', { locale: es })

                  return (
                    <Link key={session.id} href={`/jam/sessions/${session.id}`}>
                      <Card className="p-4 transition-colors hover:bg-accent">
                        <h3 className="font-semibold">{session.title}</h3>
                        {session.description && (
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {session.description}
                          </p>
                        )}
                        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="size-4" />
                            <span>
                              {formattedDate} • {formattedTime}
                            </span>
                          </div>
                          {session.activityCount > 0 && (
                            <div className="flex items-center gap-1">
                              <Trophy className="size-4" />
                              <span>{session.activityCount} actividades</span>
                            </div>
                          )}
                        </div>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="mt-4 text-muted-foreground">No hay sesiones programadas</p>
            )}
          </div>

          {/* Activities */}
          <div>
            <h2 className="text-2xl font-bold">Actividades disponibles</h2>
            {activities.length > 0 ? (
              <div className="mt-4 space-y-4">
                {activities.slice(0, 5).map((activity) => {
                  const difficultyColors = {
                    beginner: 'bg-green-100 text-green-800',
                    intermediate: 'bg-yellow-100 text-yellow-800',
                    advanced: 'bg-red-100 text-red-800',
                  }

                  const difficultyLabels = {
                    beginner: 'Principiante',
                    intermediate: 'Intermedio',
                    advanced: 'Avanzado',
                  }

                  return (
                    <Card key={activity.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{activity.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {activity.description}
                          </p>
                        </div>
                        <Badge className={difficultyColors[activity.difficulty]}>
                          {difficultyLabels[activity.difficulty]}
                        </Badge>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Trophy className="size-4 text-amber-500" />
                        <span className="text-sm font-medium">{activity.rewardPulpaAmount} $PULPA</span>
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <p className="mt-4 text-muted-foreground">No hay actividades disponibles</p>
            )}
          </div>
        </div>

        {/* Enrollment CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 p-8">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <div className="flex-1">
              <h3 className="text-2xl font-bold">¿Listo para unirte?</h3>
              <p className="mt-2 text-muted-foreground">
                Inscríbete en este programa y comienza tu camino de aprendizaje en Web3
              </p>
            </div>
            {authenticated ? (
              <Button size="lg" onClick={() => router.push(`/programs/${programId}`)}>
                Ver dashboard del programa
              </Button>
            ) : (
              <Button size="lg" onClick={() => router.push('/onboarding')}>
                Comenzar aplicación
              </Button>
            )}
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
