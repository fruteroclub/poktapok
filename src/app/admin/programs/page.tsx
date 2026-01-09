'use client'

import { useState } from 'react'
import { useAllPrograms, useDeleteProgram } from '@/hooks/use-admin'
import { Button } from '@/components/ui/button'
import { ProgramsTable } from '@/components/admin/programs-table'
import { ProgramFormDialog } from '@/components/admin/program-form-dialog'
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
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function ProgramsManagementPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null)
  const [deletingProgramId, setDeletingProgramId] = useState<string | null>(
    null,
  )

  const { data, isLoading } = useAllPrograms()
  const deleteMutation = useDeleteProgram()

  const handleEdit = (programId: string) => {
    setEditingProgramId(programId)
  }

  const handleDelete = (programId: string) => {
    setDeletingProgramId(programId)
  }

  const confirmDelete = async () => {
    if (!deletingProgramId) return

    try {
      await deleteMutation.mutateAsync(deletingProgramId)
      toast.success('Program deleted successfully')
      setDeletingProgramId(null)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  const deletingProgram = data?.programs.find((p) => p.id === deletingProgramId)

  return (
    <div className="page-content">
      {/* Header */}
      <div className="header-section">
        <h1 className="text-3xl font-bold">Programs Management</h1>
        <p className="mt-1 text-muted-foreground">
          Create and manage programs for your platform
        </p>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Program
        </Button>
      </div>
      <div className="w-full">
        {/* Programs Table */}
        <ProgramsTable
          programs={data?.programs || []}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Create/Edit Dialog */}
      <ProgramFormDialog
        open={isCreateDialogOpen || !!editingProgramId}
        onClose={() => {
          setIsCreateDialogOpen(false)
          setEditingProgramId(null)
        }}
        programId={editingProgramId}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingProgramId}
        onOpenChange={() => setDeletingProgramId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Program</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{deletingProgram?.name}</strong>? This will set the
              program as inactive and hide it from users. This action can be
              reversed by editing the program and setting it to active again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              Delete Program
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
