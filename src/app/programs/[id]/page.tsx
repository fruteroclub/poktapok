'use client'

import { useParams } from 'next/navigation'
import { useProgramDashboard, useProgramSessions } from '@/hooks/use-programs'
import { AccountStatusBadge } from '@/components/common/account-status-badge'
import { ParticipationStatsCard } from '@/components/programs/participation-stats-card'
import { PromotionProgressCard } from '@/components/programs/promotion-progress-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Calendar,
  MapPin,
  Video,
  Target,
  CalendarDays,
  Users,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import type { AccountStatus } from '@/types/api-v1'

export default function ProgramDashboardPage() {
  const params = useParams()
  const programId = params.id as string

  const { data, isLoading } = useProgramDashboard(programId)
  const { data: sessionsData } = useProgramSessions(programId, true)

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 py-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">Program not found.</p>
        </div>
      </div>
    )
  }

  const { enrollment, application, program, user, stats } = data
  const isGuest = user.accountStatus === 'guest'

  return (
    <div className="container mx-auto space-y-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{program.name}</h1>
          {program.description && (
            <p className="mt-2 text-muted-foreground">{program.description}</p>
          )}
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="capitalize">{program.programType}</span>
            </div>
            {program.startDate && (
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                <span>
                  Started {format(new Date(program.startDate), 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </div>
        </div>
        <AccountStatusBadge status={user.accountStatus as AccountStatus} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Goal Card */}
        {application && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Your Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{application.goal}</p>
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="outline">
                  Enrolled{' '}
                  {formatDistanceToNow(new Date(enrollment.enrolledAt), {
                    addSuffix: true,
                  })}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Participation Stats */}
        <ParticipationStatsCard stats={stats} />

        {/* Promotion Progress (Guest only) */}
        {isGuest && <PromotionProgressCard stats={stats} />}

        {/* Upcoming Sessions */}
        {sessionsData && sessionsData.sessions.length > 0 && (
          <Card className={isGuest ? 'md:col-span-2' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessionsData.sessions.slice(0, 3).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{session.title}</h4>
                      {session.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {session.description}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {format(
                              new Date(session.sessionDate),
                              'MMM d, h:mm a',
                            )}
                          </span>
                        </div>
                        {session.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{session.location}</span>
                          </div>
                        )}
                        {session.meetingUrl && (
                          <div className="flex items-center gap-1">
                            <Video className="h-3.5 w-3.5" />
                            <a
                              href={session.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Join Meeting
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
