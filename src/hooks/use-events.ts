/**
 * Events hooks for public and admin events management
 * TanStack Query hooks for events operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchEvents,
  fetchAdminEvents,
  createEvent,
  deleteEvent,
  updateEvent,
  fetchLumaMetadata,
  syncLumaCalendar,
  type ListEventsFilters,
  type AdminListEventsFilters,
  type CreateEventRequest,
  type UpdateEventRequest,
} from '@/services/events'

/**
 * Hook to fetch public events with optional filters
 */
export function useEvents(filters?: ListEventsFilters) {
  return useQuery({
    queryKey: ['events', 'public', filters],
    queryFn: () => fetchEvents(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch upcoming public events
 */
export function useUpcomingEvents(limit?: number) {
  return useEvents({ status: 'upcoming', limit })
}

/**
 * Hook to fetch past public events
 */
export function usePastEvents(limit?: number) {
  return useEvents({ status: 'past', limit })
}

/**
 * Hook to fetch featured events
 */
export function useFeaturedEvents(limit?: number) {
  return useEvents({ status: 'upcoming', featured: true, limit })
}

/**
 * Hook to fetch all events for admin (includes unpublished)
 */
export function useAdminEvents(filters?: AdminListEventsFilters) {
  return useQuery({
    queryKey: ['events', 'admin', filters],
    queryFn: () => fetchAdminEvents(filters),
    staleTime: 1 * 60 * 1000, // 1 minute for admin data
  })
}

/**
 * Hook to create a new event
 */
export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEventRequest) => createEvent(data),
    onSuccess: () => {
      // Invalidate all events queries to refetch with new data
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

/**
 * Hook to delete an event
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventId: string) => deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

/**
 * Hook to update an event
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: UpdateEventRequest }) =>
      updateEvent(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

/**
 * Hook to fetch lu.ma event metadata
 */
export function useFetchLumaMetadata() {
  return useMutation({
    mutationFn: (url: string) => fetchLumaMetadata(url),
  })
}

/**
 * Hook to sync events from a Luma calendar
 */
export function useSyncLumaCalendar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (calendarSlug: string) => syncLumaCalendar(calendarSlug),
    onSuccess: () => {
      // Invalidate all events queries to refetch with synced data
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
