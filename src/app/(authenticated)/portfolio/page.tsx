/**
 * Portfolio Page
 *
 * User's project portfolio with create button
 * Shows all projects with filters
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import PageWrapper from '@/components/layout/page-wrapper'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/portfolio/project-card'
import { useAuth } from '@/hooks/use-auth'
import { useUserProjects } from '@/hooks/use-projects'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Section } from '@/components/layout/section'

export default function PortfolioPage() {
  const router = useRouter()
  const {
    data: authData,
    isLoading: isLoadingAuth,
    isFetching: isFetchingAuth,
  } = useAuth()
  const user = authData?.user

  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  )
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined)

  // Fetch user's projects
  const {
    data: projectsData,
    isLoading: isLoadingProjects,
    isFetching: isFetchingProjects,
  } = useUserProjects(user?.id, {
    status:
      statusFilter && statusFilter !== 'all'
        ? (statusFilter as 'draft' | 'wip' | 'completed' | 'archived')
        : undefined,
    type:
      typeFilter && typeFilter !== 'all'
        ? (typeFilter as
            | 'personal'
            | 'bootcamp'
            | 'hackathon'
            | 'work-related'
            | 'freelance'
            | 'bounty')
        : undefined,
  })

  const projects = projectsData?.projects || []
  const isLoading =
    isLoadingAuth || isFetchingAuth || isLoadingProjects || isFetchingProjects

  // Handle edit navigation
  const handleEdit = (projectId: string) => {
    router.push(`/portfolio/${projectId}/edit`)
  }

  return (
    <PageWrapper>
      <div className="page">
        <div className="page-content">
          {/* Page Header */}
          <div className="header-section flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold">My Portfolio</h1>
              <p className="text-muted-foreground">
                Manage your projects and showcase your work
              </p>
            </div>
            <Button onClick={() => router.push('/portfolio/new')}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="wip">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="bootcamp">Bootcamp</SelectItem>
                <SelectItem value="hackathon">Hackathon</SelectItem>
                <SelectItem value="work-related">Work</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
                <SelectItem value="bounty">Bounty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Section className="space-y-4 pt-0!">
            {/* Loading state */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center gap-2 py-12">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="text-lg font-light text-muted-foreground">
                  Loading...
                </p>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && projects.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12">
                <div className="space-y-3 text-center">
                  <h3 className="text-lg font-semibold">No projects yet</h3>
                  <p className="max-w-md text-muted-foreground">
                    Start building your portfolio by creating your first
                    project. Showcase your work to potential employers and
                    clients.
                  </p>
                  <Button onClick={() => router.push('/portfolio/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Project
                  </Button>
                </div>
              </div>
            )}

            {/* Projects grid */}
            {!isLoading && projects.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    showActions
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </PageWrapper>
  )
}
