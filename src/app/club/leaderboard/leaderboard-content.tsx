'use client'

/**
 * LeaderboardContent - Client component for leaderboard page
 * Displays rankings of top community members and bootcamp participants
 */

import { useState } from 'react'
import Link from 'next/link'
import { Trophy, TrendingUp, Briefcase, GraduationCap, Award } from 'lucide-react'
import Image from 'next/image'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import PageWrapper from '@/components/layout/page-wrapper'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { useDirectoryProfiles } from '@/hooks/use-directory'

type RankingCategory = 'earnings' | 'projects' | 'bootcamp'

export function LeaderboardContent() {
  const [category, setCategory] = useState<RankingCategory>('bootcamp')

  const { data, isLoading, isError, error } = useDirectoryProfiles({
    limit: 50,
  })

  // Get bootcamp programs and leaderboard
  const programs = useQuery(api.bootcamp.listPrograms)
  const activeProgram = programs?.find(p => p.status === 'active')
  const bootcampLeaderboard = useQuery(
    api.leaderboard.getLeaderboard,
    activeProgram ? { programId: activeProgram._id, limit: 20 } : 'skip'
  )
  const bootcampStats = useQuery(
    api.leaderboard.getProgramStats,
    activeProgram ? { programId: activeProgram._id } : 'skip'
  )

  if (isError) {
    return (
      <PageWrapper>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive">Error al cargar clasificación</h2>
            <p className="mt-2 text-muted-foreground">
              Ocurrió un error desconocido
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
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-6 w-3/4" />
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="size-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="mt-2 h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </PageWrapper>
    )
  }

  const rawProfiles = data?.profiles || []

  // Transform Convex profiles to expected format
  const members = rawProfiles.map((p) => ({
    id: p._id,
    username: p.user?.username || 'unknown',
    displayName: p.user?.displayName,
    avatarUrl: p.user?.avatarUrl,
    bio: p.user?.bio,
    city: p.city,
    country: p.country,
    projectsCount: p.projectsCount || 0,
    completedBounties: p.completedBounties || 0,
    totalEarningsUsd: p.totalEarningsUsd || 0,
    learningTracks: p.learningTracks,
    availabilityStatus: p.availabilityStatus,
  }))

  // Sort members based on category
  const sortedMembers = [...members].sort((a, b) => {
    if (category === 'earnings') {
      return b.totalEarningsUsd - a.totalEarningsUsd
    }
    return b.projectsCount - a.projectsCount
  })

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: '🥇', color: 'bg-yellow-100 text-yellow-800' }
    if (rank === 2) return { icon: '🥈', color: 'bg-gray-100 text-gray-800' }
    if (rank === 3) return { icon: '🥉', color: 'bg-orange-100 text-orange-800' }
    return { icon: `#${rank}`, color: 'bg-muted text-muted-foreground' }
  }

  return (
    <PageWrapper>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Clasificación de la comunidad</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Descubre los mejores miembros de Frutero Club por ganancias y proyectos completados
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={category === 'bootcamp' ? 'default' : 'outline'}
            onClick={() => setCategory('bootcamp')}
          >
            <GraduationCap className="mr-2 size-4" />
            Bootcamp
          </Button>
          <Button
            variant={category === 'earnings' ? 'default' : 'outline'}
            onClick={() => setCategory('earnings')}
          >
            <TrendingUp className="mr-2 size-4" />
            Por ganancias
          </Button>
          <Button
            variant={category === 'projects' ? 'default' : 'outline'}
            onClick={() => setCategory('projects')}
          >
            <Briefcase className="mr-2 size-4" />
            Por proyectos
          </Button>
        </div>

        {/* Bootcamp Leaderboard */}
        {category === 'bootcamp' && (
          <div className="space-y-6">
            {/* Bootcamp Stats */}
            {bootcampStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Participantes</p>
                  <p className="text-3xl font-bold">{bootcampStats.enrollments.total}</p>
                  <p className="text-xs text-muted-foreground">{bootcampStats.enrollments.active} activos</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Progreso Promedio</p>
                  <p className="text-3xl font-bold">{bootcampStats.progress.average}%</p>
                  <p className="text-xs text-muted-foreground">{bootcampStats.progress.distribution.completed} completados</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Entregables</p>
                  <p className="text-3xl font-bold">{bootcampStats.deliverables.total}</p>
                  <p className="text-xs text-muted-foreground">{bootcampStats.deliverables.approved} aprobados</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Dia Mas Activo</p>
                  <p className="text-3xl font-bold">{bootcampStats.activity.mostActiveDay.count || 0}</p>
                  <p className="text-xs text-muted-foreground">{bootcampStats.activity.mostActiveDay.date || 'N/A'}</p>
                </Card>
              </div>
            )}

            {/* Progress by Session */}
            {bootcampStats && (
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Progreso por Sesion</h3>
                <div className="space-y-3">
                  {Object.entries(bootcampStats.deliverables.bySession).map(([session, data]) => (
                    <div key={session} className="flex items-center gap-4">
                      <span className="w-24 text-sm font-medium">Sesion {session}</span>
                      <Progress 
                        value={bootcampStats.enrollments.total > 0 
                          ? (data.approved / bootcampStats.enrollments.total) * 100 
                          : 0} 
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground w-16 text-right">
                        {data.approved}/{bootcampStats.enrollments.total}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Bootcamp Ranking */}
            {bootcampLeaderboard && bootcampLeaderboard.length > 0 ? (
              <div className="space-y-4">
                {bootcampLeaderboard.map((participant) => {
                  const badge = getRankBadge(participant.rank)
                  return (
                    <Card
                      key={participant.enrollmentId}
                      className={`p-4 md:p-6 ${participant.rank <= 3 ? 'border-2 border-primary/20' : ''}`}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                        {/* Top row on mobile: Rank + Avatar + Name */}
                        <div className="flex items-center gap-3">
                          {/* Rank Badge */}
                          <div
                            className={`flex size-10 md:size-12 shrink-0 items-center justify-center rounded-full text-base md:text-lg font-bold ${badge.color}`}
                          >
                            {badge.icon}
                          </div>

                          {/* Avatar */}
                          <Avatar className="size-10 md:size-12 shrink-0">
                            <AvatarImage src={participant.avatarUrl || undefined} alt={participant.displayName} />
                            <AvatarFallback>
                              {participant.displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          {/* Participant Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold truncate">{participant.displayName}</h3>
                              {/* Fruta Certificada badge for 100% completion */}
                              {participant.progress === 100 && (
                                <Image
                                  src="/images/badges/fruta-certificada.jpg"
                                  alt="Fruta Certificada"
                                  width={24}
                                  height={24}
                                  className="rounded-full shrink-0"
                                />
                              )}
                            </div>
                            {participant.username && (
                              <p className="text-sm text-muted-foreground truncate">@{participant.username}</p>
                            )}
                          </div>
                        </div>

                        {/* Bottom row on mobile: Progress + Sessions */}
                        <div className="flex items-center gap-3 md:gap-4 pl-[52px] md:pl-0 md:flex-1 md:justify-end">
                          {/* Progress */}
                          <div className="flex-1 md:w-32 md:flex-none">
                            <div className="flex items-center gap-2">
                              <Progress value={participant.progress} className="flex-1" />
                              <span className="text-sm font-medium w-10 text-right">{participant.progress}%</span>
                            </div>
                          </div>

                          {/* Sessions */}
                          <Badge variant="secondary" className="shrink-0">
                            {participant.sessionsCompleted} sesiones
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="flex min-h-[40vh] items-center justify-center">
                <div className="text-center">
                  <GraduationCap className="mx-auto size-16 text-muted-foreground" />
                  <h3 className="mt-4 text-xl font-semibold">No hay datos del bootcamp</h3>
                  <p className="mt-2 text-muted-foreground">
                    {!activeProgram ? 'No hay bootcamps activos' : 'La clasificacion se actualizara cuando haya mas actividad'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Community Leaderboard List */}
        {category !== 'bootcamp' && sortedMembers.length > 0 ? (
          <div className="space-y-4">
            {sortedMembers.map((member, index) => {
              const rank = index + 1
              const badge = getRankBadge(rank)
              const value =
                category === 'earnings'
                  ? `$${member.totalEarningsUsd}`
                  : `${member.projectsCount} proyectos`

              return (
                <Link key={member.id} href={`/profile/${member.username}`}>
                  <Card
                    className={`p-4 md:p-6 transition-colors hover:bg-accent ${
                      rank <= 3 ? 'border-2 border-primary/20' : ''
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                      {/* Top row: Rank + Avatar + Name */}
                      <div className="flex items-center gap-3">
                        {/* Rank Badge */}
                        <div
                          className={`flex size-10 md:size-12 shrink-0 items-center justify-center rounded-full text-base md:text-lg font-bold ${badge.color}`}
                        >
                          {badge.icon}
                        </div>

                        {/* Avatar */}
                        <Avatar className="size-10 md:size-12 shrink-0">
                          <AvatarImage src={member.avatarUrl || undefined} alt={member.username} />
                          <AvatarFallback>
                            {member.displayName?.[0] || member.username[0]}
                          </AvatarFallback>
                        </Avatar>

                        {/* Member Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">
                            {member.displayName || member.username}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">@{member.username}</p>
                          {member.city && member.country && (
                            <p className="text-xs text-muted-foreground truncate">
                              {member.city}, {member.country}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Stats - right side on desktop, below on mobile */}
                      <div className="flex items-center justify-between pl-[52px] md:pl-0 md:text-right md:flex-col md:items-end">
                        <p className="text-xl md:text-2xl font-bold">{value}</p>
                        <div className="flex flex-wrap gap-2 md:mt-2 md:justify-end">
                          {member.learningTracks &&
                            member.learningTracks.slice(0, 2).map((track) => (
                              <Badge key={track} variant="secondary" className="text-xs">
                                {track.toUpperCase()}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Additional Stats for Top 3 */}
                    {rank <= 3 && (
                      <div className="mt-4 flex flex-wrap gap-6 border-t pt-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Proyectos</p>
                          <p className="text-lg font-semibold">{member.projectsCount}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Ganado</p>
                          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                            ${member.totalEarningsUsd}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Estado</p>
                          <Badge
                            variant={
                              member.availabilityStatus === 'available' ? 'default' : 'secondary'
                            }
                          >
                            {member.availabilityStatus === 'available'
                              ? 'Disponible'
                              : member.availabilityStatus === 'open_to_offers'
                                ? 'Abierto'
                                : 'No disponible'}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : category !== 'bootcamp' ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <Trophy className="mx-auto size-16 text-muted-foreground" />
              <h3 className="mt-4 text-xl font-semibold">No hay datos disponibles</h3>
              <p className="mt-2 text-muted-foreground">
                La clasificación se actualizará cuando haya más actividad
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </PageWrapper>
  )
}
