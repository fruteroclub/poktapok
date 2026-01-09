'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useAllSessions,
  useDeleteSession,
} from '@/hooks/use-admin'
import { SessionsTable } from '@/components/admin/sessions-table'
import { SessionFormDialog } from '@/components/admin/session-form-dialog'
import PageWrapper from '@/components/layout/page-wrapper'
import { Button } from '@/components/ui/button'
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
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

export default function SessionsPage() {
  const router = useRouter()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)

  // Fetch all sessions
  const { data, isLoading } = useAllSessions()
  const deleteMutation = useDeleteSession()

  const handleCreateClick = () => {
    setEditingSessionId(null)
    setIsFormOpen(true)
  }

  const handleEdit = (sessionId: string) => {
    setEditingSessionId(sessionId)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (sessionId: string) => {
    setSessionToDelete(sessionId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return

    try {
      await deleteMutation.mutateAsync(sessionToDelete)
      toast.success('Session deleted successfully')
      setDeleteDialogOpen(false)
      setSessionToDelete(null)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  const handleView = (sessionId: string) => {
    router.push(`/admin/sessions/${sessionId}`)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingSessionId(null)
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Sessions Management
            </h1>
            <p className="text-muted-foreground">
              Manage sessions across all programs
            </p>
          </div>
          <Button onClick={handleCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            Create Session
          </Button>
        </div>

        {/* Sessions Table */}
        <SessionsTable
          sessions={data?.sessions || []}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onView={handleView}
        />

        {/* Form Dialog */}
        <SessionFormDialog
          open={isFormOpen}
          onClose={handleFormClose}
          sessionId={editingSessionId}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Session</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this session? This action cannot
                be undone. All linked activities will be unlinked.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageWrapper>
  )
}
