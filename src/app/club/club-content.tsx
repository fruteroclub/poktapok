'use client'

/**
 * ClubContent - Client component for Club landing page
 * Fetches and displays community showcase data
 */

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import PageWrapper from '@/components/layout/page-wrapper'
import { ClubHero } from '@/components/club/club-hero'
import { ActivityCard } from '@/components/club/activity-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardFooter } from '@/components/ui/card'
import { useDirectoryProfiles } from '@/hooks/use-directory'
import { usePublicActivities } from '@/hooks/use-activities'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Section } from '@/components/layout/section'
import EventsCarousel from '@/components/events/events-carousel-convex'

export function ClubContent() {
  const { data: directoryData, isLoading: directoryLoading } =
    useDirectoryProfiles({
      limit: 12,
    })

  const { data: activitiesData, isLoading: activitiesLoading } =
    usePublicActivities({
      status: 'active',
    })

  const isLoading = directoryLoading || activitiesLoading

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="page space-y-6">
          {/* Hero Skeleton */}
          <Section>
            <div className="header-section space-y-4">
              <div className="text-center">
                <Skeleton className="mx-auto h-12 w-3/4" />
                <Skeleton className="mx-auto mt-4 h-6 w-1/2" />
              </div>
              <div className="grid gap-6 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-6">
                    <Skeleton className="mx-auto size-12" />
                    <Skeleton className="mx-auto mt-4 h-10 w-20" />
                    <Skeleton className="mx-auto mt-2 h-4 w-32" />
                  </Card>
                ))}
              </div>
            </div>
          </Section>
          {/* Content Skeleton */}
          <Section>
            <div className="w-full space-y-4">
              <Skeleton className="h-8 w-1/4" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="p-6">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="mt-2 h-4 w-full" />
                  </Card>
                ))}
              </div>
            </div>
          </Section>
        </div>
      </PageWrapper>
    )
  }

  const rawProfiles = directoryData?.profiles || []
  const activities = activitiesData?.activities || []

  // Transform Convex profiles to expected format
  const members = rawProfiles.map((p) => ({
    id: p._id,
    username: p.user?.username || 'unknown',
    displayName: p.user?.displayName,
    avatarUrl: p.user?.avatarUrl,
    bio: p.user?.bio,
    projectsCount: p.projectsCount || 0,
    completedBounties: p.completedBounties || 0,
    totalEarningsUsd: p.totalEarningsUsd || 0,
  }))

  const stats = {
    totalMembers: members.length,
    totalProjects: members.reduce((sum, m) => sum + (m.projectsCount || 0), 0),
    totalActivities: activities.length,
  }

  return (
    <PageWrapper>
      <div className="page">
        <div className="page-content space-y-6">
          {/* Hero */}
          <Section>
            <ClubHero stats={stats} />
          </Section>

          {/* Member Directory Preview */}
          <Section className="gap-y-4">
            <div className="flex w-full items-center justify-between">
              <h2 className="text-3xl font-bold">Miembros destacados</h2>
              <Button asChild variant="outline">
                <Link href="/directory">
                  Ver todos
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>

            {members.length > 0 ? (
              <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {members.slice(0, 12).map((member) => (
                  <Link key={member.id} href={`/profile/${member.username}`}>
                    <Card className="flex h-full flex-col gap-y-4 px-4 py-6 transition-colors hover:bg-accent">
                      <div className="flex flex-1 flex-col items-center gap-2 text-center">
                        <Avatar className="size-20">
                          <AvatarImage
                            src={member.avatarUrl || undefined}
                            alt={member.username}
                          />
                          <AvatarFallback>
                            {member.displayName?.[0] || member.username[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="w-full">
                          <h4 className="line-clamp-1 font-semibold">
                            {member.displayName || member.username}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            @{member.username}
                          </p>
                        </div>

                        {member.bio && (
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {member.bio}
                          </p>
                        )}
                      </div>

                      <CardFooter className="mt-auto flex w-full justify-center gap-4 text-center text-sm">
                        <div>
                          <p className="font-semibold">
                            {member.projectsCount}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Proyectos
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold">
                            {member.completedBounties}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Bounties
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            ${member.totalEarningsUsd}
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
              <p className="text-center text-muted-foreground">
                No hay miembros para mostrar
              </p>
            )}
          </Section>

          {/* Activities Preview */}
          <Section className="gap-y-4">
            <div className="flex w-full items-center justify-between">
              <h2 className="text-3xl font-bold">Actividades disponibles</h2>
              <Button asChild variant="outline">
                <Link href="/club/activities">
                  Ver todas
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>

            {activities.length > 0 ? (
              <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activities.slice(0, 6).map((activity) => (
                  <ActivityCard
                    key={activity._id}
                    activity={{
                      id: activity._id,
                      title: activity.title,
                      description: activity.description || null,
                      activityType: activity.activityType,
                      difficulty: activity.difficulty,
                      rewardPulpaAmount: String(activity.rewardPulpaAmount),
                      status: activity.status,
                      createdAt: new Date(activity._creationTime).toISOString(),
                      totalAvailableSlots: activity.totalAvailableSlots,
                      currentSubmissionsCount: activity.currentSubmissionsCount,
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                No hay actividades disponibles en este momento
              </p>
            )}
          </Section>

          {/* Events Carousel */}
          <EventsCarousel
            title="Eventos de la Comunidad"
            subtitle="Únete a nuestros eventos y conecta con otros builders"
            showTabs={true}
            defaultTab="upcoming"
            limit={10}
            showViewAll={true}
            viewAllHref="/club/eventos"
          />

          {/* CTA Section */}
          <Section>
            <Card className="w-full bg-linear-to-r from-primary/10 to-primary/5 p-12">
              <div className="flex flex-col items-center gap-6 text-center">
                <h3 className="text-3xl font-bold">¿Listo para comenzar?</h3>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  Únete a nuestra comunidad de desarrolladores Web3 y comienza a
                  construir tu carrera mientras ganas recompensas
                </p>
                <Button asChild size="lg">
                  <Link href="/onboarding">Comenzar ahora</Link>
                </Button>
              </div>
            </Card>
          </Section>
        </div>
      </div>
    </PageWrapper>
  )
}
