'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageWrapper from '@/components/layout/page-wrapper'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { useProgram } from '@/hooks/use-admin'
import { useProgramEnrollments } from '@/hooks/use-program-enrollments'
import { EnrollmentsTable } from '@/components/admin/enrollments-table'
import { EnrollmentFormDialog } from '@/components/admin/enrollment-form-dialog'
import { useState } from 'react'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProgramEnrollmentsPage({ params }: PageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const programId = resolvedParams.id
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { data: programData, isLoading: isProgramLoading } = useProgram(programId)
  const { data: enrollmentsData, isLoading: isEnrollmentsLoading } =
    useProgramEnrollments(programId)

  const program = programData?.program
  const enrollments = enrollmentsData?.enrollments || []

  if (isProgramLoading) {
    return (
      <PageWrapper>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PageWrapper>
    )
  }

  if (!program) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Program not found</p>
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
              <BreadcrumbLink asChild>
                <Link href={`/admin/programs/${programId}`}>{program.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Enrollments</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Program Enrollments</h1>
            <p className="text-muted-foreground mt-1">
              Manage student enrollments for {program.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/admin/programs/${programId}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Program
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Enroll Student
            </Button>
          </div>
        </div>

        {/* Enrollments Table */}
        {isEnrollmentsLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <EnrollmentsTable programId={programId} enrollments={enrollments} />
        )}

        {/* Create Enrollment Dialog */}
        <EnrollmentFormDialog
          programId={programId}
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </PageWrapper>
  )
}
