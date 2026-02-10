/**
 * Events service functions
 * Abstracts API calls for events management
 */

import { apiFetch } from '@/lib/api/fetch'
import type { Event } from '@/lib/db/schema'

export type EventStatus = 'upcoming' | 'past' | 'all'

export interface EventWithStatus extends Event {
  status: 'upcoming' | 'past'
}

export interface ListEventsFilters {
  status?: EventStatus
  featured?: boolean
  limit?: number
}

export interface ListEventsResponse {
  events: EventWithStatus[]
}

/**
 * Fetch public events with optional filters
 */
export async function fetchEvents(
  filters?: ListEventsFilters
): Promise<ListEventsResponse> {
  const params = new URLSearchParams()

  if (filters?.status && filters.status !== 'all') {
    params.append('status', filters.status)
  }
  if (filters?.featured) {
    params.append('featured', 'true')
  }
  if (filters?.limit) {
    params.append('limit', filters.limit.toString())
  }

  const queryString = params.toString()
  const url = queryString ? `/api/events?${queryString}` : '/api/events'

  return apiFetch<ListEventsResponse>(url)
}

export interface AdminListEventsFilters {
  status?: EventStatus
  programId?: string
  limit?: number
}

export interface AdminListEventsResponse {
  events: EventWithStatus[]
}

/**
 * Fetch all events for admin (includes unpublished)
 */
export async function fetchAdminEvents(
  filters?: AdminListEventsFilters
): Promise<AdminListEventsResponse> {
  const params = new URLSearchParams()

  if (filters?.status && filters.status !== 'all') {
    params.append('status', filters.status)
  }
  if (filters?.programId) {
    params.append('programId', filters.programId)
  }
  if (filters?.limit) {
    params.append('limit', filters.limit.toString())
  }

  const queryString = params.toString()
  const url = queryString
    ? `/api/admin/events?${queryString}`
    : '/api/admin/events'

  return apiFetch<AdminListEventsResponse>(url)
}

export interface CreateEventRequest {
  title: string
  description?: string | null
  coverImage?: string | null
  lumaUrl: string
  lumaEventId?: string | null
  lumaSlug: string
  eventType: 'in-person' | 'virtual' | 'hybrid'
  startDate: string
  endDate?: string | null
  timezone: string
  location?: string | null
  locationDetails?: string | null
  hosts?: { name: string; avatarUrl?: string; handle?: string }[]
  calendar?: string | null
  programId?: string | null
  isPublished?: boolean
  isFeatured?: boolean
}

export interface CreateEventResponse {
  event: Event
}

/**
 * Create a new event (admin only)
 */
export async function createEvent(
  data: CreateEventRequest
): Promise<CreateEventResponse> {
  return apiFetch<CreateEventResponse>('/api/admin/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

/**
 * Delete an event (admin only)
 */
export async function deleteEvent(eventId: string): Promise<{ deleted: boolean }> {
  return apiFetch<{ deleted: boolean }>(`/api/admin/events/${eventId}`, {
    method: 'DELETE',
  })
}

export interface UpdateEventRequest {
  title?: string
  description?: string | null
  coverImage?: string | null
  eventType?: 'in-person' | 'virtual' | 'hybrid'
  startDate?: string
  endDate?: string | null
  location?: string | null
  isPublished?: boolean
  isFeatured?: boolean
}

/**
 * Update an event (admin only)
 */
export async function updateEvent(
  eventId: string,
  data: UpdateEventRequest
): Promise<{ event: Event }> {
  return apiFetch<{ event: Event }>(`/api/admin/events/${eventId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export interface FetchLumaMetadataRequest {
  url: string
}

export interface LumaEventMetadata {
  title: string
  description: string | null
  coverImage: string | null
  lumaEventId: string | null
  lumaSlug: string
  lumaUrl: string
  eventType: 'in-person' | 'virtual' | 'hybrid'
  startDate: string
  endDate: string | null
  timezone: string
  location: string | null
  locationDetails: string | null
  hosts: { name: string; avatarUrl?: string; handle?: string }[]
  calendar: string | null
}

/**
 * Fetch event metadata from a lu.ma URL
 */
export async function fetchLumaMetadata(
  url: string
): Promise<LumaEventMetadata> {
  return apiFetch<LumaEventMetadata>('/api/luma/fetch-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
}

export interface SyncCalendarResponse {
  synced: number
  created: number
  updated: number
  errors?: number
  events: { slug: string; title: string; action: string }[]
  message: string
}

/**
 * Sync events from a Luma calendar
 * @param calendarSlug - The Luma calendar slug (e.g., 'fruteroclub')
 */
export async function syncLumaCalendar(
  calendarSlug: string
): Promise<SyncCalendarResponse> {
  return apiFetch<SyncCalendarResponse>('/api/luma/sync-calendar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ calendarSlug }),
  })
}
