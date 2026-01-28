'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/hooks'
import { PlusCircle, ClipboardList } from 'lucide-react'
import PageWrapper from '@/components/layout/page-wrapper'
import { usePublicActivities } from '@/hooks/use-activities'
import type { Activity } from '@/services/activities'

export default function ActivitiesPage() {
  const router = useRouter()
  const { data: authData } = useAuth()
  const user = authData?.user
  const isAdmin = user?.role === 'admin'
  const [filters, setFilters] = useState({
    type: 'all',
    difficulty: 'all',
    search: '',
  })

  const { data, isLoading, error } = usePublicActivities(filters)
  const activities = data?.activities || []

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      beginner:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      intermediate:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }
    return colors[difficulty] || 'bg-gray-100 text-gray-800'
  }

  const formatActivityType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const isFull = (activity: Activity) => {
    return (
      activity.totalAvailableSlots !== null &&
      activity.currentSubmissionsCount >= activity.totalAvailableSlots
    )
  }

  return (
    <PageWrapper>
      <div className="page">
        <div className="page-content">
          <div className="w-full">
            <h1 className="text-3xl font-bold tracking-tight">
              Educational Activities
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Complete activities and earn $PULPA tokens while learning and
              building
            </p>
          </div>

          {/* Admin Panel */}
          {isAdmin && (
            <Card className="w-full border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                  <ClipboardList className="h-5 w-5" />
                  Panel de Administrador
                </CardTitle>
                <CardDescription>
                  Gestiona actividades y revisa submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => router.push('/admin/activities/new')}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Nueva Actividad
                  </Button>
                  <Button
                    onClick={() => router.push('/admin/submissions')}
                    variant="outline"
                    className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950"
                  >
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Revisar Submissions
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card className="w-full gap-2">
            <CardHeader>
              <CardTitle>Find Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
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
                      <SelectItem value="github_commit">
                        GitHub Commit
                      </SelectItem>
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
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select
                    value={filters.difficulty}
                    onValueChange={(value) =>
                      setFilters({ ...filters, difficulty: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <Input
                    placeholder="Search activities..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activities Grid */}
          {error ? (
            <div className="py-12 text-center text-destructive">
              Failed to load activities. Please try again.
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading activities...</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No activities found. Check back soon for new opportunities!
            </div>
          ) : (
            <div className="grid w-full grid-cols-1 gap-y-2 md:grid-cols-2 lg:grid-cols-3">
              {activities.map((activity) => (
                <Card
                  key={activity.id}
                  className="flex cursor-pointer flex-col transition-shadow hover:shadow-lg"
                  onClick={() => router.push(`/activities/${activity.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-2 text-xl">
                        {activity.title}
                      </CardTitle>
                      <Badge className="shrink-0 bg-purple-600 text-white">
                        {Number(activity.rewardPulpaAmount)} $PULPA
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {formatActivityType(activity.activityType)}
                      </Badge>
                      <Badge
                        className={getDifficultyColor(activity.difficulty)}
                      >
                        {activity.difficulty}
                      </Badge>
                      {activity.category && (
                        <Badge variant="secondary">{activity.category}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <CardDescription className="line-clamp-3 flex-1">
                      {activity.description}
                    </CardDescription>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {activity.currentSubmissionsCount} submissions
                          {activity.totalAvailableSlots &&
                            ` / ${activity.totalAvailableSlots} slots`}
                        </span>
                        {isFull(activity) && (
                          <Badge variant="destructive">Full</Badge>
                        )}
                      </div>
                    </div>

                    <Button className="w-full" disabled={isFull(activity)}>
                      {isFull(activity) ? 'Full' : 'View Details'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
