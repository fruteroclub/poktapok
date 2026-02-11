/**
 * Events hooks using Convex
 *
 * Real-time queries that automatically update when data changes.
 * No need for manual refetch or cache invalidation.
 */

import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

/**
 * Hook to fetch all published events (real-time)
 */
export function usePublishedEvents() {
  return useQuery(api.events.listPublished)
}

/**
 * Hook to fetch upcoming events (real-time)
 */
export function useUpcomingEvents() {
  return useQuery(api.events.listUpcoming)
}

/**
 * Hook to fetch featured events (real-time)
 */
export function useFeaturedEvents() {
  return useQuery(api.events.listFeatured)
}

/**
 * Hook to fetch events by calendar (real-time)
 */
export function useEventsByCalendar(calendar: string) {
  return useQuery(api.events.listByCalendar, { calendar })
}

/**
 * Hook to get a single event by ID
 */
export function useEvent(eventId: Id<'events'> | undefined) {
  return useQuery(api.events.get, eventId ? { eventId } : 'skip')
}

/**
 * Hook to get event by Luma slug
 */
export function useEventByLumaSlug(lumaSlug: string | undefined) {
  return useQuery(
    api.events.getByLumaSlug,
    lumaSlug ? { lumaSlug } : 'skip'
  )
}

/**
 * Hook to create an event
 */
export function useCreateEvent() {
  return useMutation(api.events.create)
}

/**
 * Hook to update an event
 */
export function useUpdateEvent() {
  return useMutation(api.events.update)
}

/**
 * Hook to delete an event
 */
export function useDeleteEvent() {
  return useMutation(api.events.remove)
}

/**
 * Hook to trigger Luma calendar sync
 */
export function useSyncLumaCalendar() {
  return useAction(api.luma.syncAction.syncCalendar)
}

/**
 * Utility type for event data from Convex
 */
export type ConvexEvent = NonNullable<ReturnType<typeof usePublishedEvents>>[number]
