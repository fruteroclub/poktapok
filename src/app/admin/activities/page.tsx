'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

interface Activity {
  id: string
  title: string
  activityType: string
  difficulty: string
  rewardPulpaAmount: string
  status: string
  currentSubmissionsCount: number
  totalAvailableSlots: number | null
  createdAt: string
}

function AdminActivitiesPageContent() {
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    search: '',
  })

  const fetchActivities = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.type !== 'all') params.append('type', filters.type)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/admin/activities?${params.toString()}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to fetch activities')
      }

      const result = await response.json()
      setActivities(result.data.activities || [])
    } catch (error) {
      console.error('Error fetching activities:', error)
      alert(
        error instanceof Error ? error.message : 'Failed to fetch activities',
      )
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      draft: 'outline',
      active: 'default',
      paused: 'secondary',
      completed: 'secondary',
      cancelled: 'destructive',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const formatActivityType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="page-content">
      <div className="mb-6 flex w-full items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Activities Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create and manage educational activities for $PULPA token
            distribution
          </p>
        </div>
        <Button onClick={() => router.push('/admin/activities/new')}>
          Create New Activity
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6 w-full">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
        <CardContent className="pt-6">
          {loading ? (
            <div className="py-8 text-center">Loading activities...</div>
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
                    <TableCell>{activity.rewardPulpaAmount} $PULPA</TableCell>
                    <TableCell>
                      {activity.currentSubmissionsCount}
                      {activity.totalAvailableSlots &&
                        ` / ${activity.totalAvailableSlots}`}
                    </TableCell>
                    <TableCell>{getStatusBadge(activity.status)}</TableCell>
                    <TableCell>
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/admin/activities/${activity.id}`)
                        }
                      >
                        View
                      </Button>
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
