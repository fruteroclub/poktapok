/**
 * Project Skills API Routes
 *
 * POST /api/projects/:id/skills - Link skill to project
 * GET /api/projects/:id/skills - List project skills
 */

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { projects, projectSkills, skills, users } from '@/lib/db/schema';
import { apiSuccess, apiValidationError, apiErrors } from '@/lib/api/response';
import { linkProjectSkillSchema } from '@/lib/validators/skill';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { syncUserSkills } from '@/lib/skills/sync-user-skills';
import { getAuthUser } from '@/lib/privy/middleware';
import type { LinkProjectSkillResponse } from '@/types/api-v1';

/**
 * POST /api/projects/:id/skills
 * Link a skill to a project
 *
 * Requirements:
 * - User must be authenticated
 * - User must own the project
 * - Skill must exist
 * - Auto-syncs user skills after linking
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return apiErrors.unauthorized();
    }

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

    // Await params (Next.js 16 pattern)
    const { id: projectId } = await params;

    // Validate request body
    const body = await request.json();
    const validation = linkProjectSkillSchema.safeParse(body);

    if (!validation.success) {
      return apiValidationError(validation.error);
    }

    const { skillId } = validation.data;

    // Verify project exists and user owns it
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
      .limit(1);

    if (!project) {
      return apiErrors.notFound('Project');
    }

    if (project.userId !== userId) {
      return apiErrors.unauthorized('You can only add skills to your own projects');
    }

    // Verify skill exists
    const [skill] = await db.select().from(skills).where(eq(skills.id, skillId)).limit(1);

    if (!skill) {
      return apiErrors.notFound('Skill');
    }

    // Check if skill is already linked to project
    const [existing] = await db
      .select()
      .from(projectSkills)
      .where(and(eq(projectSkills.projectId, projectId), eq(projectSkills.skillId, skillId)))
      .limit(1);

    if (existing) {
      return apiErrors.conflict('Skill already linked to this project');
    }

    // Link skill to project
    const [projectSkill] = await db
      .insert(projectSkills)
      .values({
        projectId,
        skillId,
      })
      .returning();

    // Increment skill usage count
    await db
      .update(skills)
      .set({
        usageCount: sql`${skills.usageCount} + 1`,
      })
      .where(eq(skills.id, skillId));

    // Auto-sync user skills
    await syncUserSkills(userId);

    return apiSuccess<LinkProjectSkillResponse>(
      { projectSkill },
      { message: 'Skill linked to project successfully' }
    );
  } catch (error) {
    console.error('Error linking skill to project:', error);
    return apiErrors.internal();
  }
}

/**
 * GET /api/projects/:id/skills
 * List all skills linked to a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params
    const { id: projectId } = await params;

    // Verify project exists
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
      .limit(1);

    if (!project) {
      return apiErrors.notFound('Project');
    }

    // Fetch project skills with full skill details
    const projectSkillsList = await db
      .select({
        skill: skills,
      })
      .from(projectSkills)
      .innerJoin(skills, eq(projectSkills.skillId, skills.id))
      .where(eq(projectSkills.projectId, projectId));

    const skillsList = projectSkillsList.map((ps) => ps.skill);

    return apiSuccess({ skills: skillsList, total: skillsList.length });
  } catch (error) {
    console.error('Error fetching project skills:', error);
    return apiErrors.internal();
  }
}
