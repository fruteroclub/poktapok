/**
 * Edit Project Page
 *
 * Project editing flow
 */

'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import PageWrapper from '@/components/layout/page-wrapper'
import { EditProjectForm } from '@/components/portfolio/edit-project-form'
import { useProject } from '@/hooks/use-projects'
import { useAuth } from '@/hooks/use-auth'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/layout/section'

interface EditProjectPageProps {
  params: Promise<{ id: string }>
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = use(params)
  const router = useRouter()

  const { data: authData, isLoading: isLoadingAuth } = useAuth()
  const {
    data: projectData,
    isLoading: isLoadingProject,
    isError,
  } = useProject(id)

  const user = authData?.user
  const project = projectData?.project

  const isLoading = isLoadingAuth || isLoadingProject

  // Check ownership
  const isOwner = user && project && user.id === project.userId

  // Loading state
  if (isLoading) {
    return (
      <PageWrapper>
        <div className="page-content mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </PageWrapper>
    )
  }

  // Error state
  if (isError || !project) {
    return (
      <PageWrapper>
        <div className="page">
          <div className="page-content mx-auto max-w-4xl px-4 py-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Project Not Found</AlertTitle>
              <AlertDescription>
                The project you&apos;re looking for doesn&apos;t exist or has
                been deleted.
              </AlertDescription>
            </Alert>
            <Button onClick={() => router.push('/portfolio')}>
              Back to Portfolio
            </Button>
          </div>
        </div>
      </PageWrapper>
    )
  }

  // Permission check
  if (!isOwner) {
    return (
      <PageWrapper>
        <div className="page">
          <div className="page-content mx-auto max-w-4xl px-4 py-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>
                You don&apos;t have permission to edit this project.
              </AlertDescription>
            </Alert>
            <Button onClick={() => router.push('/portfolio')}>
              Back to Portfolio
            </Button>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="page">
        <div className="page-content">
          <div className="header-section">
            <h1 className="text-3xl font-bold">Edit Project</h1>
            <p className="text-muted-foreground">
              Edit your project to showcase your work
            </p>
          </div>
          <Section className="gap-y-4 pt-0!">
            <EditProjectForm project={project} />
          </Section>
        </div>
      </div>
    </PageWrapper>
  )
}
