'use client'

import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

/**
 * Hook for events list
 */
export function useEvents(options?: { status?: string; limit?: number }) {
  // Map status to Convex format
  const convexStatus =
    options?.status === 'past' ? 'past' : options?.status === 'live' ? 'live' : 'upcoming'

  const result = useQuery(api.events.list, {
    status: convexStatus,
    limit: options?.limit,
  })

  // Transform to expected format
  const events = (result?.events || []).map((event) => ({
    id: event._id,
    title: event.title,
    description: event.description,
    coverImage: event.coverImage,
    lumaUrl: event.lumaUrl,
    lumaSlug: event.lumaSlug,
    eventType: event.eventType,
    startDate: new Date(event.startDate).toISOString(),
    endDate: event.endDate ? new Date(event.endDate).toISOString() : undefined,
    timezone: event.timezone,
    location: event.location,
    locationDetails: event.locationDetails,
    locationUrl: event.locationUrl,
    hosts: event.hosts,
    status: event.status,
    isPublished: event.isPublished,
    isFeatured: event.isFeatured,
    registrationCount: event.registrationCount,
    maxCapacity: event.maxCapacity,
    registrationType: event.registrationType,
  }))

  return {
    data: { events },
    isLoading: result === undefined,
    isError: false,
    error: null,
  }
}
