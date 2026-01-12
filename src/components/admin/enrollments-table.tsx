'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import {
  useUpdateEnrollment,
  useDeleteEnrollment,
} from '@/hooks/use-program-enrollments'
import { EnrollmentFormDialog } from './enrollment-form-dialog'
import type { ProgramEnrollmentWithUser } from '@/types/api-v1'

interface EnrollmentsTableProps {
  programId: string
  enrollments: ProgramEnrollmentWithUser[]
}

export function EnrollmentsTable({
  programId,
  enrollments,
}: EnrollmentsTableProps) {
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<ProgramEnrollmentWithUser | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<string | null>(
    null,
  )

  const updateMutation = useUpdateEnrollment(programId)
  const deleteMutation = useDeleteEnrollment(programId)

  const handleEdit = (enrollment: ProgramEnrollmentWithUser) => {
    setSelectedEnrollment(enrollment)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (enrollmentId: string) => {
    setEnrollmentToDelete(enrollmentId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (enrollmentToDelete) {
      deleteMutation.mutate(enrollmentToDelete)
      setIsDeleteDialogOpen(false)
      setEnrollmentToDelete(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enrolled':
        return <Badge variant="default">Enrolled</Badge>
      case 'completed':
        return (
          <Badge className="bg-green-600 hover:bg-green-700">Completed</Badge>
        )
      case 'dropped':
        return <Badge variant="destructive">Dropped</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getUserDisplayName = (enrollment: ProgramEnrollmentWithUser) => {
    const { user } = enrollment
    return user.displayName || user.username || user.email || 'Unknown User'
  }

  const getUserInitials = (enrollment: ProgramEnrollmentWithUser) => {
    const { user } = enrollment
    const name = user.displayName || user.username || user.email || 'UN'
    return name.slice(0, 2).toUpperCase()
  }

  if (enrollments.length === 0) {
    return (
      <div className="rounded-lg border py-12 text-center">
        <p className="text-muted-foreground">No enrollments yet</p>
        <p className="text-sm text-muted-foreground">
          Click &quot;Enroll Student&quot; to add your first student
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.map((enrollment) => (
              <TableRow key={enrollment.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={enrollment.user.avatarUrl || undefined}
                      />
                      <AvatarFallback>
                        {getUserInitials(enrollment)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {getUserDisplayName(enrollment)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{enrollment.user.username}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {enrollment.user.email || '—'}
                </TableCell>
                <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(enrollment.enrolledAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEdit(enrollment)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Enrollment
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(enrollment.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Enrollment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {selectedEnrollment && (
        <EnrollmentFormDialog
          programId={programId}
          enrollment={selectedEnrollment}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this enrollment. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
