'use client'

/**
 * LeaderboardContent - Client component for leaderboard page
 * Displays rankings of top community members
 */

import { useState } from 'react'
import Link from 'next/link'
import { Trophy, TrendingUp, Briefcase } from 'lucide-react'
import PageWrapper from '@/components/layout/page-wrapper'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useDirectoryProfiles } from '@/hooks/use-directory'

type RankingCategory = 'earnings' | 'projects'

export function LeaderboardContent() {
  const [category, setCategory] = useState<RankingCategory>('earnings')

  const { data, isLoading, isError, error } = useDirectoryProfiles({
    limit: 50,
  })

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

        {/* Leaderboard List */}
        {sortedMembers.length > 0 ? (
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
                    className={`p-6 transition-colors hover:bg-accent ${
                      rank <= 3 ? 'border-2 border-primary/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank Badge */}
                      <div
                        className={`flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-bold ${badge.color}`}
                      >
                        {badge.icon}
                      </div>

                      {/* Avatar */}
                      <Avatar className="size-12">
                        <AvatarImage src={member.avatarUrl || undefined} alt={member.username} />
                        <AvatarFallback>
                          {member.displayName?.[0] || member.username[0]}
                        </AvatarFallback>
                      </Avatar>

                      {/* Member Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {member.displayName || member.username}
                        </h3>
                        <p className="text-sm text-muted-foreground">@{member.username}</p>
                        {member.city && member.country && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {member.city}, {member.country}
                          </p>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <p className="text-2xl font-bold">{value}</p>
                        <div className="mt-2 flex flex-wrap justify-end gap-2">
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
        ) : (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <Trophy className="mx-auto size-16 text-muted-foreground" />
              <h3 className="mt-4 text-xl font-semibold">No hay datos disponibles</h3>
              <p className="mt-2 text-muted-foreground">
                La clasificación se actualizará cuando haya más actividad
              </p>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
