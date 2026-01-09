import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { attendance } from '@/lib/db/schema'
import { apiSuccess, apiValidationError, apiErrors } from '@/lib/api/response'
import { requireAdmin } from '@/lib/auth/middleware'

const bulkAttendanceSchema = z.object({
  sessionId: z.string().uuid(),
  records: z.array(
    z.object({
      userId: z.string().uuid(),
      status: z.enum(['present', 'absent', 'excused']),
    }),
  ),
})

/**
 * POST /api/admin/attendance/bulk
 * Bulk mark attendance with different statuses per user
 * Useful for marking multiple users with different attendance statuses in one request
 */
export const POST = requireAdmin(async (request: NextRequest, authUser) => {
  const body = await request.json()
  const result = bulkAttendanceSchema.safeParse(body)

  if (!result.success) {
    return apiValidationError(result.error)
  }

  const { sessionId, records } = result.data

  try {
    await db.transaction(async (tx) => {
      for (const record of records) {
        await tx
          .insert(attendance)
          .values({
            userId: record.userId,
            sessionId,
            status: record.status,
            markedBy: authUser.userId,
            markedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [attendance.userId, attendance.sessionId],
            set: {
              status: record.status,
              markedBy: authUser.userId,
              markedAt: new Date(),
              updatedAt: new Date(),
            },
          })
      }
    })

    return apiSuccess(
      { marked: records.length },
      { message: `Marked attendance for ${records.length} user${records.length > 1 ? 's' : ''}` },
    )
  } catch (error) {
    console.error('Error marking bulk attendance:', error)
    return apiErrors.internal()
  }
})
