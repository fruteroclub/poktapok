'use client'

import { useState } from 'react'
import { CalendarDays, Filter, MapPin, Clock } from 'lucide-react'
import PageWrapper from '@/components/layout/page-wrapper'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Section } from '@/components/layout/section'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Marquee } from '@/components/ui/marquee'
import { useUpcomingEvents, usePublishedEvents } from '@/hooks/use-events-convex'

export function EventosContent() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  const upcomingEvents = useUpcomingEvents()
  const allEvents = usePublishedEvents()

  const isLoading = upcomingEvents === undefined || allEvents === undefined

  // Filter events based on tab
  const now = Date.now()
  const events =
    activeTab === 'upcoming'
      ? upcomingEvents ?? []
      : (allEvents ?? [])
          .filter((e) => e.startDate < now)
          .sort((a, b) => b.startDate - a.startDate)

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
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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

          {/* Events Carousel */}
          <Section>
            {events.length > 0 ? (
              <div className="relative mx-auto w-full">
                {/* Left fade overlay */}
                <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-20 bg-gradient-to-r from-background to-transparent md:w-32" />

                {/* Right fade overlay */}
                <div className="pointer-events-none absolute top-0 right-0 z-10 h-full w-20 bg-gradient-to-l from-background to-transparent md:w-32" />

                <Marquee pauseOnHover className="[--duration:80s] [--gap:1.5rem]">
                  {events.map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </Marquee>
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

          {/* Footer */}
          <Section>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                📅 Eventos sincronizados automáticamente desde{' '}
                <a
                  href="https://lu.ma/fruteroclub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  lu.ma/fruteroclub
                </a>
              </p>
            </div>
          </Section>
        </div>
      </div>
    </PageWrapper>
  )
}

/**
 * Event Card for carousel
 */
function EventCard({
  event,
}: {
  event: NonNullable<ReturnType<typeof usePublishedEvents>>[number]
}) {
  const startDate = new Date(event.startDate)
  const formattedDate = startDate.toLocaleDateString('es-MX', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  const formattedTime = startDate.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <a
      href={event.lumaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex w-[320px] flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md"
    >
      {/* Cover Image */}
      {event.coverImage && (
        <div className="relative h-40 w-full overflow-hidden">
          <img
            src={event.coverImage}
            alt={event.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {event.isFeatured && (
            <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
              Destacado ⭐
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-lg font-semibold text-foreground">
          {event.title}
        </h3>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{formattedTime}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
        </div>

        {/* Event Type Badge */}
        <div className="mt-auto pt-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              event.eventType === 'in-person'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : event.eventType === 'virtual'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
            }`}
          >
            {event.eventType === 'in-person'
              ? '🏢 Presencial'
              : event.eventType === 'virtual'
                ? '💻 Virtual'
                : '🌐 Híbrido'}
          </span>
        </div>
      </div>
    </a>
  )
}
