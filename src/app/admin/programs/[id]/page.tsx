'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useProgram } from '@/hooks/use-admin'
import PageWrapper from '@/components/layout/page-wrapper'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ProgramOverviewCard } from '@/components/admin/program-overview-card'
import { ProgramStatsGrid } from '@/components/admin/program-stats-grid'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Users, Calendar, Activity } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ProgramDetailPage({ params }: PageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const programId = resolvedParams.id

  const { data, isLoading } = useProgram(programId)
  const program = data?.program

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="space-y-6">
          {/* Breadcrumb skeleton */}
          <Skeleton className="h-4 w-64" />

          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-96" />
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Content skeleton */}
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (!program) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">Program not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/admin/programs')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Programs
          </Button>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/programs">Programs</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{program.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{program.name}</h1>
            <p className="text-muted-foreground mt-1">{program.description}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/admin/programs')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Program Overview */}
        <ProgramOverviewCard program={program} />

        {/* Statistics Grid */}
        <ProgramStatsGrid stats={program.stats} />

        {/* Quick Navigation Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Enrollments Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/admin/programs/${programId}/enrollments`)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Enrollments</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>Manage student enrollments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{program.stats.totalEnrollments}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {program.stats.activeEnrollments} active
              </p>
            </CardContent>
          </Card>

          {/* Sessions Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/admin/programs/${programId}/sessions`)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Sessions</CardTitle>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>View program sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{program.stats.totalSessions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {program.stats.upcomingSessions} upcoming
              </p>
            </CardContent>
          </Card>

          {/* Activities Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/admin/programs/${programId}/activities`)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Activities</CardTitle>
                <Activity className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>Manage program activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{program.stats.totalActivities}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {program.stats.directActivities} direct, {program.stats.transitiveActivities} via sessions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  )
}
