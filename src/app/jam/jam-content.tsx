/**
 * JamContent - Client component for Jam landing page
 * Handles data fetching and rendering
 */

'use client'

import PageWrapper from '@/components/layout/page-wrapper'
import { JamHero } from '@/components/jam/jam-hero'
import { ProgramsGrid } from '@/components/jam/programs-grid'
import { SessionsPreview } from '@/components/jam/sessions-preview'
import { ActivitiesPreview } from '@/components/jam/activities-preview'
import { MentorshipCTA } from '@/components/jam/mentorship-cta'
import { useActivePrograms } from '@/hooks/use-onboarding'
import { usePublicSessions } from '@/hooks/use-sessions'
import { usePublicActivities } from '@/hooks/use-activities'
import { Skeleton } from '@/components/ui/skeleton'
import type { Program } from '@/types/api-v1'
import type { Activity } from '@/services/activities'
import { Section } from '@/components/layout/section'

export function JamContent() {
  const { data: programsData, isLoading: programsLoading } = useActivePrograms()
  const { data: sessionsData, isLoading: sessionsLoading } = usePublicSessions({
    upcoming: true,
    limit: 6,
  })
  const { data: activitiesData, isLoading: activitiesLoading } =
    usePublicActivities({
      status: 'active',
    })

  // Calculate stats
  const stats = {
    activePrograms: programsData?.programs?.length || 0,
    upcomingSessions: sessionsData?.sessions?.length || 0,
    totalRewardsDistributed: 0, // TODO: Add stats API
  }

  return (
    <PageWrapper>
      <div className="page">
        <div className="page-content space-y-6">
          <Section>
            <JamHero stats={stats} />
          </Section>

          {programsLoading ? (
            <Section>
              <h2 className="text-3xl font-bold">Programas activos</h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            </Section>
          ) : (
            <ProgramsGrid
              programs={(programsData?.programs || []) as Program[]}
            />
          )}

          {sessionsLoading ? (
            <Section>
              <h2 className="text-3xl font-bold">Próximas sesiones</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            </Section>
          ) : (
            <SessionsPreview
              sessions={sessionsData?.sessions || []}
              limit={6}
            />
          )}

          {activitiesLoading ? (
            <Section>
              <h2 className="text-3xl font-bold">Actividades destacadas</h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            </Section>
          ) : (
            <ActivitiesPreview
              activities={(activitiesData?.activities || []) as Activity[]}
              limit={6}
            />
          )}

          <MentorshipCTA />
        </div>
      </div>
    </PageWrapper>
  )
}
