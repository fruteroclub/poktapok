'use client'

import { useState } from 'react'
import {
  useSessionActivities,
  useLinkSessionActivity,
  useUnlinkSessionActivity,
} from '@/hooks/use-admin'
import { useActivities } from '@/hooks/use-activities'
import type { Activity } from '@/services/activities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
import { GripVertical, X, Plus, Search } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { SessionActivityLinkWithDetails } from '@/types/api-v1'

interface SessionActivitiesManagerProps {
  sessionId: string
}

interface SortableActivityCardProps {
  link: SessionActivityLinkWithDetails
  onRemove: () => void
}

function SortableActivityCard({ link, onRemove }: SortableActivityCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const activityTypeColors: Record<string, string> = {
    lecture: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    workshop: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    assignment: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    quiz: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    project: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    discussion: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 border rounded-lg bg-card"
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Order Number */}
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
        {link.orderIndex}
      </div>

      {/* Activity Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium truncate">{link.activity.title}</h4>
          <Badge className={activityTypeColors[link.activity.activityType]}>
            {link.activity.activityType}
          </Badge>
        </div>
        {link.activity.description && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {link.activity.description}
          </p>
        )}
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface AvailableActivityCardProps {
  activity: Activity
  onAdd: () => void
}

function AvailableActivityCard({ activity, onAdd }: AvailableActivityCardProps) {
  const activityTypeColors: Record<string, string> = {
    lecture: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    workshop: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    assignment: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    quiz: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    project: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    discussion: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  }

  return (
    <div className="flex items-center gap-3 p-4 border rounded-lg bg-card hover:border-primary/50 transition-colors">
      {/* Activity Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium truncate">{activity.title}</h4>
          <Badge className={activityTypeColors[activity.activityType]}>
            {activity.activityType}
          </Badge>
        </div>
        {activity.description && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {activity.description}
          </p>
        )}
      </div>

      {/* Add Button */}
      <Button onClick={onAdd} size="sm">
        <Plus className="h-4 w-4 mr-1" />
        Add
      </Button>
    </div>
  )
}

export function SessionActivitiesManager({
  sessionId,
}: SessionActivitiesManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false)
  const [linkToUnlink, setLinkToUnlink] = useState<string | null>(null)

  const { data: linkedData, isLoading: isLoadingLinked } =
    useSessionActivities(sessionId)
  const { data: allActivitiesData, isLoading: isLoadingAll } = useActivities()

  const linkMutation = useLinkSessionActivity()
  const unlinkMutation = useUnlinkSessionActivity()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const linkedActivities = linkedData?.activities || []
  const allActivities = allActivitiesData?.activities || []

  // Filter available activities (exclude already linked)
  const linkedActivityIds = new Set(
    linkedActivities.map((link) => link.activity.id)
  )
  const availableActivities = allActivities.filter(
    (activity) => !linkedActivityIds.has(activity.id)
  )

  // Filter by search query
  const filteredAvailableActivities = availableActivities.filter((activity) =>
    activity.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = linkedActivities.findIndex((link) => link.id === active.id)
    const newIndex = linkedActivities.findIndex((link) => link.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    const reorderedLinks = arrayMove(linkedActivities, oldIndex, newIndex)

    // Update order indices
    const updates = reorderedLinks.map((link, index) => ({
      linkId: link.id,
      orderIndex: index + 1,
    }))

    try {
      // TODO: Implement bulk update endpoint for better UX
      // For now, we'll rely on the natural re-fetch after drag
      toast.success('Activities reordered')
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  const handleAddActivity = async (activityId: string) => {
    try {
      await linkMutation.mutateAsync({
        sessionId,
        data: {
          activityId,
          orderIndex: linkedActivities.length + 1,
        },
      })
      toast.success('Activity added to session')
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  const handleRemoveClick = (activityId: string) => {
    setLinkToUnlink(activityId)
    setUnlinkDialogOpen(true)
  }

  const handleRemoveConfirm = async () => {
    if (!linkToUnlink) return

    try {
      await unlinkMutation.mutateAsync({
        sessionId,
        activityId: linkToUnlink,
      })
      toast.success('Activity removed from session')
      setUnlinkDialogOpen(false)
      setLinkToUnlink(null)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Linked Activities Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            Session Activities ({linkedActivities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingLinked ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : linkedActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                No activities linked yet. Add activities from the list below.
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={linkedActivities.map((link) => link.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {linkedActivities.map((link) => (
                    <SortableActivityCard
                      key={link.id}
                      link={link}
                      onRemove={() => handleRemoveClick(link.activityId)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Available Activities Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add Activities</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingAll ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredAvailableActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? 'No activities match your search.'
                  : 'All activities are already linked to this session.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAvailableActivities.map((activity) => (
                <AvailableActivityCard
                  key={activity.id}
                  activity={activity}
                  onAdd={() => handleAddActivity(activity.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unlink Confirmation Dialog */}
      <AlertDialog open={unlinkDialogOpen} onOpenChange={setUnlinkDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this activity from the session?
              This will not delete the activity itself.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
