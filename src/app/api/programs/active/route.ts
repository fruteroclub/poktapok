import { db } from '@/lib/db'
import { programs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { apiSuccess, apiErrors } from '@/lib/api/response'

/**
 * GET /api/programs/active
 *
 * Returns list of active programs available for onboarding selection
 *
 * @returns {Object} { success: true, data: { programs: Program[] } }
 */
export async function GET() {
  try {
    const activePrograms = await db
      .select({
        id: programs.id,
        name: programs.name,
        description: programs.description,
        programType: programs.programType,
        startDate: programs.startDate,
        endDate: programs.endDate,
      })
      .from(programs)
      .where(eq(programs.isActive, true))
      .orderBy(programs.name)

    return apiSuccess({ programs: activePrograms })
  } catch (error) {
    console.error('Error fetching active programs:', error)
    return apiErrors.internal()
  }
}
