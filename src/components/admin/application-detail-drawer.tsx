'use client'

import { useState } from 'react'
import { useApplicationDetail, useApproveApplication } from '@/hooks/use-admin'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Loader2,
  CheckCircle,
  XCircle,
  UserCheck,
  Github,
  Twitter,
} from 'lucide-react'
import { toast } from 'sonner'
import { AccountStatusBadge } from '@/components/common/account-status-badge'
import type { AccountStatus } from '@/types/api-v1'
import { formatDistanceToNow } from 'date-fns'

interface ApplicationDetailDrawerProps {
  applicationId: string
  open: boolean
  onClose: () => void
}

export function ApplicationDetailDrawer({
  applicationId,
  open,
  onClose,
}: ApplicationDetailDrawerProps) {
  const [reviewNotes, setReviewNotes] = useState('')

  const { data, isLoading } = useApplicationDetail(applicationId)
  const approveMutation = useApproveApplication()

  const handleApprove = async (
    decision: 'approve_guest' | 'approve_member' | 'reject',
  ) => {
    try {
      await approveMutation.mutateAsync({
        applicationId,
        data: { decision, reviewNotes },
      })
      toast.success('Application processed successfully')
      onClose()
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  if (!data) {
    return null
  }

  const { application, user, profile, program, reviewer } = data
  const isPending = application.status === 'pending'

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Application Review</SheetTitle>
          <SheetDescription>
            Review and process this program application
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Applicant Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Applicant</h3>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={user.avatarUrl || undefined}
                  alt={user.displayName || user.username || ''}
                />
                <AvatarFallback>
                  {(user.displayName || user.username || 'U')
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <p className="font-medium">
                  {user.displayName || user.username}
                </p>
                {user.username && (
                  <p className="text-sm text-muted-foreground">
                    @{user.username}
                  </p>
                )}
                {user.email && (
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Account Status:
              </span>
              <AccountStatusBadge
                status={user.accountStatus as AccountStatus}
              />
            </div>
          </div>

          {/* Location */}
          {profile && (profile.city || profile.country) && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Location</h3>
              <p className="text-sm">
                {[profile.city, profile.country].filter(Boolean).join(', ')}
              </p>
            </div>
          )}

          {/* Program */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Program</h3>
            <p className="text-sm font-medium">{program.name}</p>
            {program.description && (
              <p className="text-sm text-muted-foreground">
                {program.description}
              </p>
            )}
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Goal</h3>
            <p className="text-sm">{application.goal}</p>
          </div>

          {/* Social Accounts */}
          {(application.githubUsername || application.twitterUsername) && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Social Accounts</h3>
              <div className="space-y-2">
                {application.githubUsername && (
                  <div className="flex items-center gap-2 text-sm">
                    <Github className="h-4 w-4" />
                    <a
                      href={`https://github.com/${application.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      @{application.githubUsername}
                    </a>
                  </div>
                )}
                {application.twitterUsername && (
                  <div className="flex items-center gap-2 text-sm">
                    <Twitter className="h-4 w-4" />
                    <a
                      href={`https://twitter.com/${application.twitterUsername.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      @{application.twitterUsername.replace('@', '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Application Metadata */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Application Details</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                Submitted:{' '}
                {formatDistanceToNow(new Date(application.createdAt), {
                  addSuffix: true,
                })}
              </p>
              {application.reviewedAt && (
                <p>
                  Reviewed:{' '}
                  {formatDistanceToNow(new Date(application.reviewedAt), {
                    addSuffix: true,
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Review Section */}
          {isPending && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Review Notes</h3>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes about this review (optional)..."
                rows={4}
              />
            </div>
          )}

          {/* Actions */}
          {isPending && (
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => handleApprove('approve_member')}
                disabled={approveMutation.isPending}
                className="w-full"
              >
                {approveMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Approve as Member
              </Button>
              <Button
                onClick={() => handleApprove('approve_guest')}
                disabled={approveMutation.isPending}
                variant="outline"
                className="w-full"
              >
                {approveMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserCheck className="mr-2 h-4 w-4" />
                )}
                Approve as Guest
              </Button>
              <Button
                onClick={() => handleApprove('reject')}
                disabled={approveMutation.isPending}
                variant="destructive"
                className="w-full"
              >
                {approveMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Reject
              </Button>
            </div>
          )}

          {/* Already Reviewed */}
          {!isPending && (
            <div className="space-y-2 rounded-lg border bg-muted p-4">
              <p className="text-sm font-medium">Application Processed</p>
              <p className="text-sm text-muted-foreground">
                This application was reviewed on{' '}
                {new Date(application.reviewedAt!).toLocaleDateString()}
                {reviewer && ` by ${reviewer.displayName || reviewer.username}`}
              </p>
              {application.reviewNotes && (
                <div>
                  <p className="text-sm font-medium">Review Notes:</p>
                  <p className="text-sm text-muted-foreground">
                    {application.reviewNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
