'use client'

import { useState } from 'react'
import { useMarkAttendance } from '@/hooks/use-attendance'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { UserWithAttendance, AttendanceStatus } from '@/types/api-v1'

interface AttendanceMarkerProps {
  sessionId: string
  users: UserWithAttendance[]
}

export function AttendanceMarker({ sessionId, users }: AttendanceMarkerProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set())
  const markAttendanceMutation = useMarkAttendance()

  const handleToggleUser = (userId: string) => {
    const newSet = new Set(selectedUserIds)
    if (newSet.has(userId)) {
      newSet.delete(userId)
    } else {
      newSet.add(userId)
    }
    setSelectedUserIds(newSet)
  }

  const handleToggleAll = () => {
    if (selectedUserIds.size === users.length) {
      setSelectedUserIds(new Set())
    } else {
      setSelectedUserIds(new Set(users.map((u) => u.user.id)))
    }
  }

  const handleMarkAttendance = async (status: AttendanceStatus) => {
    if (selectedUserIds.size === 0) return

    try {
      await markAttendanceMutation.mutateAsync({
        sessionId,
        userIds: Array.from(selectedUserIds),
        status,
      })
      toast.success(
        `Marked ${selectedUserIds.size} user${selectedUserIds.size > 1 ? 's' : ''} as ${status}`,
      )
      setSelectedUserIds(new Set())
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  const getAttendanceStatusBadge = (status: AttendanceStatus | null) => {
    if (!status) return null

    const config = {
      present: {
        label: 'Present',
        icon: CheckCircle2,
        variant: 'default' as const,
      },
      absent: {
        label: 'Absent',
        icon: XCircle,
        variant: 'destructive' as const,
      },
      excused: {
        label: 'Excused',
        icon: Clock,
        variant: 'secondary' as const,
      },
    }

    const statusConfig = config[status]
    const Icon = statusConfig.icon

    return (
      <Badge variant={statusConfig.variant} className="gap-1.5">
        <Icon className="h-3.5 w-3.5" />
        {statusConfig.label}
      </Badge>
    )
  }

  const allSelected = selectedUserIds.size === users.length && users.length > 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={allSelected}
            onCheckedChange={handleToggleAll}
            disabled={users.length === 0}
          />
          <h3 className="font-semibold">
            Mark Attendance ({selectedUserIds.size} selected)
          </h3>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleMarkAttendance('present')}
            disabled={
              selectedUserIds.size === 0 || markAttendanceMutation.isPending
            }
            size="sm"
          >
            {markAttendanceMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Present
          </Button>
          <Button
            onClick={() => handleMarkAttendance('absent')}
            disabled={
              selectedUserIds.size === 0 || markAttendanceMutation.isPending
            }
            variant="outline"
            size="sm"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Absent
          </Button>
          <Button
            onClick={() => handleMarkAttendance('excused')}
            disabled={
              selectedUserIds.size === 0 || markAttendanceMutation.isPending
            }
            variant="outline"
            size="sm"
          >
            <Clock className="mr-2 h-4 w-4" />
            Excused
          </Button>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No enrolled users found for this session.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map(({ user, profile, attendance }) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedUserIds.has(user.id)}
                  onCheckedChange={() => handleToggleUser(user.id)}
                />
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={profile?.avatarUrl || undefined}
                    alt={profile?.displayName || user.username || ''}
                  />
                  <AvatarFallback>
                    {(profile?.displayName || user.username || 'U')
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {profile?.displayName || user.username || 'Unknown'}
                  </span>
                  {user.email && (
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  )}
                </div>
              </div>
              <div>
                {attendance
                  ? getAttendanceStatusBadge(attendance.status)
                  : getAttendanceStatusBadge(null)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
