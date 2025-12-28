/**
 * Portfolio Page
 *
 * User's project portfolio with create button
 * Shows all projects with filters
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import PageWrapper from '@/components/layout/page-wrapper';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/portfolio/project-card';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUserProjects } from '@/hooks/use-projects';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Section } from '@/components/layout/section';

export default function PortfolioPage() {
  const router = useRouter();
  const { data: authData, isLoading: isLoadingAuth } = useAuth();
  const user = authData?.user;

  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);

  // Fetch user's projects
  const { data: projectsData, isLoading: isLoadingProjects } = useUserProjects(user?.id, {
    status: statusFilter && statusFilter !== 'all' ? statusFilter as 'draft' | 'wip' | 'completed' | 'archived' : undefined,
    type: typeFilter && typeFilter !== 'all' ? typeFilter as 'personal' | 'bootcamp' | 'hackathon' | 'work-related' | 'freelance' | 'bounty' : undefined,
  });

  const projects = projectsData?.projects || [];
  const isLoading = isLoadingAuth || isLoadingProjects;

  // Handle edit navigation
  const handleEdit = (projectId: string) => {
    router.push(`/portfolio/${projectId}/edit`);
  };

  return (
    <PageWrapper>
      <div className="page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Portfolio</h1>
            <p className="text-muted-foreground mt-1">
              Manage your projects and showcase your work
            </p>
          </div>
          <Button onClick={() => router.push('/portfolio/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
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

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && projects.length !== 0 && (
          <Section className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
            <div className="text-center space-y-3">
              <h3 className="text-lg font-semibold">No projects yet</h3>
              <p className="text-muted-foreground max-w-md">
                Start building your portfolio by creating your first project.
                Showcase your work to potential employers and clients.
              </p>
              <Button onClick={() => router.push('/portfolio/new')} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            </div>
          </Section>
        )}

        {/* Projects grid */}
        {!isLoading && projects.length > 0 && (
          <Section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                showActions
                onEdit={handleEdit}
              />
            ))}
          </Section>
        )}
      </div>
    </PageWrapper>
  );
}
