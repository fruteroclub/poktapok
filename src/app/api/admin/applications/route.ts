import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { applications, users, profiles, programs } from '@/lib/db/schema'
import { eq, and, desc, sql, count } from 'drizzle-orm'
import { apiSuccess, apiErrors } from '@/lib/api/response'
import { requireAdmin } from '@/lib/auth/middleware'

/**
 * GET /api/admin/applications
 * List all applications with filtering and pagination
 */
export const GET = requireAdmin(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') // pending, approved, rejected
  const programId = searchParams.get('programId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    // Build the base query with joins
    let query = db
      .select({
        application: {
          id: applications.id,
          userId: applications.userId,
          programId: applications.programId,
          status: applications.status,
          goal: applications.goal,
          githubUsername: applications.githubUsername,
          twitterUsername: applications.twitterUsername,
          linkedinUrl: applications.linkedinUrl,
          telegramUsername: applications.telegramUsername,
          reviewedBy: applications.reviewedBy,
          reviewedAt: applications.reviewedAt,
          reviewNotes: applications.reviewNotes,
          createdAt: applications.createdAt,
          updatedAt: applications.updatedAt,
        },
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          accountStatus: users.accountStatus,
        },
        profile: {
          id: profiles.id,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl,
          city: profiles.city,
          country: profiles.country,
        },
        program: {
          id: programs.id,
          name: programs.name,
        },
      })
      .from(applications)
      .leftJoin(users, eq(applications.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .leftJoin(programs, eq(applications.programId, programs.id))
      .orderBy(desc(applications.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    // Apply filters
    const filters = []
    if (status) {
      filters.push(eq(applications.status, status))
    }
    if (programId) {
      filters.push(eq(applications.programId, programId))
    }

    if (filters.length > 0) {
      query = query.where(and(...filters)) as typeof query
    }

    const results = await query

    // Get total count for pagination
    let countQuery = db.select({ count: count() }).from(applications)

    if (filters.length > 0) {
      countQuery = countQuery.where(and(...filters)) as typeof countQuery
    }

    const [{ count: total }] = await countQuery

    return apiSuccess(
      { applications: results },
      {
        meta: {
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: page * limit < total,
          },
        },
      },
    )
  } catch (error) {
    console.error('Error fetching applications:', error)
    return apiErrors.internal()
  }
})
