'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '@/hooks/use-admin'
import { SessionFormDialog } from '@/components/admin/session-form-dialog'
import { SessionActivitiesManager } from '@/components/admin/session-activities-manager'
import PageWrapper from '@/components/layout/page-wrapper'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { format } from 'date-fns'
import { Calendar, Clock, MapPin, BookOpen, Users } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function SessionDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const sessionId = resolvedParams.id
  const router = useRouter()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { data, isLoading } = useSession(sessionId)
  const session = data?.session

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageWrapper>
    )
  }

  if (!session) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Session not found</p>
          <Button onClick={() => router.push('/admin/sessions')} className="mt-4">
            Back to Sessions
          </Button>
        </div>
      </PageWrapper>
    )
  }

  const sessionTypeColors = {
    'in-person': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    virtual: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    hybrid: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  }

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
              <BreadcrumbPage>{session.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {session.title}
              </h1>
              <Badge className={sessionTypeColors[session.sessionType]}>
                {session.sessionType}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Session Details and Activities
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push(`/admin/sessions/${sessionId}/attendance`)}
            >
              <Users className="mr-2 h-4 w-4" />
              Mark Attendance
            </Button>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              Edit Session
            </Button>
          </div>
        </div>

        {/* Session Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Program */}
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Program
                  </p>
                  <p className="text-base font-medium">
                    {session.program ? session.program.name : <span className="text-muted-foreground">Standalone Session</span>}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p className="text-base font-medium">
                    {format(new Date(session.sessionDate), 'PPP')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(session.sessionDate), 'p')}
                  </p>
                </div>
              </div>

              {/* Duration */}
              {session.duration && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Duration
                    </p>
                    <p className="text-base font-medium">{session.duration}</p>
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Location
                  </p>
                  <p className="text-base font-medium">{session.location}</p>
                </div>
              </div>

              {/* Description */}
              {session.description && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Description
                  </p>
                  <p className="text-base">{session.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activities Manager */}
        <SessionActivitiesManager sessionId={sessionId} />

        {/* Edit Dialog */}
        <SessionFormDialog
          open={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          sessionId={sessionId}
        />
      </div>
    </PageWrapper>
  )
}
