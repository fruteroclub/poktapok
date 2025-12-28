/**
 * Projects API Routes
 *
 * POST /api/projects - Create new project
 * GET /api/projects - List projects with filters
 */

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { projects, projectSkills, skills, userSkills, users } from '@/lib/db/schema';
import { apiSuccess, apiError, apiValidationError, apiErrors } from '@/lib/api/response';
import { createProjectSchema, listProjectsQuerySchema } from '@/lib/validators/project';
import { requireAuth, getAuthUser } from '@/lib/privy/middleware';
import { eq, and, inArray, isNull, desc, ne, sql, count } from 'drizzle-orm';
import { syncUserSkills } from '@/lib/skills/sync-user-skills';
import type { CreateProjectResponse, ListProjectsResponse } from '@/types/api-v1';

/**
 * POST /api/projects
 * Create a new project
 */
export const POST = requireAuth(async (request: NextRequest, authUser) => {
  try {
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

    // Parse and validate request body
    const body = await request.json();
    const validation = createProjectSchema.safeParse(body);

    if (!validation.success) {
      return apiValidationError(validation.error);
    }

    const { skillIds, ...projectData } = validation.data;

    // Validate skills exist
    const existingSkills = await db
      .select()
      .from(skills)
      .where(inArray(skills.id, skillIds));

    if (existingSkills.length !== skillIds.length) {
      return apiError('Some skills do not exist', { status: 400, code: 'INVALID_SKILLS' });
    }

    // Create project
    const [newProject] = await db
      .insert(projects)
      .values({
        ...projectData,
        userId,
        publishedAt: projectData.projectStatus !== 'draft' ? new Date() : null,
      })
      .returning();

    // Link skills to project
    if (skillIds.length > 0) {
      await db.insert(projectSkills).values(
        skillIds.map((skillId) => ({
          projectId: newProject.id,
          skillId,
        }))
      );

      // Increment skill usage counts
      for (const skillId of skillIds) {
        await db
          .update(skills)
          .set({ usageCount: sql`${skills.usageCount} + 1` })
          .where(eq(skills.id, skillId));
      }

      // Auto-sync user skills using centralized utility
      await syncUserSkills(userId);
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
      .where(eq(projects.id, newProject.id));

    const project = {
      ...newProject,
      skills: projectWithSkills
        .filter((row) => row.skill !== null)
        .map((row) => row.skill!),
    };

    return apiSuccess<CreateProjectResponse>(
      { project },
      { message: 'Project created successfully', status: 201 }
    );
  } catch (error) {
    console.error('Error creating project:', error);
    return apiErrors.internal();
  }
});

/**
 * GET /api/projects
 * List projects with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validation = listProjectsQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!validation.success) {
      return apiValidationError(validation.error);
    }

    const { userId, status, type, featured, limit, offset } = validation.data;

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

    // Build query conditions
    const conditions = [isNull(projects.deletedAt)];

    if (userId) {
      conditions.push(eq(projects.userId, userId));
    }

    if (status) {
      conditions.push(eq(projects.projectStatus, status));
    } else if (userId !== currentUserId) {
      conditions.push(ne(projects.projectStatus, 'draft'));
    }

    if (type) {
      conditions.push(eq(projects.projectType, type));
    }

    if (featured !== undefined) {
      conditions.push(eq(projects.featured, featured));
    }

    // Fetch projects with skills
    const projectsWithSkills = await db
      .select({
        project: projects,
        skill: skills,
      })
      .from(projects)
      .leftJoin(projectSkills, eq(projects.id, projectSkills.projectId))
      .leftJoin(skills, eq(projectSkills.skillId, skills.id))
      .where(and(...conditions))
      .orderBy(desc(projects.featured), desc(projects.publishedAt))
      .limit(limit)
      .offset(offset);

    // Group by project
    const projectsMap = new Map();
    for (const row of projectsWithSkills) {
      if (!projectsMap.has(row.project.id)) {
        projectsMap.set(row.project.id, {
          ...row.project,
          skills: [],
        });
      }
      if (row.skill) {
        projectsMap.get(row.project.id).skills.push(row.skill);
      }
    }

    const projectsList = Array.from(projectsMap.values());

    // Get total count
    const [{ value: totalCount }] = await db
      .select({ value: count() })
      .from(projects)
      .where(and(...conditions));

    return apiSuccess<ListProjectsResponse>(
      { projects: projectsList, total: totalCount },
      {
        meta: {
          pagination: {
            limit,
            offset,
            hasMore: offset + limit < totalCount,
          },
        },
      }
    );
  } catch (error) {
    console.error('Error listing projects:', error);
    return apiErrors.internal();
  }
}
