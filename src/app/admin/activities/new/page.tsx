'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { AdminRoute } from '@/components/layout/admin-route-wrapper'
import { useCreateActivity } from '@/hooks/use-activities'
import { toast } from 'sonner'

function NewActivityPageContent() {
  const router = useRouter()
  const createMutation = useCreateActivity()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    external_url: '',
    activity_type: 'github_commit',
    category: '',
    difficulty: 'beginner',
    reward_pulpa_amount: '10',
    url_required: true,
    screenshot_required: false,
    text_required: true,
    verification_type: 'manual',
    max_submissions_per_user: '',
    total_available_slots: '',
    starts_at: '',
    expires_at: '',
    status: 'active',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      title: formData.title,
      description: formData.description,
      instructions: formData.instructions || undefined,
      external_url: formData.external_url || undefined,
      activity_type: formData.activity_type,
      category: formData.category || undefined,
      difficulty: formData.difficulty,
      reward_pulpa_amount: formData.reward_pulpa_amount,
      evidence_requirements: {
        url_required: formData.url_required,
        screenshot_required: formData.screenshot_required,
        text_required: formData.text_required,
      },
      verification_type: formData.verification_type,
      max_submissions_per_user:
        formData.max_submissions_per_user &&
        formData.max_submissions_per_user.trim()
          ? parseInt(formData.max_submissions_per_user)
          : undefined,
      total_available_slots:
        formData.total_available_slots && formData.total_available_slots.trim()
          ? parseInt(formData.total_available_slots)
          : undefined,
      starts_at: formData.starts_at
        ? new Date(formData.starts_at).toISOString()
        : undefined,
      expires_at: formData.expires_at
        ? new Date(formData.expires_at).toISOString()
        : undefined,
      status: formData.status,
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Activity created successfully!')
        router.push('/admin/activities')
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create activity')
      },
    })
  }

  return (
    <div className="page-content">
      <div className="header-section">
        <h1 className="text-3xl font-bold tracking-tight">
          Create New Activity
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create a new educational activity for users to earn $PULPA tokens
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Make Your First GitHub Commit"
              required
              minLength={5}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Learn Git basics by creating your first repository..."
              required
              minLength={20}
              maxLength={2000}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Step-by-Step Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) =>
                setFormData({ ...formData, instructions: e.target.value })
              }
              placeholder="1. Create a GitHub account&#10;2. Create a new repository&#10;3. Make your first commit..."
              rows={6}
              maxLength={5000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="external_url">External Link (Optional)</Label>
            <Input
              id="external_url"
              type="url"
              value={formData.external_url}
              onChange={(e) =>
                setFormData({ ...formData, external_url: e.target.value })
              }
              placeholder="https://example.com/workshop-link"
              maxLength={500}
            />
            <p className="text-sm text-muted-foreground">
              Link to external resource, workshop, or tutorial
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activity_type">Activity Type *</Label>
              <Select
                value={formData.activity_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, activity_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
              <Label htmlFor="difficulty">Difficulty *</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) =>
                  setFormData({ ...formData, difficulty: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="Workshops, Build in Public, Learning Milestones..."
              maxLength={100}
            />
          </div>
        </div>

        {/* Rewards */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Rewards & Limits</h2>

          <div className="space-y-2">
            <Label htmlFor="reward_pulpa_amount">PULPA Reward Amount *</Label>
            <Input
              id="reward_pulpa_amount"
              type="number"
              step="0.00000001"
              value={formData.reward_pulpa_amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reward_pulpa_amount: e.target.value,
                })
              }
              placeholder="10"
              required
              min="0.00000001"
            />
            <p className="text-sm text-muted-foreground">
              Amount of $PULPA tokens to reward
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_submissions_per_user">
                Max Submissions Per User
              </Label>
              <Input
                id="max_submissions_per_user"
                type="number"
                value={formData.max_submissions_per_user}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_submissions_per_user: e.target.value,
                  })
                }
                placeholder="1 (leave empty for unlimited)"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_available_slots">
                Total Available Slots
              </Label>
              <Input
                id="total_available_slots"
                type="number"
                value={formData.total_available_slots}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    total_available_slots: e.target.value,
                  })
                }
                placeholder="50 (leave empty for unlimited)"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Evidence Requirements */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Evidence Requirements</h2>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="url_required"
                checked={formData.url_required}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    url_required: checked as boolean,
                  })
                }
              />
              <Label htmlFor="url_required" className="font-normal">
                URL Required (GitHub link, X post link, etc.)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="screenshot_required"
                checked={formData.screenshot_required}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    screenshot_required: checked as boolean,
                  })
                }
              />
              <Label htmlFor="screenshot_required" className="font-normal">
                Screenshot Required
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="text_required"
                checked={formData.text_required}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    text_required: checked as boolean,
                  })
                }
              />
              <Label htmlFor="text_required" className="font-normal">
                Text Description Required
              </Label>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Schedule (Optional)</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="starts_at">Start Date</Label>
              <Input
                id="starts_at"
                type="datetime-local"
                value={formData.starts_at}
                onChange={(e) =>
                  setFormData({ ...formData, starts_at: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires_at">Expiry Date</Label>
              <Input
                id="expires_at"
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) =>
                  setFormData({ ...formData, expires_at: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Publish Status</h2>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">
                  Draft (not visible to users)
                </SelectItem>
                <SelectItem value="active">
                  Active (live and accepting submissions)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="flex-1"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Activity'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function NewActivityPage() {
  return (
    <AdminRoute>
      <NewActivityPageContent />
    </AdminRoute>
  )
}
