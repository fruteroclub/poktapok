'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Search, Filter } from 'lucide-react'
import PageWrapper from '@/components/layout/page-wrapper'
import { Section } from '@/components/layout/section'
import { Card, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useDirectoryProfiles } from '@/hooks/use-directory'
import { useState, useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Progress } from '@/components/ui/progress'

export default function DirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data, isLoading } = useDirectoryProfiles({ limit: 50 })
  const participants = useQuery(api.bootcamp.listActiveParticipants)

  // Build a lookup map: userId → participant data
  // Prioritize showing active bootcamp over completed ones for the directory card
  const participantMap = useMemo(() => {
    const map = new Map<string, { programName: string; programSlug: string; progress: number; status: string; sessionsCompleted: number; sessionsCount: number }>()
    if (participants) {
      for (const p of participants) {
        const existing = map.get(p.userId)
        // If no existing entry, or if current is active and existing is completed, use current
        if (!existing || (p.status === 'active' && existing.status === 'completed')) {
          map.set(p.userId, { 
            programName: p.programName, 
            programSlug: p.programSlug,
            progress: p.progress, 
            status: p.status,
            sessionsCompleted: p.sessionsCompleted,
            sessionsCount: p.sessionsCount
          })
        }
      }
    }
    return map
  }, [participants])

  const profiles = data?.profiles || []

  // Filter by search query
  const filteredProfiles = profiles.filter((p) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      p.user?.username?.toLowerCase().includes(query) ||
      p.user?.displayName?.toLowerCase().includes(query) ||
      p.user?.bio?.toLowerCase().includes(query)
    )
  })

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="page">
          <div className="page-content space-y-6">
            <Section>
              <div className="header-section">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-6 w-72" />
              </div>
            </Section>
            <Section>
              <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="p-6">
                    <Skeleton className="mx-auto h-20 w-20 rounded-full" />
                    <Skeleton className="mx-auto mt-4 h-6 w-32" />
                    <Skeleton className="mx-auto mt-2 h-4 w-24" />
                  </Card>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="page">
        <div className="page-content space-y-6">
          {/* Header */}
          <Section>
            <div className="header-section">
              <h1 className="text-3xl font-bold tracking-tight">Directorio</h1>
              <p className="text-muted-foreground">
                Conoce a los miembros de la comunidad
              </p>
            </div>
          </Section>

          {/* Search */}
          <Section>
            <div className="flex w-full gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, username o bio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </Section>

          {/* Results count */}
          <Section>
            <p className="text-sm text-muted-foreground">
              {filteredProfiles.length} miembro{filteredProfiles.length !== 1 ? 's' : ''}
            </p>
          </Section>

          {/* Grid */}
          <Section>
            {filteredProfiles.length > 0 ? (
              <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProfiles.map((profile) => (
                  <Link
                    key={profile._id}
                    href={`/profile/${profile.user?.username}`}
                  >
                    <Card className="flex h-full flex-col gap-y-4 px-4 py-6 transition-colors hover:bg-accent">
                      <div className="flex flex-1 flex-col items-center gap-2 text-center">
                        <Avatar className="size-20">
                          <AvatarImage
                            src={profile.user?.avatarUrl || undefined}
                            alt={profile.user?.username}
                          />
                          <AvatarFallback>
                            {profile.user?.displayName?.[0] ||
                              profile.user?.username?.[0] ||
                              '?'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="w-full">
                          <h4 className="line-clamp-1 font-semibold">
                            {profile.user?.displayName || profile.user?.username}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            @{profile.user?.username}
                          </p>
                        </div>

                        {profile.user?.bio && (
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {profile.user.bio}
                          </p>
                        )}

                        {profile.learningTracks && profile.learningTracks.length > 0 && (
                          <div className="flex flex-wrap justify-center gap-1">
                            {profile.learningTracks.map((track) => (
                              <Badge key={track} variant="secondary" className="text-xs">
                                {track.toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Bootcamp progress badge */}
                        {profile.user?._id && participantMap.has(profile.user._id) && (() => {
                          const bp = participantMap.get(profile.user!._id)!
                          const displayName = bp.programName.replace('Bootcamp', '').trim() || bp.programName
                          return (
                            <div className="flex w-full items-center justify-center gap-2">
                              {bp.status === 'completed' ? (
                                <div className="flex items-center gap-2">
                                  <Image
                                    src="/images/badges/fruta-certificada.jpg"
                                    alt="Fruta Certificada"
                                    width={28}
                                    height={28}
                                    className="rounded-full"
                                  />
                                  <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
                                    100%
                                  </Badge>
                                </div>
                              ) : (
                                <>
                                  <Badge variant="outline" className="text-xs gap-1">
                                    {displayName} {bp.progress}%
                                  </Badge>
                                  <Progress value={bp.progress} className="h-1.5 w-16" />
                                </>
                              )}
                            </div>
                          )
                        })()}
                      </div>

                      <CardFooter className="mt-auto flex w-full justify-center gap-4 text-center text-sm">
                        <div>
                          <p className="font-semibold">
                            {profile.projectsCount || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Proyectos
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            ${profile.totalEarningsUsd || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Ganado
                          </p>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery
                    ? 'No se encontraron miembros con esa búsqueda'
                    : 'No hay miembros en el directorio aún'}
                </p>
              </div>
            )}
          </Section>
        </div>
      </div>
    </PageWrapper>
  )
}
