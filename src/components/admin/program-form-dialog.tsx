'use client'

import { useState } from 'react'
import { useProgram, useCreateProgram, useUpdateProgram } from '@/hooks/use-admin'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface ProgramFormDialogProps {
  open: boolean
  onClose: () => void
  programId?: string | null
}

interface FormData {
  name: string
  description: string
  programType: 'cohort' | 'evergreen'
  startDate: string
  endDate: string
  isActive: boolean
}

const defaultFormData: FormData = {
  name: '',
  description: '',
  programType: 'cohort',
  startDate: '',
  endDate: '',
  isActive: true,
}

export function ProgramFormDialog({ open, onClose, programId }: ProgramFormDialogProps) {
  const isEditing = !!programId

  // Fetch program data if editing
  const { data: programData, isLoading: isLoadingProgram } = useProgram(programId || null)

  // Mutations
  const createMutation = useCreateProgram()
  const updateMutation = useUpdateProgram()

  // Initialize form data - derived from programData or defaults
  const initialFormData: FormData = programData?.program
    ? {
        name: programData.program.name,
        description: programData.program.description || '',
        programType: programData.program.programType,
        startDate: programData.program.startDate
          ? new Date(programData.program.startDate).toISOString().split('T')[0]
          : '',
        endDate: programData.program.endDate
          ? new Date(programData.program.endDate).toISOString().split('T')[0]
          : '',
        isActive: programData.program.isActive,
      }
    : defaultFormData

  const [formData, setFormData] = useState<FormData>(initialFormData)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate cohort dates
    if (formData.programType === 'cohort') {
      if (!formData.startDate || !formData.endDate) {
        toast.error('Cohort programs require start and end dates')
        return
      }

      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        toast.error('End date must be after start date')
        return
      }
    }

    try {
      if (isEditing && programId) {
        await updateMutation.mutateAsync({
          programId,
          data: {
            name: formData.name,
            description: formData.description,
            programType: formData.programType,
            startDate:
              formData.programType === 'cohort' && formData.startDate
                ? new Date(formData.startDate).toISOString()
                : null,
            endDate:
              formData.programType === 'cohort' && formData.endDate
                ? new Date(formData.endDate).toISOString()
                : null,
            isActive: formData.isActive,
          },
        })
        toast.success('Program updated successfully')
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          description: formData.description,
          programType: formData.programType,
          startDate:
            formData.programType === 'cohort' && formData.startDate
              ? new Date(formData.startDate).toISOString()
              : undefined,
          endDate:
            formData.programType === 'cohort' && formData.endDate
              ? new Date(formData.endDate).toISOString()
              : undefined,
          isActive: formData.isActive,
        })
        toast.success('Program created successfully')
      }
      onClose()
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
    }))
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Program' : 'Create New Program'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update program details and configuration'
              : 'Create a new program for your platform'}
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoadingProgram ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form
            key={programId || 'new'}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Program Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., De Cero a Chamba"
                  required
                  maxLength={100}
                  disabled={isPending}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the program objectives and what participants will learn..."
                  required
                  rows={4}
                  disabled={isPending}
                />
              </div>

              {/* Program Type */}
              <div className="space-y-2">
                <Label htmlFor="programType">
                  Program Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.programType}
                  onValueChange={(value: 'cohort' | 'evergreen') =>
                    setFormData({ ...formData, programType: value })
                  }
                  disabled={isPending}
                >
                  <SelectTrigger id="programType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cohort">Cohort (Time-bound)</SelectItem>
                    <SelectItem value="evergreen">Evergreen (Ongoing)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.programType === 'cohort'
                    ? 'Cohort programs have specific start and end dates'
                    : 'Evergreen programs run continuously without fixed dates'}
                </p>
              </div>

              {/* Dates (only for cohort programs) */}
              {formData.programType === 'cohort' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">
                      Start Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required={formData.programType === 'cohort'}
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">
                      End Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required={formData.programType === 'cohort'}
                      disabled={isPending}
                      min={formData.startDate}
                    />
                  </div>
                </div>
              )}

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked === true })}
                  disabled={isPending}
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active (visible to users)
                </Label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : isEditing ? (
                  'Update Program'
                ) : (
                  'Create Program'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
