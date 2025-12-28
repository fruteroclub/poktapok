/**
 * User Skills API Route
 *
 * GET /api/users/:userId/skills - Get user's validated skills from projects
 */

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { userSkills, skills } from '@/lib/db/schema';
import { apiSuccess, apiErrors } from '@/lib/api/response';
import { eq, desc } from 'drizzle-orm';
import type { ListUserSkillsResponse, UserSkillWithDetails } from '@/types/api-v1';

/**
 * GET /api/users/:userId/skills
 * Get user's validated skills earned through projects
 *
 * Returns skills ordered by projectCount DESC, then by skill name ASC
 * Each skill includes:
 * - Full skill details (name, category, description, etc.)
 * - projectCount (how many projects use this skill)
 * - proficiencyLevel (future enhancement)
 *
 * Query params:
 * - limit: Maximum number of skills to return (default: all)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Await params (Next.js 16 pattern)
    const { userId } = await params;

    // Parse query params
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    // Build query
    let query = db
      .select({
        id: userSkills.id,
        userId: userSkills.userId,
        skillId: userSkills.skillId,
        projectCount: userSkills.projectCount,
        proficiencyLevel: userSkills.proficiencyLevel,
        createdAt: userSkills.createdAt,
        skill: skills,
      })
      .from(userSkills)
      .innerJoin(skills, eq(userSkills.skillId, skills.id))
      .where(eq(userSkills.userId, userId))
      .orderBy(desc(userSkills.projectCount), skills.name);

    // Apply limit if provided
    if (limit && limit > 0) {
      query = query.limit(limit) as typeof query;
    }

    const userSkillsList = await query;

    // Transform to match UserSkillWithDetails type
    const skillsWithDetails: UserSkillWithDetails[] = userSkillsList.map((us) => ({
      id: us.id,
      userId: us.userId,
      skillId: us.skillId,
      projectCount: us.projectCount,
      proficiencyLevel: us.proficiencyLevel,
      createdAt: us.createdAt,
      skill: us.skill,
    }));

    return apiSuccess<ListUserSkillsResponse>({
      skills: skillsWithDetails,
      total: skillsWithDetails.length,
    });
  } catch (error) {
    console.error('Error fetching user skills:', error);
    return apiErrors.internal();
  }
}
