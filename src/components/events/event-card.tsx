'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, ExternalLink, Users } from 'lucide-react'
import Image from 'next/image'
import type { Event } from '@/lib/db/schema'
import {
  formatEventDate,
  formatCalendarDate,
  isPastDate,
} from '@/lib/utils/date-format'
import {
  getEventTypeLabel,
  getEventStatusLabel,
} from '@/lib/utils/event-labels'

interface EventCardProps {
  event: Event
  variant?: 'default' | 'compact'
}

export function EventCard({ event, variant = 'default' }: EventCardProps) {
  const isPast = isPastDate(event.startDate)
  const { day, month } = formatCalendarDate(event.startDate)

  if (variant === 'compact') {
    return (
      <Card className="group flex h-24 overflow-hidden transition-all duration-300 hover:shadow-lg">
        {/* Date Badge */}
        <div className="flex w-16 flex-shrink-0 flex-col items-center justify-center bg-primary/10 text-primary">
          <span className="text-xs font-medium">{month}</span>
          <span className="text-2xl font-bold">{day}</span>
        </div>

        {/* Content */}
        <CardContent className="flex flex-1 items-center justify-between p-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-foreground">
              {event.title}
            </h3>
            {event.location && (
              <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                {event.location}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={isPast ? 'secondary' : 'default'}>
              {getEventStatusLabel(isPast)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group w-80 flex-shrink-0 overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
      {/* Cover Image */}
      <div className="relative h-40 w-full bg-primary/10">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Calendar className="h-12 w-12 text-primary/50" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute left-3 top-3">
          <Badge
            variant={isPast ? 'secondary' : 'default'}
            className={isPast ? 'bg-background/80 backdrop-blur' : 'bg-primary/90 backdrop-blur'}
          >
            {getEventStatusLabel(isPast)}
          </Badge>
        </div>

        {/* Event Type Badge */}
        <div className="absolute right-3 top-3">
          <Badge
            variant="outline"
            className="border-white/30 bg-background/80 backdrop-blur"
          >
            {getEventTypeLabel(event.eventType as 'in-person' | 'virtual' | 'hybrid')}
          </Badge>
        </div>
      </div>

      <CardContent className="space-y-3 pt-4">
        {/* Title */}
        <h3 className="line-clamp-2 text-lg font-bold text-foreground">
          {event.title}
        </h3>

        {/* Description */}
        {event.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {event.description}
          </p>
        )}

        {/* Date & Location */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            {formatEventDate(event.startDate)}
          </div>

          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}

          {event.registrationCount !== null && event.registrationCount > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              {event.registrationCount} registrados
            </div>
          )}
        </div>

        {/* Hosts */}
        {event.hosts && (event.hosts as { name: string }[]).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {(event.hosts as { name: string }[]).slice(0, 2).map((host, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {host.name}
              </Badge>
            ))}
          </div>
        )}

        {/* CTA Button */}
        {event.lumaUrl && (
          <Button
            variant={isPast ? 'outline' : 'default'}
            size="sm"
            className="w-full"
            asChild
          >
            <a
              href={event.lumaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              {isPast ? 'Ver detalles' : 'Registrarse'}
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
