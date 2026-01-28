import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { attendance } from '@/lib/db/schema'
import { apiSuccess, apiValidationError, apiErrors } from '@/lib/api/response'
import { requireAdmin } from '@/lib/auth/middleware'

const markAttendanceSchema = z.object({
  sessionId: z.string().uuid(),
  userIds: z.array(z.string().uuid()),
  status: z.enum(['present', 'absent', 'excused']),
})

/**
 * POST /api/admin/attendance/mark
 * Mark attendance for users at a session
 */
export async function POST(request: NextRequest) {
  const authUser = await requireAdmin(request)

  const body = await request.json()
  const result = markAttendanceSchema.safeParse(body)

  if (!result.success) {
    return apiValidationError(result.error)
  }

  const { sessionId, userIds, status } = result.data

  try {
    await db.transaction(async (tx) => {
      for (const userId of userIds) {
        // Use insert with onConflictDoUpdate for upsert behavior
        await tx
          .insert(attendance)
          .values({
            userId,
            sessionId,
            status,
            markedBy: authUser.id,
            markedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [attendance.userId, attendance.sessionId],
            set: {
              status,
              markedBy: authUser.id,
              markedAt: new Date(),
              updatedAt: new Date(),
            },
          })
      }
    })

    return apiSuccess(
      { marked: userIds.length },
      { message: `Marked attendance for ${userIds.length} user${userIds.length > 1 ? 's' : ''}` },
    )
  } catch (error) {
    console.error('Error marking attendance:', error)
    return apiErrors.internal()
  }
}
