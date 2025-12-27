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
import { eq, like, desc } from 'drizzle-orm';
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

    // Build query
    let query = db.select().from(skills);

    // Apply filters
    if (category) {
      query = query.where(eq(skills.category, category));
    }

    if (search) {
      query = query.where(like(skills.name, `%${search}%`));
    }

    // Order by usage count (most popular first), then alphabetically
    const skillsList = await query
      .orderBy(desc(skills.usageCount), skills.name)
      .limit(limit)
      .offset(offset);

    // Get total count (without pagination)
    const totalQuery = db.select({ count: db.$count() }).from(skills);

    if (category) {
      totalQuery.where(eq(skills.category, category));
    }

    if (search) {
      totalQuery.where(like(skills.name, `%${search}%`));
    }

    const [{ count: total }] = await totalQuery;

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
