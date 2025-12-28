/**
 * Individual Project View Page
 *
 * Public-facing project detail page with SEO optimization
 * Supports view count tracking and owner actions
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PageWrapper from '@/components/layout/page-wrapper';
import { ProjectHeader } from '@/components/portfolio/project-header';
import { ProjectLinks } from '@/components/portfolio/project-links';
import { ProjectSkills } from '@/components/portfolio/project-skills';
import { ProjectImages } from '@/components/portfolio/project-images';
import { ViewCountTracker } from '@/components/portfolio/view-count-tracker';
import { db } from '@/lib/db';
import { projects, projectSkills, skills, users } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/helpers';

/**
 * Fetch project server-side for SSR and SEO
 */
async function fetchProjectForSSR(id: string) {
  try {
    // Fetch project with skills
    const projectWithSkills = await db
      .select({
        project: projects,
        skill: skills,
      })
      .from(projects)
      .leftJoin(projectSkills, eq(projects.id, projectSkills.projectId))
      .leftJoin(skills, eq(projectSkills.skillId, skills.id))
      .where(and(eq(projects.id, id), isNull(projects.deletedAt)));

    if (projectWithSkills.length === 0) {
      return null;
    }

    // Transform to expected format
    const projectData = projectWithSkills[0].project;
    const projectSkillsList = projectWithSkills
      .filter((row) => row.skill !== null)
      .map((row) => row.skill!);

    return {
      ...projectData,
      skills: projectSkillsList,
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

/**
 * Check if current user is the project owner
 */
async function checkProjectOwnership(projectUserId: string): Promise<boolean> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return false;

    return currentUser.user.id === projectUserId;
  } catch {
    return false;
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch project
  const project = await fetchProjectForSSR(id);

  if (!project) {
    notFound();
  }

  // Check if draft and user is owner
  if (project.projectStatus === 'draft') {
    const isOwner = await checkProjectOwnership(project.userId);
    if (!isOwner) {
      notFound(); // Return 404 to hide existence from non-owners
    }
  }

  // Check ownership for owner actions
  const isOwner = await checkProjectOwnership(project.userId);

  return (
    <PageWrapper>
      <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8">
        {/* View count tracker (client-side) */}
        <ViewCountTracker projectId={id} />

        {/* Project header */}
        <ProjectHeader project={project} isOwner={isOwner} />

        {/* Project links */}
        <ProjectLinks
          repositoryUrl={project.repositoryUrl}
          liveUrl={project.liveUrl}
          videoUrl={project.videoUrl}
        />

        {/* Skills */}
        <ProjectSkills skills={project.skills} />

        {/* Images */}
        {project.imageUrls && project.imageUrls.length > 0 && (
          <ProjectImages images={project.imageUrls} />
        )}
      </div>
    </PageWrapper>
  );
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await fetchProjectForSSR(id);

  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  const title = `${project.title} | Poktapok Portfolio`;
  const description = project.description;
  const imageUrl = project.logoUrl || '/og-image.png';

  return {
    title,
    description,
    openGraph: {
      title: project.title,
      description,
      images: [imageUrl],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description,
      images: [imageUrl],
    },
  };
}
