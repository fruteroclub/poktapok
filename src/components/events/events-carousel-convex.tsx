'use client'

import { useState } from 'react'
import { CalendarDays, ChevronRight, MapPin, Clock } from 'lucide-react'
import { Marquee } from '@/components/ui/marquee'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUpcomingEvents, usePublishedEvents } from '@/hooks/use-events-convex'
import Link from 'next/link'

interface EventsCarouselConvexProps {
  title?: string
  subtitle?: string
  showTabs?: boolean
  defaultTab?: 'upcoming' | 'past'
  limit?: number
  showViewAll?: boolean
  viewAllHref?: string
}

/**
 * Events Carousel using Convex
 *
 * Real-time events display with automatic updates.
 */
export default function EventsCarouselConvex({
  title = 'Eventos de la Comunidad',
  subtitle = 'Únete a nuestros eventos y conecta con otros builders',
  showTabs = true,
  defaultTab = 'upcoming',
  limit = 10,
  showViewAll = true,
  viewAllHref = '/club/eventos',
}: EventsCarouselConvexProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>(defaultTab)

  // Use Convex hooks
  const upcomingEvents = useUpcomingEvents()
  const allEvents = usePublishedEvents()

  const isLoading = upcomingEvents === undefined || allEvents === undefined

  // Filter events based on tab
  const now = Date.now()
  const events = activeTab === 'upcoming'
    ? (upcomingEvents ?? []).slice(0, limit)
    : (allEvents ?? [])
        .filter(e => e.startDate < now)
        .sort((a, b) => b.startDate - a.startDate)
        .slice(0, limit)

  if (isLoading) {
    return (
      <section className="page py-12">
        <div className="page-content gap-y-6">
          <div className="space-y-2 px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              {title}
            </h2>
            <p className="text-xl text-muted">{subtitle}</p>
          </div>
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </div>
      </section>
    )
  }

  if (events.length === 0) {
    return (
      <section className="page py-12">
        <div className="page-content gap-y-6">
          <div className="space-y-2 px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              {title}
            </h2>
            <p className="text-xl text-muted">{subtitle}</p>
          </div>

          {showTabs && (
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as 'upcoming' | 'past')}
              className="flex justify-center"
            >
              <TabsList>
                <TabsTrigger value="upcoming">Próximos</TabsTrigger>
                <TabsTrigger value="past">Pasados</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <CalendarDays className="h-16 w-16 text-muted-foreground/50" />
            <p className="text-lg text-muted-foreground">
              {activeTab === 'upcoming'
                ? 'No hay eventos próximos programados'
                : 'No hay eventos pasados'}
            </p>
            {activeTab === 'past' && (
              <Button variant="outline" onClick={() => setActiveTab('upcoming')}>
                Ver eventos próximos
              </Button>
            )}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page py-12">
      <div className="page-content gap-y-6">
        <div className="space-y-2 px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            {title}
          </h2>
          <p className="text-xl text-muted">{subtitle}</p>
        </div>

        {showTabs && (
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'upcoming' | 'past')}
            className="flex justify-center"
          >
            <TabsList>
              <TabsTrigger value="upcoming">Próximos</TabsTrigger>
              <TabsTrigger value="past">Pasados</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Marquee Carousel */}
        <div className="relative mx-auto w-full">
          {/* Left fade overlay */}
          <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-20 bg-gradient-to-r from-background to-transparent md:w-32" />

          {/* Right fade overlay */}
          <div className="pointer-events-none absolute top-0 right-0 z-10 h-full w-20 bg-gradient-to-l from-background to-transparent md:w-32" />

          <Marquee pauseOnHover className="[--duration:80s] [--gap:1.5rem]">
            {events.map((event) => (
              <ConvexEventCard key={event._id} event={event} />
            ))}
          </Marquee>
        </div>

        {showViewAll && (
          <div className="flex justify-center pt-4">
            <Button variant="outline" size="lg" asChild>
              <Link href={viewAllHref} className="flex items-center gap-2">
                Ver todos los eventos
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

/**
 * Event Card for Convex events
 */
function ConvexEventCard({ event }: { event: NonNullable<ReturnType<typeof usePublishedEvents>>[number] }) {
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

        {/* Hosts */}
        {event.hosts && event.hosts.length > 0 && (
          <div className="mt-auto flex items-center gap-2 pt-2 border-t">
            <div className="flex -space-x-2">
              {event.hosts.slice(0, 3).map((host, i) => (
                <div
                  key={i}
                  className="h-6 w-6 overflow-hidden rounded-full border-2 border-background"
                >
                  {host.avatarUrl ? (
                    <img
                      src={host.avatarUrl}
                      alt={host.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary text-xs text-primary-foreground">
                      {host.name.charAt(0)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {event.hosts.map(h => h.name).join(', ')}
            </span>
          </div>
        )}
      </div>
    </a>
  )
}
