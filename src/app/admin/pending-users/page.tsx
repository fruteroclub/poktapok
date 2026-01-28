'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { usePendingUsers } from '@/hooks/use-admin'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useApproveUser, useRejectUser } from '@/hooks/use-admin'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

/**
 * Admin Pending Users Page
 *
 * Lists all users with accountStatus === 'pending' for review.
 * Admins can approve or reject users.
 */
export default function PendingUsersPage() {
  const router = useRouter()
  const { data: authData, isLoading: authLoading } = useAuth()
  const {
    data: pendingData,
    isLoading: pendingLoading,
    error,
  } = usePendingUsers()
  const approveMutation = useApproveUser()
  const rejectMutation = useRejectUser()

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && authData) {
      if (authData.user?.role !== 'admin') {
        router.push('/dashboard')
      }
    }
  }, [authData, authLoading, router])

  // Loading state
  if (authLoading || pendingLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Not authenticated or not admin - will redirect
  if (!authData || authData.user?.role !== 'admin') {
    return null
  }

  // Error state
  if (error) {
    return (
      <div className="page-content">
        <div className="header-section">
          <h1 className="text-3xl font-bold tracking-tight">Pending Users</h1>
          <p className="text-destructive">Failed to load pending users</p>
        </div>
      </div>
    )
  }

  const pendingUsers = pendingData?.pendingUsers || []

  const handleApprove = async (userId: string, displayName: string | null) => {
    try {
      await approveMutation.mutateAsync(userId)
      toast.success(`Approved ${displayName || 'user'}`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to approve user'
      toast.error(message)
      console.error('Failed to approve user:', error)
    }
  }

  const handleReject = async (userId: string, displayName: string | null) => {
    try {
      await rejectMutation.mutateAsync(userId)
      toast.success(`Rejected ${displayName || 'user'}`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to reject user'
      toast.error(message)
      console.error('Failed to reject user:', error)
    }
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div className="admin-header-section">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Users</h1>
          <p className="text-muted-foreground">
            Review and approve user applications
          </p>
        </div>
        <div>
          <Badge variant="secondary">
            {pendingUsers.length} {pendingUsers.length === 1 ? 'user' : 'users'}{' '}
            awaiting review
          </Badge>
        </div>
      </div>

      {/* Stats */}

      {/* User Cards */}
      {pendingUsers.length === 0 ? (
        <Card>
          <CardContent className="flex w-full items-center justify-center py-12">
            <p className="text-muted-foreground">No pending users to review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid w-full gap-4 md:grid-cols-2">
          {pendingUsers.map(({ user, profile }) => {
            const isProcessing =
              approveMutation.isPending || rejectMutation.isPending

            return (
              <Card key={user.id} className="gap-y-2">
                <CardHeader className="pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatarUrl || undefined} />
                        <AvatarFallback>
                          {user.displayName?.charAt(0)?.toUpperCase() ||
                            user.username?.charAt(0)?.toUpperCase() ||
                            '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {user.displayName || user.username || 'Anonymous'}
                        </CardTitle>
                        {user.username && (
                          <p className="text-sm text-muted-foreground">
                            @{user.username}
                          </p>
                        )}
                        {user.email && (
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {user.bio && (
                  <CardContent>
                    <p className="text-sm">{user.bio}</p>
                  </CardContent>
                )}
                {profile && (
                  <CardContent className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {profile.city && profile.country && (
                        <div>
                          <p className="font-medium">Location</p>
                          <p className="text-muted-foreground">
                            {profile.city}, {profile.country}
                          </p>
                        </div>
                      )}
                      {profile.learningTracks &&
                        profile.learningTracks.length > 0 && (
                          <div>
                            <p className="font-medium">Learning Tracks</p>
                            <p className="text-muted-foreground">
                              {profile.learningTracks.join(', ')}
                            </p>
                          </div>
                        )}
                      {profile.socialLinks && (
                        <div className="col-span-2">
                          <p className="font-medium">Social Links</p>
                          <div className="flex flex-wrap gap-3">
                            {profile.socialLinks.github && (
                              <a
                                href={`https://github.com/${profile.socialLinks.github}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline"
                              >
                                GitHub
                              </a>
                            )}
                            {profile.socialLinks.twitter && (
                              <a
                                href={`https://twitter.com/${profile.socialLinks.twitter.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline"
                              >
                                Twitter
                              </a>
                            )}
                            {profile.socialLinks.linkedin && (
                              <a
                                href={`https://linkedin.com/in/${profile.socialLinks.linkedin}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline"
                              >
                                LinkedIn
                              </a>
                            )}
                            {profile.socialLinks.telegram && (
                              <a
                                href={`https://t.me/${profile.socialLinks.telegram.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline"
                              >
                                Telegram
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
                <CardFooter className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(user.id, user.displayName)}
                    disabled={isProcessing}
                  >
                    {rejectMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Reject'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(user.id, user.displayName)}
                    disabled={isProcessing}
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Approve'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
