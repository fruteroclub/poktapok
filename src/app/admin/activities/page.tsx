'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminRoute } from '@/components/layout/admin-route-wrapper'
import { useActivities, useDeleteActivity } from '@/hooks/use-activities'

function AdminActivitiesPageContent() {
  const router = useRouter()
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    search: '',
  })

  const { data, isLoading, error } = useActivities(filters)
  const deleteMutation = useDeleteActivity()

  const activities = data?.activities || []

  const handleDelete = (activityId: string, title: string) => {
    if (!confirm(`¿Eliminar la actividad "${title}"?`)) return

    deleteMutation.mutate(activityId, {
      onSuccess: () => {
        toast.success('Actividad eliminada')
      },
      onError: (err) => {
        toast.error(err.message || 'Error al eliminar')
      },
    })
  }

  const getStatusBadge = (status: string, effectiveStatus?: string) => {
    const displayStatus = effectiveStatus || status
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      draft: 'outline',
      active: 'default',
      paused: 'secondary',
      completed: 'secondary',
      cancelled: 'destructive',
      expired: 'destructive',
    }
    return <Badge variant={variants[displayStatus] || 'default'}>{displayStatus}</Badge>
  }

  const formatActivityType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="page-content">
      <div className="admin-header-section">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Activities Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage educational activities for $PULPA token
            distribution
          </p>
        </div>
        <Button onClick={() => router.push('/admin/activities/new')}>
          Create New Activity
        </Button>
      </div>

      {/* Filters */}
      <Card className="w-full gap-0! py-4">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Activity Type</label>
              <Select
                value={filters.type}
                onValueChange={(value) =>
                  setFilters({ ...filters, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="github_commit">GitHub Commit</SelectItem>
                  <SelectItem value="x_post">X (Twitter) Post</SelectItem>
                  <SelectItem value="photo">Photo Upload</SelectItem>
                  <SelectItem value="video">Video Upload</SelectItem>
                  <SelectItem value="blog_post">Blog Post</SelectItem>
                  <SelectItem value="workshop_completion">
                    Workshop Completion
                  </SelectItem>
                  <SelectItem value="build_in_public">
                    Build in Public
                  </SelectItem>
                  <SelectItem value="code_review">Code Review</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search by title..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities Table */}
      <Card className="w-full">
        <CardContent className="px-2 lg:px-6">
          {error ? (
            <div className="py-8 text-center text-destructive">
              Failed to load activities. Please try again.
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading activities...</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No activities found. Create your first activity to get started!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="max-w-xs truncate font-medium">
                      {activity.title}
                    </TableCell>
                    <TableCell>
                      {formatActivityType(activity.activityType)}
                    </TableCell>
                    <TableCell className="capitalize">
                      {activity.difficulty}
                    </TableCell>
                    <TableCell>{Math.floor(Number(activity.rewardPulpaAmount))} $PULPA</TableCell>
                    <TableCell>
                      {activity.currentSubmissionsCount}
                      {activity.totalAvailableSlots &&
                        ` / ${activity.totalAvailableSlots}`}
                    </TableCell>
                    <TableCell>{getStatusBadge(activity.status, activity.effectiveStatus)}</TableCell>
                    <TableCell>
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/admin/activities/${activity.id}`)
                          }
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(activity.id, activity.title)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminActivitiesPage() {
  return (
    <AdminRoute>
      <AdminActivitiesPageContent />
    </AdminRoute>
  )
}
