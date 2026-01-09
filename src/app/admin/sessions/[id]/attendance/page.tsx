'use client'

import { use } from 'react'
import Link from 'next/link'
import { useSessionAttendance } from '@/hooks/use-attendance'
import { AttendanceMarker } from '@/components/admin/attendance-marker'
import PageWrapper from '@/components/layout/page-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Calendar, Users, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function SessionAttendancePage({ params }: PageProps) {
  const resolvedParams = use(params)
  const sessionId = resolvedParams.id

  const { data, isLoading } = useSessionAttendance(sessionId)

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageWrapper>
    )
  }

  if (!data) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">Session not found.</p>
          <Button asChild className="mt-4">
            <Link href="/admin/sessions">Back to Sessions</Link>
          </Button>
        </div>
      </PageWrapper>
    )
  }

  const { session, users } = data

  // Calculate attendance statistics
  const stats = users.reduce(
    (acc, { attendance }) => {
      if (!attendance) return acc
      if (attendance.status === 'present') acc.present++
      if (attendance.status === 'absent') acc.absent++
      if (attendance.status === 'excused') acc.excused++
      return acc
    },
    { present: 0, absent: 0, excused: 0 },
  )

  const totalMarked = stats.present + stats.absent + stats.excused
  const unmarked = users.length - totalMarked

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/sessions">Sessions</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/admin/sessions/${sessionId}`}>{session.title}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Attendance</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mark Attendance</h1>
          <p className="text-muted-foreground">{session.title}</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDistanceToNow(new Date(session.sessionDate), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Enrolled
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.present}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.absent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Excused</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.excused}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unmarked</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unmarked}</div>
          </CardContent>
        </Card>
      </div>

        {/* Attendance Marking */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceMarker sessionId={sessionId} users={users} />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}
