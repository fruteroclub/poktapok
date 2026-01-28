/**
 * Project View Count Tracking API
 *
 * POST /api/projects/[id]/view - Increment view count (public, no auth)
 */

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'
import { eq, sql, isNull, and } from 'drizzle-orm'
import { apiSuccess, apiErrors } from '@/lib/api/response'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    // Verify project exists and is not deleted
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, id), isNull(projects.deletedAt)))
      .limit(1)

    if (!project) {
      return apiErrors.notFound('Project')
    }

    // Increment view count
    await db
      .update(projects)
      .set({
        viewCount: sql`${projects.viewCount} + 1`,
        updatedAt: sql`NOW()`,
      })
      .where(eq(projects.id, id))

    return apiSuccess({ projectId: id }, { message: 'View count incremented' })
  } catch (error) {
    console.error('Error tracking project view:', error)
    return apiErrors.internal('Failed to track project view')
  }
}
