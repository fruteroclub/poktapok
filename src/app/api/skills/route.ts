/**
 * Skills API Routes
 *
 * GET /api/skills - List all skills with filters
 */

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { skills } from '@/lib/db/schema';
import { apiSuccess, apiValidationError, apiErrors } from '@/lib/api/response';
import { listSkillsQuerySchema } from '@/lib/validators/skill';
import { eq, like, desc, and } from 'drizzle-orm';
import type { ListSkillsResponse } from '@/types/api-v1';

/**
 * GET /api/skills
 * List all skills with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validation = listSkillsQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!validation.success) {
      return apiValidationError(validation.error);
    }

    const { category, search, limit, offset } = validation.data;

    // Build conditions array
    const conditions = [];
    if (category) {
      conditions.push(eq(skills.category, category));
    }
    if (search) {
      conditions.push(like(skills.name, `%${search}%`));
    }

    // Build and execute query
    const skillsList = await db
      .select()
      .from(skills)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(skills.usageCount), skills.name)
      .limit(limit)
      .offset(offset);

    // Get total count (without pagination) - using the same conditions
    const [{ count: total }] = await db
      .select({ count: db.$count(skills) })
      .from(skills)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return apiSuccess<ListSkillsResponse>(
      { skills: skillsList, total },
      {
        meta: {
          pagination: {
            limit,
            offset,
            hasMore: offset + limit < total,
          },
        },
      }
    );
  } catch (error) {
    console.error('Error listing skills:', error);
    return apiErrors.internal();
  }
}
