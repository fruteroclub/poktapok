/**
 * Project Skill Unlink API Route
 *
 * DELETE /api/projects/:id/skills/:skillId - Unlink skill from project
 */

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { projects, projectSkills, skills, users } from '@/lib/db/schema'
import { apiSuccess, apiErrors } from '@/lib/api/response'
import { eq, and, isNull, sql } from 'drizzle-orm'
import { syncUserSkills } from '@/lib/skills/sync-user-skills'
import { getAuthUser } from '@/lib/privy/middleware'
import type { UnlinkProjectSkillResponse } from '@/types/api-v1'

/**
 * DELETE /api/projects/:id/skills/:skillId
 * Unlink a skill from a project
 *
 * Requirements:
 * - User must be authenticated
 * - User must own the project
 * - Auto-syncs user skills after unlinking
 * - Decrements skill usage count
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; skillId: string }> },
) {
  try {
    // Get authenticated user
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return apiErrors.unauthorized()
    }

    // Get user from database
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.privyDid, authUser.privyDid))
      .limit(1)

    if (!dbUser) {
      return apiErrors.notFound('User')
    }

    const userId = dbUser.id

    // Await params (Next.js 16 pattern)
    const { id: projectId, skillId } = await params

    // Verify project exists and user owns it
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
      .limit(1)

    if (!project) {
      return apiErrors.notFound('Project')
    }

    if (project.userId !== userId) {
      return apiErrors.unauthorized(
        'You can only remove skills from your own projects',
      )
    }

    // Check if skill is linked to project
    const [existing] = await db
      .select()
      .from(projectSkills)
      .where(
        and(
          eq(projectSkills.projectId, projectId),
          eq(projectSkills.skillId, skillId),
        ),
      )
      .limit(1)

    if (!existing) {
      return apiErrors.notFound('Skill not linked to this project')
    }

    // Unlink skill from project
    await db
      .delete(projectSkills)
      .where(
        and(
          eq(projectSkills.projectId, projectId),
          eq(projectSkills.skillId, skillId),
        ),
      )

    // Decrement skill usage count (don't go below 0)
    await db
      .update(skills)
      .set({
        usageCount: sql`GREATEST(0, ${skills.usageCount} - 1)`,
      })
      .where(eq(skills.id, skillId))

    // Auto-sync user skills
    await syncUserSkills(userId)

    return apiSuccess<UnlinkProjectSkillResponse>(
      { projectId, skillId },
      { message: 'Skill unlinked from project successfully' },
    )
  } catch (error) {
    console.error('Error unlinking skill from project:', error)
    return apiErrors.internal()
  }
}
