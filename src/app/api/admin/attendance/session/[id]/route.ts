import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  attendance,
  programEnrollments,
  users,
  profiles,
  sessions,
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { apiSuccess, apiErrors } from '@/lib/api/response'
import { requireAdmin } from '@/lib/auth/middleware'

/**
 * GET /api/admin/attendance/session/:id
 * Get attendance records for a specific session
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin(request)

  const { id: sessionId } = await params

  if (!sessionId) {
    return apiErrors.notFound('Session ID')
  }

  try {
    // Get session info
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1)

    if (!session) {
      return apiErrors.notFound('Session')
    }

    // Get all enrolled users for this program
    const enrolledUsers = await db
      .select({
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          email: users.email,
          accountStatus: users.accountStatus,
        },
        profile: {
          id: profiles.id,
        },
        enrollment: {
          id: programEnrollments.id,
          status: programEnrollments.status,
        },
      })
      .from(programEnrollments)
      .leftJoin(users, eq(programEnrollments.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(programEnrollments.programId, session.programId))

    // Get attendance records for this session
    const attendanceRecords = await db
      .select({
        attendance: {
          id: attendance.id,
          userId: attendance.userId,
          sessionId: attendance.sessionId,
          status: attendance.status,
          markedBy: attendance.markedBy,
          markedAt: attendance.markedAt,
        },
        markedByUser: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
        },
      })
      .from(attendance)
      .leftJoin(users, eq(attendance.markedBy, users.id))
      .where(eq(attendance.sessionId, sessionId))

    // Combine enrolled users with their attendance status
    const attendanceMap = new Map(
      attendanceRecords.map((record) => [record.attendance.userId, record]),
    )

    const usersWithAttendance = enrolledUsers.map((enrolled) => ({
      user: enrolled.user,
      profile: enrolled.profile,
      enrollment: enrolled.enrollment,
      attendance: enrolled.user ? attendanceMap.get(enrolled.user.id)?.attendance || null : null,
      markedBy: enrolled.user ? attendanceMap.get(enrolled.user.id)?.markedByUser || null : null,
    }))

    return apiSuccess({
      session: {
        id: session.id,
        title: session.title,
        description: session.description,
        sessionDate: session.sessionDate,
        programId: session.programId,
      },
      users: usersWithAttendance,
    })
  } catch (error) {
    console.error('Error fetching session attendance:', error)
    return apiErrors.internal()
  }
}
