'use client'

import { useUpcomingEvents } from '@/hooks/use-events-convex'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ExternalLink, MapPin, Calendar, Users } from 'lucide-react'
import Link from 'next/link'

/**
 * Events from Convex
 *
 * Real-time event display using Convex queries.
 * Updates automatically when events are added/modified.
 */
export default function EventsFromConvex() {
  const events = useUpcomingEvents()

  // Loading state
  if (events === undefined) {
    return (
      <section className="bg-card/50 py-20">
        <div className="page-content mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
              Próximos <span className="text-primary">Eventos</span>
            </h2>
          </div>
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <span className="ml-2 text-muted">Cargando eventos...</span>
          </div>
        </div>
      </section>
    )
  }

  // No events state
  if (events.length === 0) {
    return (
      <section className="bg-card/50 py-20">
        <div className="page-content mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
              Próximos <span className="text-primary">Eventos</span>
            </h2>
            <p className="text-muted">No hay eventos programados por el momento.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-card/50 py-20">
      <div className="page-content mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Próximos <span className="text-primary">Eventos</span>
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-muted">
            Eventos sincronizados desde Luma · Actualizados en tiempo real
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div
              key={event._id}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              {/* Cover Image */}
              {event.coverImage && (
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={event.coverImage}
                    alt={event.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {event.isFeatured && (
                    <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                      Destacado ⭐
                    </span>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {/* Date Badge */}
                <div className="mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    {format(new Date(event.startDate), "d 'de' MMMM, yyyy", {
                      locale: es,
                    })}
                  </span>
                  <span className="text-xs text-muted">
                    {format(new Date(event.startDate), 'HH:mm')} hrs
                  </span>
                </div>

                {/* Title */}
                <h3 className="mb-2 text-xl font-bold text-foreground line-clamp-2">
                  {event.title}
                </h3>

                {/* Description */}
                {event.description && (
                  <p className="mb-4 text-sm text-muted line-clamp-2">
                    {event.description}
                  </p>
                )}

                {/* Location */}
                {event.location && (
                  <div className="mb-4 flex items-start gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-muted" />
                    <span className="text-sm text-muted line-clamp-1">
                      {event.location}
                    </span>
                  </div>
                )}

                {/* Event Type Badge */}
                <div className="mb-4 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      event.eventType === 'in-person'
                        ? 'bg-green-100 text-green-800'
                        : event.eventType === 'virtual'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {event.eventType === 'in-person'
                      ? '🏢 Presencial'
                      : event.eventType === 'virtual'
                        ? '💻 Virtual'
                        : '🌐 Híbrido'}
                  </span>
                  {event.registrationType === 'free' && (
                    <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">
                      Gratis ✨
                    </span>
                  )}
                </div>

                {/* CTA Button */}
                <Link
                  href={event.lumaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-white transition-colors hover:bg-primary/90"
                >
                  Ver en Luma
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted">
            📅 Eventos sincronizados automáticamente desde{' '}
            <Link
              href="https://lu.ma/fruteroclub"
              target="_blank"
              className="text-primary hover:underline"
            >
              lu.ma/fruteroclub
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
