'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  useUserDetails,
  useUpdateUserRole,
  useUpdateUserStatus,
} from '@/hooks/use-user-management'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, ArrowLeft, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Section } from '@/components/layout/section'

/**
 * Helper function to get Badge variant for user role
 */
function getRoleVariant(
  role: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (role) {
    case 'admin':
      return 'default'
    case 'moderator':
      return 'secondary'
    default:
      return 'outline'
  }
}

/**
 * Helper function to get Badge variant for account status
 */
function getStatusVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active':
      return 'default'
    case 'pending':
      return 'secondary'
    case 'suspended':
    case 'banned':
      return 'destructive'
    default:
      return 'outline'
  }
}

/**
 * User Detail Page
 *
 * Displays detailed information about a specific user with management actions
 */
export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { data: authData } = useAuth()

  // Unwrap params Promise (Next.js 16 requirement)
  const unwrappedParams = use(params)
  const { data, isLoading, error } = useUserDetails(unwrappedParams.id)
  const updateRoleMutation = useUpdateUserRole()
  const updateStatusMutation = useUpdateUserStatus()

  // Dialog states
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false)
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false)

  // Form states
  const [selectedRole, setSelectedRole] = useState<string>('member')
  const [reason, setReason] = useState('')

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <div className="page-content">
        <div className="header-section">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </div>
        <div className="py-8 text-center text-destructive">
          Failed to load user details. User may not exist or you don&apos;t have
          permission.
        </div>
      </div>
    )
  }

  const { user } = data
  const currentUser = authData?.user
  const isOwnAccount = currentUser?.id === user.id

  // Handle role change
  const handleRoleChange = async () => {
    try {
      await updateRoleMutation.mutateAsync({
        userId: user.id,
        role: selectedRole as 'member' | 'moderator' | 'admin',
        reason: reason || undefined,
      })
      toast.success(`Role changed to ${selectedRole}`)
      setIsRoleDialogOpen(false)
      setReason('')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to change role'
      toast.error(message)
      console.error('Failed to change role:', err)
    }
  }

  // Handle suspend
  const handleSuspend = async () => {
    if (!reason.trim()) {
      toast.error('Reason is required for suspending users')
      return
    }

    try {
      await updateStatusMutation.mutateAsync({
        userId: user.id,
        accountStatus: 'suspended',
        reason,
      })
      toast.success('User suspended successfully')
      setIsSuspendDialogOpen(false)
      setReason('')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to suspend user'
      toast.error(message)
      console.error('Failed to suspend user:', err)
    }
  }

  // Handle ban
  const handleBan = async () => {
    if (!reason.trim()) {
      toast.error('Reason is required for banning users')
      return
    }

    try {
      await updateStatusMutation.mutateAsync({
        userId: user.id,
        accountStatus: 'banned',
        reason,
      })
      toast.success('User banned successfully')
      setIsBanDialogOpen(false)
      setReason('')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to ban user'
      toast.error(message)
      console.error('Failed to ban user:', err)
    }
  }

  // Handle reactivate
  const handleReactivate = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        userId: user.id,
        accountStatus: 'active',
      })
      toast.success('User reactivated successfully')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to reactivate user'
      toast.error(message)
      console.error('Failed to reactivate user:', err)
    }
  }

  return (
    <div className="page-content">
      {/* Back Button */}
      <div className="header-section">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>
      <Section className="gap-2">
        {/* User Profile Card */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback>
                  {user.displayName?.charAt(0)?.toUpperCase() ||
                    user.username?.charAt(0)?.toUpperCase() ||
                    '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl">
                  {user.displayName || user.username || 'Anonymous'}
                </CardTitle>
                {user.username && (
                  <p className="text-lg text-muted-foreground">
                    @{user.username}
                  </p>
                )}
                {user.email && (
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
                  <Badge variant={getStatusVariant(user.accountStatus)}>
                    {user.accountStatus}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid w-full grid-cols-2 gap-2 lg:grid-cols-4">
          <Card className="gap-0 py-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.stats.totalEarnings} $PULPA
              </div>
            </CardContent>
          </Card>
          <Card className="gap-0 py-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.stats.submissionsCount}
              </div>
              <p className="text-xs text-muted-foreground">
                {user.stats.approvedCount} approved • {user.stats.pendingCount}{' '}
                pending • {user.stats.rejectedCount} rejected
              </p>
            </CardContent>
          </Card>
          <Card className="gap-0 py-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.stats.activitiesCompleted}
              </div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card className="gap-0 py-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.stats.submissionsCount > 0
                  ? Math.round(
                      (user.stats.approvedCount / user.stats.submissionsCount) *
                        100,
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">Approval rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Information */}

        <Card className="w-full gap-2 py-4">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            {user.profile ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                {user.profile.bio && (
                  <div className="col-span-2">
                    <p className="font-medium">Bio</p>
                    <p className="text-muted-foreground">{user.profile.bio}</p>
                  </div>
                )}
                {user.profile.city && user.profile.country && (
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">
                      {user.profile.city}, {user.profile.country}
                    </p>
                  </div>
                )}
                {user.profile.timezone && (
                  <div>
                    <p className="font-medium">Timezone</p>
                    <p className="text-muted-foreground">
                      {user.profile.timezone}
                    </p>
                  </div>
                )}
                {user.profile.learningTracks &&
                  user.profile.learningTracks.length > 0 && (
                    <div className="col-span-2">
                      <p className="font-medium">Learning Tracks</p>
                      <p className="text-muted-foreground">
                        {user.profile.learningTracks.join(', ')}
                      </p>
                    </div>
                  )}
                {(user.profile.githubUrl ||
                  user.profile.linkedinUrl ||
                  user.profile.twitterUrl ||
                  user.profile.telegramUrl ||
                  user.profile.websiteUrl) && (
                  <div className="col-span-2">
                    <p className="font-medium">Social Links</p>
                    <div className="flex flex-wrap gap-3">
                      {user.profile.githubUrl && (
                        <a
                          href={user.profile.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          GitHub
                        </a>
                      )}
                      {user.profile.twitterUrl && (
                        <a
                          href={user.profile.twitterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Twitter
                        </a>
                      )}
                      {user.profile.linkedinUrl && (
                        <a
                          href={user.profile.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          LinkedIn
                        </a>
                      )}
                      {user.profile.telegramUrl && (
                        <a
                          href={user.profile.telegramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Telegram
                        </a>
                      )}
                      {user.profile.websiteUrl && (
                        <a
                          href={user.profile.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                No profile information available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card className="w-full gap-2 py-4">
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {user.recentSubmissions.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No submissions yet
              </p>
            ) : (
              <div className="space-y-2">
                {user.recentSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{submission.activityTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {submission.rewardPulpaAmount && (
                        <span className="text-sm">
                          {submission.rewardPulpaAmount} $PULPA
                        </span>
                      )}
                      <Badge variant={getStatusVariant(submission.status)}>
                        {submission.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="w-full gap-2 py-4">
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRole(user.role)
                  setIsRoleDialogOpen(true)
                }}
                disabled={isOwnAccount || user.role === 'admin'}
              >
                Change Role
              </Button>
              {user.accountStatus === 'active' ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsSuspendDialogOpen(true)}
                    disabled={isOwnAccount || user.role === 'admin'}
                  >
                    Suspend Account
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setIsBanDialogOpen(true)}
                    disabled={isOwnAccount || user.role === 'admin'}
                  >
                    Ban User
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleReactivate}
                  disabled={isOwnAccount}
                >
                  Reactivate Account
                </Button>
              )}
            </div>
            {isOwnAccount && (
              <p className="text-sm text-muted-foreground">
                You cannot modify your own account
              </p>
            )}
            {user.role === 'admin' && !isOwnAccount && (
              <p className="text-sm text-muted-foreground">
                Cannot modify other admin accounts
              </p>
            )}
          </CardContent>
        </Card>

        {/* Role Change Dialog */}
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
              <DialogDescription>
                Update the role for {user.displayName || user.username}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">New Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason (optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Why are you changing this user's role?"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsRoleDialogOpen(false)
                  setReason('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRoleChange}
                disabled={updateRoleMutation.isPending}
              >
                {updateRoleMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Change Role'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Suspend Dialog */}
        <Dialog
          open={isSuspendDialogOpen}
          onOpenChange={setIsSuspendDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend User</DialogTitle>
              <DialogDescription>
                Suspend {user.displayName || user.username}. They will not be
                able to access their account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="suspend-reason">Reason (required)</Label>
                <Textarea
                  id="suspend-reason"
                  placeholder="Why are you suspending this user?"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSuspendDialogOpen(false)
                  setReason('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleSuspend}
                disabled={updateStatusMutation.isPending || !reason.trim()}
              >
                {updateStatusMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Suspending...
                  </>
                ) : (
                  'Suspend User'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ban Dialog */}
        <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <DialogTitle>Ban User - Permanent Action</DialogTitle>
              </div>
              <DialogDescription>
                Permanently ban {user.displayName || user.username}. This is a
                severe action that should only be taken for serious violations.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ban-reason">Reason (required)</Label>
                <Textarea
                  id="ban-reason"
                  placeholder="Why are you banning this user?"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsBanDialogOpen(false)
                  setReason('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBan}
                disabled={updateStatusMutation.isPending || !reason.trim()}
              >
                {updateStatusMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Banning...
                  </>
                ) : (
                  'Ban User'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>
    </div>
  )
}
