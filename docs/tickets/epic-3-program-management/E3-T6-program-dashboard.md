# E3-T6: Program Dashboard

> **Epic**: E3 - Program Management
> **Status**: 🎯 Todo
> **Priority**: 🟡 High
> **Effort**: L (2.5 days - full-stack UX work)
> **Dependencies**: E3-T1, E3-T2, E3-T3

## 📋 Overview

Create user-facing program dashboard showing enrollment status, progress, goals, and upcoming activities. This is the central hub for users to track their program journey.

**Key Features:**
- Program overview with enrollment status
- Goal tracking and progress indicators
- Upcoming sessions and activities
- Participation statistics
- Promotion progress (for guests)

## 🎯 Objectives

1. Build program dashboard page
2. Display enrollment and status information
3. Show goal with progress tracking
4. List upcoming sessions and activities
5. Display participation metrics
6. Show promotion eligibility (for guests)

## 📦 Deliverables

### Backend
- [ ] `GET /api/programs/:id/dashboard` - Dashboard data endpoint
- [ ] `GET /api/programs/:id/activities` - Program activities
- [ ] `GET /api/programs/:id/sessions` - Upcoming sessions

### Frontend
- [ ] Program dashboard page (`/programs/:id`)
- [ ] Enrollment status card
- [ ] Goal tracking card
- [ ] Upcoming activities list
- [ ] Participation stats card
- [ ] Promotion progress card (guests only)

## 🔧 Technical Implementation

### Backend

```typescript
// src/app/api/programs/[id]/dashboard/route.ts
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { program_enrollments, programs, applications } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { apiSuccess, apiErrors } from '@/lib/api/response'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = request.headers.get('x-user-id')
  if (!userId) return apiErrors.unauthorized()

  const programId = params.id

  try {
    // Get enrollment
    const [enrollment] = await db
      .select()
      .from(program_enrollments)
      .where(
        and(
          eq(program_enrollments.userId, userId),
          eq(program_enrollments.programId, programId)
        )
      )
      .limit(1)

    if (!enrollment) {
      return apiErrors.notFound('Program enrollment')
    }

    // Get application (for goal)
    const [application] = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.userId, userId),
          eq(applications.programId, programId)
        )
      )
      .limit(1)

    // Get program details
    const [program] = await db
      .select()
      .from(programs)
      .where(eq(programs.id, programId))
      .limit(1)

    return apiSuccess({
      enrollment,
      application,
      program,
    })
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    return apiErrors.internal()
  }
}
```

### Frontend

```typescript
// src/app/programs/[id]/page.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AccountStatusBadge } from '@/components/common/account-status-badge'
import { PromotionProgressCard } from '@/components/programs/promotion-progress-card'

export default function ProgramDashboardPage({ params }: { params: { id: string } }) {
  const { data, isLoading } = useQuery({
    queryKey: ['programs', params.id, 'dashboard'],
    queryFn: () => fetchProgramDashboard(params.id),
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  const { enrollment, application, program } = data

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{program.name}</h1>
          <p className="text-muted-foreground">{program.description}</p>
        </div>
        <AccountStatusBadge status={enrollment.status} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Goal Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{application.goal}</p>
          </CardContent>
        </Card>

        {/* Participation Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Participation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Sessions Attended</span>
                <span>5 / 10</span>
              </div>
              <Progress value={50} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Submissions</span>
                <span>3 / 5</span>
              </div>
              <Progress value={60} />
            </div>
          </CardContent>
        </Card>

        {/* Promotion Progress (Guest only) */}
        {enrollment.status === 'guest' && (
          <PromotionProgressCard programEnrollmentId={enrollment.id} />
        )}
      </div>
    </div>
  )
}
```

## ✅ Acceptance Criteria

- [ ] Dashboard shows program information
- [ ] Enrollment status is displayed
- [ ] User's goal is visible
- [ ] Participation metrics are shown
- [ ] Upcoming activities are listed
- [ ] Promotion progress shown for guests
- [ ] Mobile responsive design

## 🧪 Testing

```typescript
test('user views program dashboard', async ({ page }) => {
  await page.goto('/programs/program-123')

  await expect(page.locator('h1')).toContainText('De Cero a Chamba')
  await expect(page.locator('text=Your Goal')).toBeVisible()
  await expect(page.locator('text=Participation')).toBeVisible()
})
```

## 📝 Implementation Notes

- Cache dashboard data for 5 minutes
- Use skeleton loaders for better perceived performance
- Consider adding goal editing functionality in future

## 📖 References

- [E3-T1: Database Schema](./E3-T1-database-schema-setup.md)
- [E3-T3: Guest Status](./E3-T3-guest-status-implementation.md)
