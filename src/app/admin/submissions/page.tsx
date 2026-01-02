'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminRoute } from '@/components/layout/admin-route-wrapper'

interface Submission {
  submission: {
    id: string
    activityId: string
    userId: string
    submissionUrl: string | null
    submissionText: string | null
    status: string
    submittedAt: string
    rewardPulpaAmount: string
  }
  activity: {
    id: string
    title: string
    activityType: string
    rewardPulpaAmount: string
  }
  user: {
    id: string
    username: string | null
    email: string
    appWallet: string | null
  }
}

function AdminSubmissionsPageContent() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchSubmissions()
  }, [filter])

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status: filter })
      const response = await fetch(
        `/api/admin/submissions?${params.toString()}`,
      )

      if (!response.ok) throw new Error('Failed to fetch submissions')

      const result = await response.json()
      setSubmissions(result.data.submissions)
    } catch (error) {
      alert(
        error instanceof Error ? error.message : 'Failed to fetch submissions',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (submissionId: string) => {
    if (!reviewNotes && !confirm('No review notes provided. Continue?')) return

    setActionLoading(true)
    try {
      const response = await fetch(
        `/api/admin/submissions/${submissionId}/approve`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            review_notes: reviewNotes || undefined,
          }),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to approve submission')
      }

      alert('Submission approved successfully!')
      setSelectedSubmission(null)
      setReviewNotes('')
      fetchSubmissions()
    } catch (error) {
      alert(
        error instanceof Error ? error.message : 'Failed to approve submission',
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (submissionId: string) => {
    if (!reviewNotes) {
      alert('Please provide a reason for rejection')
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch(
        `/api/admin/submissions/${submissionId}/reject`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            review_notes: reviewNotes,
          }),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to reject submission')
      }

      alert('Submission rejected')
      setSelectedSubmission(null)
      setReviewNotes('')
      fetchSubmissions()
    } catch (error) {
      alert(
        error instanceof Error ? error.message : 'Failed to reject submission',
      )
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      pending: 'outline',
      under_review: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      distributed: 'default',
    }
    return (
      <Badge variant={variants[status] || 'default'}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  return (
    <div className="page-content space-y-6">
      <div className="mb-6 w-full">
        <h1 className="text-3xl font-bold tracking-tight">Submission Review</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Review and approve user submissions for $PULPA token rewards
        </p>
      </div>

      {/* Filter */}
      <Card className="mb-6 w-full">
        <CardHeader>
          <CardTitle>Filter by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="distributed">Distributed</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card className="w-full">
        <CardContent className="pt-6">
          {loading ? (
            <div className="py-8 text-center">Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No submissions found with status: {filter}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Submission</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((item) => (
                  <TableRow key={item.submission.id}>
                    <TableCell className="max-w-xs truncate font-medium">
                      {item.activity.title}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {item.user.username || 'Anonymous'}
                        </span>
                        <span className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {item.user.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.submission.submissionUrl && (
                        <a
                          href={item.submission.submissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Link
                        </a>
                      )}
                      {item.submission.submissionText && (
                        <p className="max-w-xs truncate text-sm">
                          {item.submission.submissionText}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.submission.rewardPulpaAmount} $PULPA
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.submission.status)}
                    </TableCell>
                    <TableCell>
                      {new Date(
                        item.submission.submittedAt,
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSubmission(item)}
                        disabled={item.submission.status !== 'pending'}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      {selectedSubmission && (
        <Dialog
          open={!!selectedSubmission}
          onOpenChange={() => setSelectedSubmission(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Submission</DialogTitle>
              <DialogDescription>
                Review and approve or reject this submission
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold">Activity</h3>
                <p>{selectedSubmission.activity.title}</p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">User</h3>
                <p>
                  {selectedSubmission.user.username ||
                    selectedSubmission.user.email}
                </p>
                {selectedSubmission.user.appWallet && (
                  <p className="truncate text-sm text-muted-foreground">
                    Wallet: {selectedSubmission.user.appWallet}
                  </p>
                )}
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Submission Details</h3>
                {selectedSubmission.submission.submissionUrl && (
                  <div className="mb-2">
                    <span className="text-sm font-medium">URL: </span>
                    <a
                      href={selectedSubmission.submission.submissionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-blue-600 hover:underline"
                    >
                      {selectedSubmission.submission.submissionUrl}
                    </a>
                  </div>
                )}
                {selectedSubmission.submission.submissionText && (
                  <div>
                    <span className="text-sm font-medium">Description: </span>
                    <p className="mt-1 text-sm">
                      {selectedSubmission.submission.submissionText}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Reward Amount</h3>
                <p>{selectedSubmission.submission.rewardPulpaAmount} $PULPA</p>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Review Notes (optional for approval, required for rejection)
                </label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about this submission..."
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedSubmission(null)
                  setReviewNotes('')
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReject(selectedSubmission.submission.id)}
                disabled={actionLoading}
              >
                {actionLoading ? 'Rejecting...' : 'Reject'}
              </Button>
              <Button
                onClick={() => handleApprove(selectedSubmission.submission.id)}
                disabled={actionLoading}
              >
                {actionLoading ? 'Approving...' : 'Approve'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default function AdminSubmissionsPage() {
  return (
    <AdminRoute>
      <AdminSubmissionsPageContent />
    </AdminRoute>
  )
}
