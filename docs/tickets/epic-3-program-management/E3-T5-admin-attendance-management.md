# E3-T5: Admin Attendance Management

> **Epic**: E3 - Program Management
> **Status**: 🎯 Todo
> **Priority**: 🟡 High
> **Effort**: M (2 days - 1 backend + 1 frontend)
> **Dependencies**: E3-T1 (Database Schema)

## 📋 Overview

Build admin interface for marking attendance at program sessions. Attendance tracking is critical for guest-to-member promotion eligibility and program engagement metrics.

**Key Features:**
- Session list with attendance marking
- Bulk attendance marking for efficiency
- Attendance history view
- Integration with promotion eligibility

## 🎯 Objectives

1. Create attendance marking endpoints
2. Build attendance management UI
3. Implement bulk attendance actions
4. Track attendance history
5. Link attendance to promotion eligibility

## 📦 Deliverables

### Backend
- [ ] `POST /api/admin/attendance/mark` - Mark attendance for users
- [ ] `GET /api/admin/attendance/session/:id` - Get session attendance
- [ ] `POST /api/admin/attendance/bulk` - Bulk attendance marking

### Frontend
- [ ] Attendance marking interface
- [ ] Session attendance list
- [ ] Bulk selection checkboxes
- [ ] Attendance history view

## 🔧 Technical Implementation

### Backend

```typescript
// src/app/api/admin/attendance/mark/route.ts
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { attendance } from '@/lib/db/schema'
import { apiSuccess, apiValidationError, apiErrors } from '@/lib/api/response'

const markAttendanceSchema = z.object({
  sessionId: z.string().uuid(),
  userIds: z.array(z.string().uuid()),
  status: z.enum(['present', 'absent', 'excused']),
})

export async function POST(request: NextRequest) {
  const adminRole = request.headers.get('x-user-role')
  if (adminRole !== 'admin') return apiErrors.unauthorized()

  const adminUserId = request.headers.get('x-user-id')
  const body = await request.json()
  const result = markAttendanceSchema.safeParse(body)

  if (!result.success) {
    return apiValidationError(result.error)
  }

  const { sessionId, userIds, status } = result.data

  try {
    await db.transaction(async (tx) => {
      for (const userId of userIds) {
        await tx.insert(attendance).values({
          userId,
          sessionId,
          status,
          markedBy: adminUserId,
          markedAt: new Date(),
        }).onConflictDoUpdate({
          target: [attendance.userId, attendance.sessionId],
          set: {
            status,
            markedBy: adminUserId,
            markedAt: new Date(),
            updatedAt: new Date(),
          },
        })
      }
    })

    return apiSuccess(
      { marked: userIds.length },
      { message: `Marked attendance for ${userIds.length} users` }
    )
  } catch (error) {
    console.error('Error marking attendance:', error)
    return apiErrors.internal()
  }
}
```

### Frontend

```typescript
// src/components/admin/attendance-marker.tsx
'use client'

import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface AttendanceMarkerProps {
  sessionId: string
  enrolledUsers: Array<{ id: string; displayName: string }>
}

export function AttendanceMarker({ sessionId, enrolledUsers }: AttendanceMarkerProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set())

  const markAttendanceMutation = useMutation({
    mutationFn: (data: { userIds: string[]; status: 'present' | 'absent' }) =>
      markAttendance(sessionId, data.userIds, data.status),
    onSuccess: (_, variables) => {
      toast.success(`Marked ${variables.userIds.length} users as ${variables.status}`)
      setSelectedUserIds(new Set())
    },
  })

  const handleToggleUser = (userId: string) => {
    const newSet = new Set(selectedUserIds)
    if (newSet.has(userId)) {
      newSet.delete(userId)
    } else {
      newSet.add(userId)
    }
    setSelectedUserIds(newSet)
  }

  const handleMarkPresent = () => {
    markAttendanceMutation.mutate({
      userIds: Array.from(selectedUserIds),
      status: 'present',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Mark Attendance</h3>
        <div className="flex gap-2">
          <Button
            onClick={handleMarkPresent}
            disabled={selectedUserIds.size === 0 || markAttendanceMutation.isPending}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark Present ({selectedUserIds.size})
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {enrolledUsers.map((user) => (
          <div key={user.id} className="flex items-center gap-2 rounded-lg border p-3">
            <Checkbox
              checked={selectedUserIds.has(user.id)}
              onCheckedChange={() => handleToggleUser(user.id)}
            />
            <span>{user.displayName}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## ✅ Acceptance Criteria

- [ ] Admin can mark users as present/absent
- [ ] Admin can bulk mark multiple users
- [ ] Attendance records are created/updated correctly
- [ ] Attendance history is visible
- [ ] Attendance counts affect promotion eligibility

## 🧪 Testing

```typescript
test('admin marks attendance', async ({ page }) => {
  await page.goto('/admin/sessions/session-123')

  // Select users
  await page.check('[data-user-id="user-1"]')
  await page.check('[data-user-id="user-2"]')

  // Mark present
  await page.click('text=Mark Present')

  await expect(page.locator('text=Marked 2 users')).toBeVisible()
})
```

## 📝 Implementation Notes

- Use upsert pattern for attendance (insert or update if exists)
- Track who marked attendance and when for audit trail
- Consider adding session date validation (can't mark future sessions)

## 📖 References

- [E3-T1: Database Schema](./E3-T1-database-schema-setup.md)
- [E3-T3: Guest Status](./E3-T3-guest-status-implementation.md)
