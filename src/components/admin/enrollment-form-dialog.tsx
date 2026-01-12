'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import {
  useCreateEnrollment,
  useUpdateEnrollment,
} from '@/hooks/use-program-enrollments'
import { useAllUsers } from '@/hooks/use-admin'
import type { ProgramEnrollmentWithUser, User } from '@/types/api-v1'

const enrollmentSchema = z.object({
  userId: z.string().min(1, 'Please select a student'),
  status: z.enum(['enrolled', 'completed', 'dropped']),
})

type EnrollmentFormData = z.infer<typeof enrollmentSchema>

interface EnrollmentFormDialogProps {
  programId: string
  enrollment?: ProgramEnrollmentWithUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EnrollmentFormDialog({
  programId,
  enrollment,
  open,
  onOpenChange,
}: EnrollmentFormDialogProps) {
  const isEditing = !!enrollment
  const createMutation = useCreateEnrollment(programId)
  const updateMutation = useUpdateEnrollment(programId)
  const { data: usersData, isLoading: isLoadingUsers } = useAllUsers()

  const form = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      userId: enrollment?.userId || '',
      status: enrollment?.status || 'enrolled',
    },
  })

  // Reset form when dialog opens/closes or enrollment changes
  useEffect(() => {
    if (open) {
      form.reset({
        userId: enrollment?.userId || '',
        status: enrollment?.status || 'enrolled',
      })
    }
  }, [open, enrollment, form])

  const onSubmit = (data: EnrollmentFormData) => {
    if (isEditing) {
      updateMutation.mutate(
        {
          enrollmentId: enrollment.id,
          data: {
            status: data.status,
          },
        },
        {
          onSuccess: () => {
            onOpenChange(false)
            form.reset()
          },
        },
      )
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          onOpenChange(false)
          form.reset()
        },
      })
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Enrollment' : 'Enroll Student'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update enrollment status and progress'
              : 'Add a new student to this program'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* User Selection (only for new enrollments) */}
            {!isEditing && (
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingUsers}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {usersData?.users
                          .filter(
                            (user: User) => user.accountStatus === 'approved',
                          )
                          .map((user: User) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.displayName || user.username || user.email}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the student to enroll
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="enrolled">Enrolled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="dropped">Dropped</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Current enrollment status</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? 'Update' : 'Enroll'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
