'use client'

import { useState } from 'react'
import { CalendarDays, Filter } from 'lucide-react'
import PageWrapper from '@/components/layout/page-wrapper'
import { EventCard } from '@/components/events/event-card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Section } from '@/components/layout/section'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { useEvents } from '@/hooks/use-events'
import type { EventStatus } from '@/services/events'

export function EventosContent() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  const { data, isLoading } = useEvents({
    status: activeTab as EventStatus,
    limit: 50,
  })

  const events = data?.events || []

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="page">
          <div className="page-content space-y-6">
            <Section>
              <div className="header-section space-y-4">
                <div className="text-center">
                  <Skeleton className="mx-auto h-12 w-3/4" />
                  <Skeleton className="mx-auto mt-4 h-6 w-1/2" />
                </div>
              </div>
            </Section>

            <Section>
              <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="h-80 p-0">
                    <Skeleton className="h-40 w-full rounded-t-lg" />
                    <div className="space-y-2 p-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
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
            <div className="header-section space-y-4 text-center">
              <h1 className="text-4xl font-bold text-foreground md:text-5xl">
                Eventos de la Comunidad
              </h1>
              <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                Únete a nuestros eventos y conecta con otros builders. Hackathons,
                workshops, meetups y más.
              </p>
            </div>
          </Section>

          {/* Filters */}
          <Section>
            <div className="flex w-full items-center justify-between">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as 'upcoming' | 'past')}
              >
                <TabsList>
                  <TabsTrigger value="upcoming">Próximos</TabsTrigger>
                  <TabsTrigger value="past">Pasados</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar
                </Button>
              </div>
            </div>
          </Section>

          {/* Events Grid */}
          <Section>
            {events.length > 0 ? (
              <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <CalendarDays className="h-20 w-20 text-muted-foreground/50" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    {activeTab === 'upcoming'
                      ? 'No hay eventos próximos'
                      : 'No hay eventos pasados'}
                  </h3>
                  <p className="max-w-md text-muted-foreground">
                    {activeTab === 'upcoming'
                      ? 'Estamos preparando nuevos eventos para la comunidad. ¡Vuelve pronto!'
                      : 'Aún no tenemos eventos pasados registrados.'}
                  </p>
                </div>
                {activeTab === 'past' && (
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('upcoming')}
                  >
                    Ver eventos próximos
                  </Button>
                )}
              </div>
            )}
          </Section>
        </div>
      </div>
    </PageWrapper>
  )
}
