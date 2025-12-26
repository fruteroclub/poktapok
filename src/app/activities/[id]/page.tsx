'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

interface Activity {
  id: string
  title: string
  description: string
  instructions: string | null
  activity_type: string
  category: string | null
  difficulty: string
  reward_pulpa_amount: string
  evidence_requirements: {
    url_required: boolean
    screenshot_required: boolean
    text_required: boolean
  }
  max_submissions_per_user: number | null
  total_available_slots: number | null
  current_submissions_count: number
  starts_at: string | null
  expires_at: string | null
  status: string
}

export default function ActivityDetailPage() {
  const router = useRouter()
  const params = useParams()
  const activityId = params.id as string

  const [activity, setActivity] = useState<Activity | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    submission_url: '',
    submission_text: '',
  })

  useEffect(() => {
    fetchActivity()
  }, [activityId])

  const fetchActivity = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/activities/${activityId}`)

      if (!response.ok) throw new Error('Failed to fetch activity')

      const result = await response.json()
      setActivity(result.data)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to fetch activity')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!activity) return

    // Validate required fields
    if (activity.evidence_requirements.url_required && !formData.submission_url) {
      alert('URL is required for this activity')
      return
    }

    if (activity.evidence_requirements.text_required && !formData.submission_text) {
      alert('Description is required for this activity')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/activities/${activityId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'USER_ID', // TODO: Replace with actual Privy auth
        },
        body: JSON.stringify({
          submission_url: formData.submission_url || undefined,
          submission_text: formData.submission_text || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to submit')
      }

      alert('Submission successful! Your submission is pending review.')
      router.push('/activities')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
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

  const isExpired = (activity: Activity) => {
    return activity.expires_at && new Date(activity.expires_at) < new Date()
  }

  const canSubmit = (activity: Activity) => {
    return (
      activity.status === 'active' &&
      !isFull(activity) &&
      !isExpired(activity)
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center py-12">Loading activity...</div>
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center py-12">Activity not found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        ← Back to Activities
      </Button>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between gap-4 mb-4">
            <CardTitle className="text-3xl">{activity.title}</CardTitle>
            <Badge className="shrink-0 bg-purple-600 text-white text-lg px-4 py-1">
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
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{activity.description}</p>
          </div>

          {activity.instructions && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Instructions</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{activity.instructions}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <h4 className="font-medium mb-1">Submissions</h4>
              <p className="text-sm text-muted-foreground">
                {activity.current_submissions_count}
                {activity.total_available_slots && ` / ${activity.total_available_slots}`}
              </p>
            </div>
            {activity.max_submissions_per_user && (
              <div>
                <h4 className="font-medium mb-1">Max Per User</h4>
                <p className="text-sm text-muted-foreground">
                  {activity.max_submissions_per_user}
                </p>
              </div>
            )}
            {activity.expires_at && (
              <div>
                <h4 className="font-medium mb-1">Expires</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(activity.expires_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">Required Evidence</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={activity.evidence_requirements.url_required}
                  disabled
                />
                <span className="text-sm">
                  URL Link {activity.evidence_requirements.url_required && '(Required)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={activity.evidence_requirements.screenshot_required}
                  disabled
                />
                <span className="text-sm">
                  Screenshot {activity.evidence_requirements.screenshot_required && '(Required)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={activity.evidence_requirements.text_required}
                  disabled
                />
                <span className="text-sm">
                  Text Description {activity.evidence_requirements.text_required && '(Required)'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission Form */}
      {canSubmit(activity) ? (
        <Card>
          <CardHeader>
            <CardTitle>Submit Your Work</CardTitle>
            <CardDescription>
              Provide evidence of your completion to earn {activity.reward_pulpa_amount} $PULPA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {activity.evidence_requirements.url_required && (
                <div className="space-y-2">
                  <Label htmlFor="submission_url">
                    Submission URL *
                  </Label>
                  <Input
                    id="submission_url"
                    type="url"
                    value={formData.submission_url}
                    onChange={(e) => setFormData({ ...formData, submission_url: e.target.value })}
                    placeholder="https://github.com/yourname/yourrepo/commit/abc123"
                    required={activity.evidence_requirements.url_required}
                  />
                  <p className="text-sm text-muted-foreground">
                    Provide a link to your work (GitHub commit, X post, etc.)
                  </p>
                </div>
              )}

              {activity.evidence_requirements.text_required && (
                <div className="space-y-2">
                  <Label htmlFor="submission_text">
                    Description *
                  </Label>
                  <Textarea
                    id="submission_text"
                    value={formData.submission_text}
                    onChange={(e) => setFormData({ ...formData, submission_text: e.target.value })}
                    placeholder="Describe what you did and what you learned..."
                    rows={6}
                    required={activity.evidence_requirements.text_required}
                    maxLength={1000}
                  />
                  <p className="text-sm text-muted-foreground">
                    Explain your work and key learnings ({formData.submission_text.length}/1000 characters)
                  </p>
                </div>
              )}

              {activity.evidence_requirements.screenshot_required && (
                <div className="space-y-2">
                  <Label>Screenshot Upload</Label>
                  <p className="text-sm text-amber-600">
                    Screenshot upload feature coming soon. For now, you can include screenshot links in your description.
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? 'Submitting...' : 'Submit for Review'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {isFull(activity) && <p>This activity has reached its maximum submissions.</p>}
            {isExpired(activity) && <p>This activity has expired.</p>}
            {activity.status !== 'active' && <p>This activity is not currently accepting submissions.</p>}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
