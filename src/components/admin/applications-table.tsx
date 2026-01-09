'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, CheckCircle, XCircle } from 'lucide-react'
import type { ApplicationListItem } from '@/types/api-v1'
import { formatDistanceToNow } from 'date-fns'

interface ApplicationsTableProps {
  applications: ApplicationListItem[]
  isLoading: boolean
  onSelectApplication: (applicationId: string) => void
}

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock,
    variant: 'outline' as const,
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    variant: 'default' as const,
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    variant: 'destructive' as const,
  },
}

export function ApplicationsTable({
  applications,
  isLoading,
  onSelectApplication,
}: ApplicationsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No applications found matching the selected filters.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead>Program</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead>Account Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map(({ application, user, profile, program }) => {
            const status = application.status
            const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
            const Icon = config?.icon

            return (
              <TableRow
                key={application.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSelectApplication(application.id)}
              >
                {/* Applicant */}
                <TableCell>
                  <div className="flex items-center gap-3">
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
                </TableCell>

                {/* Program */}
                <TableCell>
                  <span className="text-sm">{program?.name || 'N/A'}</span>
                </TableCell>

                {/* Status */}
                <TableCell>
                  {config && (
                    <Badge variant={config.variant} className="gap-1.5">
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                      {config.label}
                    </Badge>
                  )}
                </TableCell>

                {/* Applied Date */}
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(application.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </TableCell>

                {/* Account Status */}
                <TableCell>
                  <Badge variant="secondary">{user.accountStatus}</Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
