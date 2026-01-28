/**
 * Skills Synchronization Utility
 *
 * Auto-syncs user skills based on projects
 * Core principle: Skills are earned through projects, not self-reported
 */

import { db } from '@/lib/db'
import { userSkills, projectSkills, projects } from '@/lib/db/schema'
import { eq, and, isNull, sql } from 'drizzle-orm'

/**
 * Synchronize user skills from their projects
 *
 * This function:
 * 1. Queries all skills from user's non-deleted projects
 * 2. Counts how many projects use each skill
 * 3. Upserts into user_skills with projectCount
 * 4. Removes skills with 0 projects
 *
 * Called after every project-skill link/unlink operation
 *
 * @param userId - User ID to sync skills for
 */
export async function syncUserSkills(userId: string): Promise<void> {
  try {
    // Step 1: Get all skills from user's active projects with counts
    const skillCounts = await db
      .select({
        skillId: projectSkills.skillId,
        projectCount: sql<number>`cast(count(distinct ${projectSkills.projectId}) as integer)`,
      })
      .from(projectSkills)
      .innerJoin(projects, eq(projectSkills.projectId, projects.id))
      .where(
        and(
          eq(projects.userId, userId),
          isNull(projects.deletedAt), // Exclude soft-deleted projects
        ),
      )
      .groupBy(projectSkills.skillId)

    // Step 2: Get existing user skills for comparison
    const existingUserSkills = await db
      .select()
      .from(userSkills)
      .where(eq(userSkills.userId, userId))

    const existingSkillIds = new Set(existingUserSkills.map((us) => us.skillId))
    const currentSkillIds = new Set(skillCounts.map((sc) => sc.skillId))

    // Step 3: Upsert skills that have projects
    for (const { skillId, projectCount } of skillCounts) {
      await db
        .insert(userSkills)
        .values({
          userId,
          skillId,
          projectCount,
          proficiencyLevel: 'intermediate', // Default proficiency level
        })
        .onConflictDoUpdate({
          target: [userSkills.userId, userSkills.skillId],
          set: {
            projectCount,
          },
        })
    }

    // Step 4: Remove skills that are no longer in any projects
    const skillsToRemove = [...existingSkillIds].filter(
      (skillId) => !currentSkillIds.has(skillId),
    )

    if (skillsToRemove.length > 0) {
      await db
        .delete(userSkills)
        .where(
          and(
            eq(userSkills.userId, userId),
            sql`${userSkills.skillId} = ANY(${skillsToRemove})`,
          ),
        )
    }

    console.log(
      `✅ Synced skills for user ${userId}: ${skillCounts.length} skills`,
    )
  } catch (error) {
    console.error('Error syncing user skills:', error)
    throw error // Re-throw to handle in API routes
  }
}

/**
 * Get user's top skills by project count
 *
 * @param userId - User ID
 * @param limit - Maximum number of skills to return (default: 5)
 * @returns Array of skills with project counts, ordered by count DESC
 */
export async function getUserTopSkills(userId: string, limit: number = 5) {
  const topSkills = await db
    .select({
      skillId: userSkills.skillId,
      projectCount: userSkills.projectCount,
      proficiencyLevel: userSkills.proficiencyLevel,
    })
    .from(userSkills)
    .where(eq(userSkills.userId, userId))
    .orderBy(sql`${userSkills.projectCount} DESC`)
    .limit(limit)

  return topSkills
}
