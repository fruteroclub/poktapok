'use client'

import { useState } from 'react'
import { EventFormDialog } from '@/components/admin/event-form-dialog'
import { EventCard } from '@/components/events/event-card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { CalendarDays, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { useAdminEvents, useDeleteEvent } from '@/hooks/use-events'
import { useActivePrograms } from '@/hooks/use-onboarding'
import { isPastDate } from '@/lib/utils/date-format'

export default function AdminEventsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past'>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)

  // Always fetch all events for accurate counts, filter client-side
  const { data: eventsData, isLoading: eventsLoading } = useAdminEvents({
    limit: 100,
  })

  const { data: programsData } = useActivePrograms()
  const deleteEventMutation = useDeleteEvent()

  const events = eventsData?.events || []
  const programs = programsData?.programs || []

  const handleDeleteClick = (eventId: string) => {
    setEventToDelete(eventId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return

    deleteEventMutation.mutate(eventToDelete, {
      onSuccess: () => {
        toast.success('Evento eliminado exitosamente')
        setDeleteDialogOpen(false)
        setEventToDelete(null)
      },
      onError: () => {
        toast.error('Error al eliminar el evento')
      },
    })
  }

  const filteredEvents = events.filter((event) => {
    if (activeTab === 'all') return true
    const isPast = isPastDate(event.startDate)
    if (activeTab === 'past') return isPast
    return !isPast
  })

  const upcomingCount = events.filter((e) => !isPastDate(e.startDate)).length
  const pastCount = events.filter((e) => isPastDate(e.startDate)).length

  if (eventsLoading) {
    return (
      <div className="page-content space-y-6">
        <div className="admin-header-section">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>
    )
  }

  return (
    <div className="page-content space-y-6">
      {/* Header */}
      <div className="admin-header-section">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Events Management
          </h1>
          <p className="text-muted-foreground">
            Manage community events from lu.ma
          </p>
        </div>
        <EventFormDialog programs={programs} />
      </div>

      {/* Filter Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as typeof activeTab)}
      >
        <TabsList>
          <TabsTrigger value="all">All Events ({events.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingCount})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <div key={event.id} className="group relative">
              <EventCard event={event} />
              <div className="absolute top-3 right-14 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleDeleteClick(event.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <CalendarDays className="h-20 w-20 text-muted-foreground/50" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              No events found
            </h3>
            <p className="max-w-md text-muted-foreground">
              Create your first event by clicking the &quot;Crear Evento&quot; button
              above.
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
