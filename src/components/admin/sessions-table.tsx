'use client'

import { SessionWithActivityCount } from '@/types/api-v1'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Edit, Trash2, Eye } from 'lucide-react'
import { format } from 'date-fns'

interface SessionsTableProps {
  sessions: SessionWithActivityCount[]
  isLoading: boolean
  onEdit: (sessionId: string) => void
  onDelete: (sessionId: string) => void
  onView: (sessionId: string) => void
}

export function SessionsTable({
  sessions,
  isLoading,
  onEdit,
  onDelete,
  onView,
}: SessionsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No sessions found. Create your first session to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  const getSessionTypeVariant = (type: string) => {
    switch (type) {
      case 'in-person':
        return 'default' // blue
      case 'virtual':
        return 'secondary' // green
      case 'hybrid':
        return 'outline' // purple
      default:
        return 'secondary'
    }
  }

  const formatSessionType = (type: string) => {
    switch (type) {
      case 'in-person':
        return 'In-Person'
      case 'virtual':
        return 'Virtual'
      case 'hybrid':
        return 'Hybrid'
      default:
        return type
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Activities</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className="font-medium">{session.title}</div>
                    {session.description && (
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {session.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">{session.programId}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div>
                        {format(new Date(session.sessionDate), 'MMM d, yyyy')}
                      </div>
                      <div className="text-muted-foreground">
                        {format(new Date(session.sessionDate), 'h:mm a')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSessionTypeVariant(session.sessionType)}>
                      {formatSessionType(session.sessionType)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-center">
                      {session.activityCount || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-center">
                      {session.attendanceCount || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(session.id)}
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(session.id)}
                        title="Edit session"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(session.id)}
                        className="text-destructive hover:text-destructive"
                        title="Delete session"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
