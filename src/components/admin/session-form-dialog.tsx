'use client'

import { useEffect, useState } from 'react'
import {
  useSession,
  useCreateSession,
  useUpdateSession,
  useAllPrograms,
} from '@/hooks/use-admin'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface SessionFormDialogProps {
  open: boolean
  onClose: () => void
  sessionId?: string | null
}

interface FormData {
  programId: string
  title: string
  description: string
  sessionType: 'in-person' | 'virtual' | 'hybrid'
  sessionDate: string
  duration: string
  location: string
}

export function SessionFormDialog({
  open,
  onClose,
  sessionId,
}: SessionFormDialogProps) {
  const isEditing = !!sessionId

  const [formData, setFormData] = useState<FormData>({
    programId: '',
    title: '',
    description: '',
    sessionType: 'in-person',
    sessionDate: '',
    duration: '',
    location: '',
  })

  // Fetch session data if editing
  const { data: sessionData, isLoading: isLoadingSession } = useSession(
    sessionId || null,
  )

  // Fetch programs for dropdown
  const { data: programsData } = useAllPrograms()

  // Mutations
  const createMutation = useCreateSession()
  const updateMutation = useUpdateSession()

  // Load session data when editing
  useEffect(() => {
    if (sessionData?.session) {
      const session = sessionData.session
      setFormData({
        programId: session.programId,
        title: session.title,
        description: session.description || '',
        sessionType: session.sessionType,
        sessionDate: new Date(session.sessionDate)
          .toISOString()
          .slice(0, 16), // datetime-local format
        duration: session.duration || '',
        location: session.location || '',
      })
    }
  }, [sessionData])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        programId: '',
        title: '',
        description: '',
        sessionType: 'in-person',
        sessionDate: '',
        duration: '',
        location: '',
      })
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.programId) {
      toast.error('Please select a program')
      return
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a session title')
      return
    }

    if (!formData.sessionDate) {
      toast.error('Please select a session date and time')
      return
    }

    if (!formData.location.trim()) {
      toast.error('Please enter a location')
      return
    }

    try {
      if (isEditing && sessionId) {
        await updateMutation.mutateAsync({
          sessionId,
          data: {
            ...formData,
            sessionDate: new Date(formData.sessionDate).toISOString(),
            description: formData.description || null,
            duration: formData.duration || null,
          },
        })
        toast.success('Session updated successfully')
      } else {
        await createMutation.mutateAsync({
          ...formData,
          sessionDate: new Date(formData.sessionDate).toISOString(),
          description: formData.description || undefined,
          duration: formData.duration || undefined,
        })
        toast.success('Session created successfully')
      }
      onClose()
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  const getLocationPlaceholder = () => {
    switch (formData.sessionType) {
      case 'in-person':
        return 'e.g., Room 301, Building A'
      case 'virtual':
        return 'e.g., https://meet.google.com/xxx-yyyy-zzz'
      case 'hybrid':
        return 'Location and/or meeting URL'
      default:
        return 'Enter location or meeting URL'
    }
  }

  const isPending =
    createMutation.isPending || updateMutation.isPending || isLoadingSession

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Session' : 'Create New Session'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the session information below.'
              : 'Fill in the details to create a new session.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6">
            {/* Program Selection */}
            <div className="space-y-2">
              <Label htmlFor="program">
                Program <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.programId}
                onValueChange={(value) =>
                  setFormData({ ...formData, programId: value })
                }
                disabled={isPending}
              >
                <SelectTrigger id="program">
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  {programsData?.programs.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Introduction to Web Development"
                required
                maxLength={200}
                disabled={isPending}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what will be covered in this session..."
                rows={4}
                disabled={isPending}
              />
            </div>

            {/* Session Type */}
            <div className="space-y-2">
              <Label htmlFor="sessionType">
                Session Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.sessionType}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    sessionType: value as FormData['sessionType'],
                  })
                }
                disabled={isPending}
              >
                <SelectTrigger id="sessionType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-person">In-Person</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Session Date */}
            <div className="space-y-2">
              <Label htmlFor="sessionDate">
                Date & Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sessionDate"
                type="datetime-local"
                value={formData.sessionDate}
                onChange={(e) =>
                  setFormData({ ...formData, sessionDate: e.target.value })
                }
                required
                disabled={isPending}
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="e.g., 2 hours, 90 minutes"
                maxLength={50}
                disabled={isPending}
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder={getLocationPlaceholder()}
                required
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                {formData.sessionType === 'in-person' &&
                  'Enter the physical location where the session will be held'}
                {formData.sessionType === 'virtual' &&
                  'Enter the meeting URL (e.g., Zoom, Google Meet)'}
                {formData.sessionType === 'hybrid' &&
                  'Enter both physical location and meeting URL'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update Session' : 'Create Session'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
