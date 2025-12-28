/**
 * Single Project API Routes
 *
 * GET /api/projects/:id - Fetch single project
 * PUT /api/projects/:id - Update project
 * DELETE /api/projects/:id - Soft delete project
 */

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { projects, projectSkills, skills, userSkills, users } from '@/lib/db/schema';
import { apiSuccess, apiError, apiErrors, apiValidationError } from '@/lib/api/response';
import { updateProjectSchema } from '@/lib/validators/project';
import { requireAuth, getAuthUser } from '@/lib/privy/middleware';
import { eq, and, inArray, isNull, sql } from 'drizzle-orm';
import type { GetProjectResponse, UpdateProjectResponse, DeleteProjectResponse } from '@/types/api-v1';

/**
 * GET /api/projects/:id
 * Fetch single project with skills
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // Get current user (for draft visibility)
    const authUser = await getAuthUser(request);
    let currentUserId: string | null = null;

    if (authUser) {
      const [dbUser] = await db
        .select()
        .from(users)
        .where(eq(users.privyDid, authUser.privyDid))
        .limit(1);
      currentUserId = dbUser?.id || null;
    }

    // Fetch project with skills
    const projectWithSkills = await db
      .select({
        project: projects,
        skill: skills,
      })
      .from(projects)
      .leftJoin(projectSkills, eq(projects.id, projectSkills.projectId))
      .leftJoin(skills, eq(projectSkills.skillId, skills.id))
      .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)));

    if (projectWithSkills.length === 0) {
      return apiErrors.notFound('Project');
    }

    const project = projectWithSkills[0].project;

    // Check draft visibility
    if (project.projectStatus === 'draft' && project.userId !== currentUserId) {
      return apiErrors.notFound('Project');
    }

    // Increment view count (only for non-owners)
    if (project.userId !== currentUserId) {
      await db
        .update(projects)
        .set({ viewCount: project.viewCount + 1 })
        .where(eq(projects.id, projectId));
    }

    // Transform to response format
    const projectData = {
      ...project,
      skills: projectWithSkills
        .filter((row) => row.skill !== null)
        .map((row) => row.skill!),
    };

    return apiSuccess<GetProjectResponse>({ project: projectData });
  } catch (error) {
    console.error('Error fetching project:', error);
    return apiErrors.internal();
  }
}

/**
 * PUT /api/projects/:id
 * Update project (owner only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return apiErrors.unauthorized();
  }

  try {
    const { id: projectId } = await params;

    // Get user from database
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.privyDid, authUser.privyDid))
      .limit(1);

    if (!dbUser) {
      return apiErrors.notFound('User');
    }

    const userId = dbUser.id;

    // Check project ownership
    const [existingProject] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
      .limit(1);

    if (!existingProject) {
      return apiErrors.notFound('Project');
    }

    if (existingProject.userId !== userId) {
      return apiErrors.unauthorized();
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateProjectSchema.safeParse(body);

    if (!validation.success) {
      return apiValidationError(validation.error);
    }

    const { skillIds, ...projectData } = validation.data;

    // Update project
    const [updatedProject] = await db
      .update(projects)
      .set({
        ...projectData,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning();

    // Update skills if provided
    if (skillIds) {
      // Validate skills exist
      const existingSkills = await db
        .select()
        .from(skills)
        .where(inArray(skills.id, skillIds));

      if (existingSkills.length !== skillIds.length) {
        return apiError('Some skills do not exist', { status: 400, code: 'INVALID_SKILLS' });
      }

      // Get old skills
      const oldSkills = await db
        .select()
        .from(projectSkills)
        .where(eq(projectSkills.projectId, projectId));

      const oldSkillIds = oldSkills.map((ps) => ps.skillId);

      // Remove old skill links
      await db.delete(projectSkills).where(eq(projectSkills.projectId, projectId));

      // Add new skill links
      if (skillIds.length > 0) {
        await db.insert(projectSkills).values(
          skillIds.map((skillId) => ({
            projectId,
            skillId,
          }))
        );
      }

      // Update user_skills counts
      const removedSkills = oldSkillIds.filter((id) => !skillIds.includes(id));
      const addedSkills = skillIds.filter((id) => !oldSkillIds.includes(id));

      // Decrement counts for removed skills
      for (const skillId of removedSkills) {
        const [userSkill] = await db
          .select()
          .from(userSkills)
          .where(and(eq(userSkills.userId, userId), eq(userSkills.skillId, skillId)));

        if (userSkill) {
          if (userSkill.projectCount <= 1) {
            await db.delete(userSkills).where(eq(userSkills.id, userSkill.id));
          } else {
            await db
              .update(userSkills)
              .set({ projectCount: userSkill.projectCount - 1 })
              .where(eq(userSkills.id, userSkill.id));
          }
        }
      }

      // Increment counts for added skills
      for (const skillId of addedSkills) {
        const [userSkill] = await db
          .select()
          .from(userSkills)
          .where(and(eq(userSkills.userId, userId), eq(userSkills.skillId, skillId)));

        if (userSkill) {
          await db
            .update(userSkills)
            .set({ projectCount: userSkill.projectCount + 1 })
            .where(eq(userSkills.id, userSkill.id));
        } else {
          await db.insert(userSkills).values({
            userId,
            skillId,
            projectCount: 1,
          });
        }
      }
    }

    // Fetch updated project with skills
    const projectWithSkills = await db
      .select({
        project: projects,
        skill: skills,
      })
      .from(projects)
      .leftJoin(projectSkills, eq(projects.id, projectSkills.projectId))
      .leftJoin(skills, eq(projectSkills.skillId, skills.id))
      .where(eq(projects.id, projectId));

    const project = {
      ...updatedProject,
      skills: projectWithSkills
        .filter((row) => row.skill !== null)
        .map((row) => row.skill!),
    };

    return apiSuccess<UpdateProjectResponse>(
      { project },
      { message: 'Project updated successfully' }
    );
  } catch (error) {
    console.error('Error updating project:', error);
    return apiErrors.internal();
  }
}

/**
 * DELETE /api/projects/:id
 * Soft delete project (owner only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return apiErrors.unauthorized();
  }

  try {
    const { id: projectId } = await params;

    // Get user from database
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.privyDid, authUser.privyDid))
      .limit(1);

    if (!dbUser) {
      return apiErrors.notFound('User');
    }

    const userId = dbUser.id;

    // Check project ownership
    const [existingProject] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
      .limit(1);

    if (!existingProject) {
      return apiErrors.notFound('Project');
    }

    if (existingProject.userId !== userId) {
      return apiErrors.unauthorized();
    }

    // Get project skills to decrement user skill counts
    const projectSkillsList = await db
      .select()
      .from(projectSkills)
      .where(eq(projectSkills.projectId, projectId));

    // Soft delete project
    await db
      .update(projects)
      .set({ deletedAt: new Date() })
      .where(eq(projects.id, projectId));

    // Decrement user skill counts
    for (const ps of projectSkillsList) {
      const [userSkill] = await db
        .select()
        .from(userSkills)
        .where(and(eq(userSkills.userId, userId), eq(userSkills.skillId, ps.skillId)));

      if (userSkill) {
        if (userSkill.projectCount <= 1) {
          await db.delete(userSkills).where(eq(userSkills.id, userSkill.id));
        } else {
          await db
            .update(userSkills)
            .set({ projectCount: userSkill.projectCount - 1 })
            .where(eq(userSkills.id, userSkill.id));
        }
      }
    }

    return apiSuccess<DeleteProjectResponse>(
      { projectId },
      { message: 'Project deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting project:', error);
    return apiErrors.internal();
  }
}
