'use client'

import { useState } from 'react'
import { CalendarDays, ChevronRight } from 'lucide-react'
import { Marquee } from '@/components/ui/marquee'
import { EventCard } from '@/components/events/event-card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEvents } from '@/hooks/use-events'
import type { EventStatus } from '@/services/events'
import Link from 'next/link'

interface EventsCarouselProps {
  title?: string
  subtitle?: string
  showTabs?: boolean
  defaultTab?: 'upcoming' | 'past'
  limit?: number
  showViewAll?: boolean
  viewAllHref?: string
}

export default function EventsCarousel({
  title = 'Eventos de la Comunidad',
  subtitle = 'Únete a nuestros eventos y conecta con otros builders',
  showTabs = true,
  defaultTab = 'upcoming',
  limit = 10,
  showViewAll = true,
  viewAllHref = '/club/eventos',
}: EventsCarouselProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>(defaultTab)

  const { data, isLoading } = useEvents({
    status: activeTab as EventStatus,
    limit,
  })

  const events = data?.events || []

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
              <EventCard key={event.id} event={event} />
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
