'use client'

/**
 * SessionDetailContent - Client component for session detail page
 * Handles conditional meeting URL access based on authentication
 */

import { ArrowLeft, Calendar, Users, Trophy, ExternalLink, Lock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageWrapper from '@/components/layout/page-wrapper'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useSessionDetail } from '@/hooks/use-sessions'
import { usePrivy } from '@privy-io/react-auth'
import { format, isPast, isFuture, isToday, differenceInHours } from 'date-fns'
import { es } from 'date-fns/locale'

interface SessionDetailContentProps {
  sessionId: string
}

export function SessionDetailContent({ sessionId }: SessionDetailContentProps) {
  const router = useRouter()
  const { authenticated } = usePrivy()
  const { data, isLoading, isError, error } = useSessionDetail(sessionId)

  if (isError) {
    return (
      <PageWrapper>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive">Error al cargar sesión</h2>
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
          </div>

          {/* Info Skeleton */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-6">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </Card>
            <Card className="p-6">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </Card>
          </div>

          {/* Content Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-full" />
                </Card>
              ))}
            </div>
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (!data) {
    return null
  }

  const { session, activities, userCanAccess } = data

  const sessionDate = new Date(session.scheduledAt)
  const formattedDate = format(sessionDate, "d 'de' MMMM, yyyy", { locale: es })
  const formattedTime = format(sessionDate, 'HH:mm', { locale: es })
  const formattedDateTime = format(sessionDate, "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es })

  const isSessionPast = isPast(sessionDate)
  const isSessionToday = isToday(sessionDate)
  const isSessionSoon = isFuture(sessionDate) && differenceInHours(sessionDate, new Date()) <= 24

  // Meeting URL access logic
  const showMeetingUrl = session.meetingUrl && userCanAccess

  return (
    <PageWrapper>
      <div className="space-y-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 size-4" />
          Volver a sesiones
        </Button>

        {/* Session Header */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-bold">{session.title}</h1>
                {isSessionToday && (
                  <Badge variant="default" className="bg-green-600">
                    Hoy
                  </Badge>
                )}
                {isSessionSoon && !isSessionToday && (
                  <Badge variant="default" className="bg-amber-600">
                    Próximamente
                  </Badge>
                )}
                {isSessionPast && (
                  <Badge variant="outline" className="text-muted-foreground">
                    Finalizada
                  </Badge>
                )}
              </div>
              {session.description && (
                <p className="mt-2 text-lg text-muted-foreground">{session.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Session Info Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Date/Time Card */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <Calendar className="size-8 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">Fecha y hora</p>
                <p className="mt-1 text-muted-foreground">{formattedDateTime}</p>
              </div>
            </div>
          </Card>

          {/* Program Card */}
          {session.programName ? (
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <Users className="size-8 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold">Programa</p>
                  <Badge variant="secondary" className="mt-1">
                    {session.programName}
                  </Badge>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <Users className="size-8 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold">Tipo de sesión</p>
                  <Badge variant="secondary" className="mt-1">
                    Sesión independiente
                  </Badge>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Meeting URL Section */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            {showMeetingUrl ? (
              <>
                <ExternalLink className="size-6 shrink-0 text-primary" />
                <div className="flex-1">
                  <h3 className="font-semibold">Enlace de reunión</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Únete a la sesión usando el siguiente enlace
                  </p>
                  <Button asChild className="mt-4">
                    <a
                      href={session.meetingUrl || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Unirse a la reunión
                      <ExternalLink className="ml-2 size-4" />
                    </a>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Lock className="size-6 shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <h3 className="font-semibold text-muted-foreground">Enlace de reunión</h3>
                  {!authenticated ? (
                    <>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Debes iniciar sesión para acceder al enlace de reunión
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => router.push('/onboarding')}
                        className="mt-4"
                      >
                        Iniciar aplicación
                      </Button>
                    </>
                  ) : !userCanAccess ? (
                    <>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Solo los miembros activos pueden acceder al enlace de reunión
                      </p>
                      <Alert className="mt-4">
                        <AlertCircle className="size-4" />
                        <AlertTitle>Acceso restringido</AlertTitle>
                        <AlertDescription>
                          Necesitas ser aprobado como miembro para unirte a las sesiones. Revisa tu
                          estado de aplicación en tu perfil.
                        </AlertDescription>
                      </Alert>
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">
                      El enlace de reunión no está disponible para esta sesión
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Activities Section */}
        <div>
          <h2 className="text-2xl font-bold">
            Actividades de la sesión
            {activities.length > 0 && (
              <span className="ml-2 text-base font-normal text-muted-foreground">
                ({activities.length})
              </span>
            )}
          </h2>

          {activities.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activities.map((activity) => {
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
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <h3 className="flex-1 font-semibold line-clamp-2">{activity.title}</h3>
                        <Badge className={difficultyColors[activity.difficulty]}>
                          {difficultyLabels[activity.difficulty]}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {activity.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="size-4 text-amber-500" />
                          <span className="text-sm font-medium">
                            {activity.rewardPulpaAmount} $PULPA
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {activity.activityType}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <p className="mt-4 text-muted-foreground">No hay actividades asignadas a esta sesión</p>
          )}
        </div>

        {/* Join/Apply CTA */}
        {!authenticated && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 p-8">
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
              <div className="flex-1">
                <h3 className="text-2xl font-bold">¿Listo para participar?</h3>
                <p className="mt-2 text-muted-foreground">
                  Únete a la comunidad para acceder a sesiones en vivo y actividades de aprendizaje
                </p>
              </div>
              <Button size="lg" onClick={() => router.push('/onboarding')}>
                Comenzar aplicación
              </Button>
            </div>
          </Card>
        )}
      </div>
    </PageWrapper>
  )
}
