'use client'

import { useState, useEffect } from 'react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Activity {
  id: string
  title: string
  activity_type: string
  difficulty: string
  reward_pulpa_amount: string
  status: string
  current_submissions_count: number
  total_available_slots: number | null
  created_at: string
}

export default function AdminActivitiesPage() {
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    search: '',
  })

  useEffect(() => {
    fetchActivities()
  }, [filters])

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.type !== 'all') params.append('type', filters.type)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/activities?${params.toString()}`, {
        headers: {
          'x-user-id': 'ADMIN_USER_ID', // TODO: Replace with Privy auth
        },
      })

      if (!response.ok) throw new Error('Failed to fetch activities')

      const result = await response.json()
      setActivities(result.data.activities)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to fetch activities')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
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
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <main className="flex min-h-[calc(100vh-96px)] w-full flex-col items-center overflow-x-hidden">
      <div className="page-content mx-auto w-full space-y-8 px-4 py-8 md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Activities Management</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage educational activities for $PULPA token distribution
            </p>
          </div>
          <Button onClick={() => router.push('/admin/activities/new')}>
            Create New Activity
          </Button>
        </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
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
                onValueChange={(value) => setFilters({ ...filters, type: value })}
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
                  <SelectItem value="workshop_completion">Workshop Completion</SelectItem>
                  <SelectItem value="build_in_public">Build in Public</SelectItem>
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
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">Loading activities...</div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
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
                    <TableCell className="font-medium max-w-xs truncate">
                      {activity.title}
                    </TableCell>
                    <TableCell>{formatActivityType(activity.activity_type)}</TableCell>
                    <TableCell className="capitalize">{activity.difficulty}</TableCell>
                    <TableCell>{activity.reward_pulpa_amount} $PULPA</TableCell>
                    <TableCell>
                      {activity.current_submissions_count}
                      {activity.total_available_slots && ` / ${activity.total_available_slots}`}
                    </TableCell>
                    <TableCell>{getStatusBadge(activity.status)}</TableCell>
                    <TableCell>
                      {new Date(activity.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/activities/${activity.id}`)}
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
    </main>
  )
}
