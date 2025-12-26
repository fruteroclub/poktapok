'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Activity {
  id: string
  title: string
  description: string
  activity_type: string
  difficulty: string
  reward_pulpa_amount: string
  current_submissions_count: number
  total_available_slots: number | null
  category: string | null
}

export default function ActivitiesPage() {
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: 'all',
    difficulty: 'all',
    search: '',
  })

  useEffect(() => {
    fetchActivities()
  }, [filters])

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status: 'active' })
      if (filters.type !== 'all') params.append('type', filters.type)
      if (filters.difficulty !== 'all') params.append('difficulty', filters.difficulty)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/activities?${params.toString()}`)

      if (!response.ok) throw new Error('Failed to fetch activities')

      const result = await response.json()
      setActivities(result.data.activities)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to fetch activities')
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }
    return colors[difficulty] || 'bg-gray-100 text-gray-800'
  }

  const formatActivityType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const isFull = (activity: Activity) => {
    return (
      activity.total_available_slots !== null &&
      activity.current_submissions_count >= activity.total_available_slots
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Educational Activities</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Complete activities and earn $PULPA tokens while learning and building
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Find Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <label className="text-sm font-medium">Difficulty</label>
              <Select
                value={filters.difficulty}
                onValueChange={(value) => setFilters({ ...filters, difficulty: value })}
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
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities Grid */}
      {loading ? (
        <div className="text-center py-12">Loading activities...</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No activities found. Check back soon for new opportunities!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <Card
              key={activity.id}
              className="flex flex-col hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/activities/${activity.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CardTitle className="text-xl line-clamp-2">{activity.title}</CardTitle>
                  <Badge className="shrink-0 bg-purple-600 text-white">
                    {activity.reward_pulpa_amount} $PULPA
                  </Badge>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{formatActivityType(activity.activity_type)}</Badge>
                  <Badge className={getDifficultyColor(activity.difficulty)}>
                    {activity.difficulty}
                  </Badge>
                  {activity.category && (
                    <Badge variant="secondary">{activity.category}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <CardDescription className="line-clamp-3 flex-1">
                  {activity.description}
                </CardDescription>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {activity.current_submissions_count} submissions
                      {activity.total_available_slots &&
                        ` / ${activity.total_available_slots} slots`}
                    </span>
                    {isFull(activity) && (
                      <Badge variant="destructive">Full</Badge>
                    )}
                  </div>
                </div>

                <Button className="mt-4 w-full" disabled={isFull(activity)}>
                  {isFull(activity) ? 'Full' : 'View Details'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
