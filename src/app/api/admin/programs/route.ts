import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { programs } from '@/lib/db/schema'
import { requireAdmin, handleApiError, successResponse } from '@/lib/auth/middleware'

const createProgramSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
    slug: z.string().min(1, 'Slug is required').max(100, 'Slug must be at most 100 characters'),
    description: z.string().min(1, 'Description is required'),
    programType: z.enum(['cohort', 'evergreen'], {
      errorMap: () => ({ message: 'Program type must be cohort or evergreen' }),
    }),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.programType === 'cohort') {
        return !!data.startDate && !!data.endDate
      }
      return true
    },
    { message: 'Cohort programs must have start and end dates', path: ['programType'] }
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate)
      }
      return true
    },
    { message: 'End date must be after start date', path: ['endDate'] }
  )

/**
 * POST /api/admin/programs - Create new program
 * @requires Admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)

    const body = await request.json()
    const result = createProgramSchema.safeParse(body)

    if (!result.success) {
      return handleApiError(result.error)
    }

    const [program] = await db
      .insert(programs)
      .values({
        name: result.data.name,
        slug: result.data.slug,
        description: result.data.description,
        programType: result.data.programType,
        startDate: result.data.startDate ? new Date(result.data.startDate) : null,
        endDate: result.data.endDate ? new Date(result.data.endDate) : null,
        isActive: result.data.isActive,
      })
      .returning()

    return successResponse({ program }, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * GET /api/admin/programs - Get all programs (including inactive)
 * @requires Admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const allPrograms = await db.select().from(programs).orderBy(programs.name)

    return successResponse({ programs: allPrograms })
  } catch (error) {
    return handleApiError(error)
  }
}
