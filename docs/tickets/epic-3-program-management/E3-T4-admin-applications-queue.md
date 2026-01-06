# E3-T4: Admin Applications Queue

> **Epic**: E3 - Program Management
> **Status**: 🎯 Todo
> **Priority**: 🔴 Critical
> **Effort**: M (2.5 days - 1 backend + 1.5 frontend)
> **Dependencies**: E3-T1 (Database Schema), E3-T2 (Onboarding Flow), E3-T3 (Guest Status)

## 📋 Overview

Build admin interface for reviewing and processing pending applications. Admins need a centralized queue to review applications, view user details, and approve/reject with appropriate status selection (guest vs member).

**Key Features:**
- Applications list with filtering and sorting
- Application detail view with user information
- Approval workflow with status selection (guest/member/reject)
- Review notes and history tracking
- Bulk actions for efficient processing

## 🎯 Objectives

1. Create admin applications list endpoint with filtering
2. Create application detail endpoint with full user context
3. Build applications queue UI component
4. Build application detail modal/page
5. Implement approval actions (guest/member/reject)
6. Add review notes interface
7. Track approval history

## 📦 Deliverables

### Backend
- [ ] `GET /api/admin/applications` - List applications with filters
- [ ] `GET /api/admin/applications/:id` - Application detail
- [ ] `POST /api/admin/applications/:id/approve` - Approve (from E3-T3)
- [ ] Application statistics endpoint

### Frontend
- [ ] Applications queue page (`/admin/applications`)
- [ ] Application detail modal/drawer
- [ ] Filtering controls (status, program, date)
- [ ] Approval action buttons with confirmation
- [ ] Review notes textarea
- [ ] Application statistics cards

### Documentation
- [ ] Admin workflow guide
- [ ] Application review criteria

## 🔧 Technical Implementation

### Backend Endpoints

**1. List Applications**

```typescript
// src/app/api/admin/applications/route.ts
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { applications, users, profiles, programs } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { apiSuccess, apiErrors } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  const adminRole = request.headers.get('x-user-role')
  if (adminRole !== 'admin') return apiErrors.unauthorized()

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') // pending, approved_guest, approved_member, rejected
  const programId = searchParams.get('programId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    let query = db
      .select({
        id: applications.id,
        status: applications.status,
        goal: applications.goal,
        createdAt: applications.createdAt,
        reviewedAt: applications.reviewedAt,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
        },
        profile: {
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl,
          githubUsername: profiles.githubUsername,
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

    if (status) {
      query = query.where(eq(applications.status, status))
    }
    if (programId) {
      query = query.where(eq(applications.programId, programId))
    }

    const results = await query

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)

    return apiSuccess(
      { applications: results },
      {
        meta: {
          pagination: {
            page,
            limit,
            total: count,
            hasMore: page * limit < count,
          },
        },
      }
    )
  } catch (error) {
    console.error('Error fetching applications:', error)
    return apiErrors.internal()
  }
}
```

**2. Application Detail**

```typescript
// src/app/api/admin/applications/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminRole = request.headers.get('x-user-role')
  if (adminRole !== 'admin') return apiErrors.unauthorized()

  try {
    const [application] = await db
      .select({
        id: applications.id,
        status: applications.status,
        goal: applications.goal,
        createdAt: applications.createdAt,
        reviewedAt: applications.reviewedAt,
        reviewNotes: applications.reviewNotes,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          accountStatus: users.accountStatus,
        },
        profile: {
          displayName: profiles.displayName,
          bio: profiles.bio,
          avatarUrl: profiles.avatarUrl,
          location: profiles.location,
          githubUsername: profiles.githubUsername,
          twitterUsername: profiles.twitterUsername,
          linkedinUrl: profiles.linkedinUrl,
        },
        program: {
          id: programs.id,
          name: programs.name,
          description: programs.description,
        },
        reviewer: {
          username: users.username,
        },
      })
      .from(applications)
      .leftJoin(users, eq(applications.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .leftJoin(programs, eq(applications.programId, programs.id))
      .leftJoin(users, eq(applications.reviewedBy, users.id))
      .where(eq(applications.id, params.id))
      .limit(1)

    if (!application) {
      return apiErrors.notFound('Application')
    }

    return apiSuccess({ application })
  } catch (error) {
    console.error('Error fetching application:', error)
    return apiErrors.internal()
  }
}
```

### Frontend Components

**1. Applications Queue Page**

```typescript
// src/app/admin/applications/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { ApplicationsTable } from '@/components/admin/applications-table'
import { ApplicationDetailDrawer } from '@/components/admin/application-detail-drawer'

export default function ApplicationsQueuePage() {
  const [statusFilter, setStatusFilter] = useState('pending')
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'applications', statusFilter],
    queryFn: () => fetchApplications({ status: statusFilter }),
  })

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Applications Queue</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <option value="pending">Pending</option>
          <option value="approved_guest">Approved as Guest</option>
          <option value="approved_member">Approved as Member</option>
          <option value="rejected">Rejected</option>
        </Select>
      </div>

      <ApplicationsTable
        applications={data?.applications || []}
        isLoading={isLoading}
        onSelectApplication={setSelectedApplicationId}
      />

      {selectedApplicationId && (
        <ApplicationDetailDrawer
          applicationId={selectedApplicationId}
          open={!!selectedApplicationId}
          onClose={() => setSelectedApplicationId(null)}
        />
      )}
    </div>
  )
}
```

**2. Application Detail Drawer**

```typescript
// src/components/admin/application-detail-drawer.tsx
'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, XCircle, UserCheck } from 'lucide-react'
import { toast } from 'sonner'

interface ApplicationDetailDrawerProps {
  applicationId: string
  open: boolean
  onClose: () => void
}

export function ApplicationDetailDrawer({
  applicationId,
  open,
  onClose,
}: ApplicationDetailDrawerProps) {
  const [reviewNotes, setReviewNotes] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'applications', applicationId],
    queryFn: () => fetchApplicationDetail(applicationId),
    enabled: open,
  })

  const approveMutation = useMutation({
    mutationFn: (decision: 'approve_guest' | 'approve_member' | 'reject') =>
      approveApplication(applicationId, { decision, reviewNotes }),
    onSuccess: () => {
      toast.success('Application processed successfully')
      onClose()
    },
  })

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-xl">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  const application = data?.application

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Application Review</SheetTitle>
          <SheetDescription>
            Review and approve or reject this application
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* User Info */}
          <div className="space-y-2">
            <h3 className="font-semibold">Applicant</h3>
            <div className="flex items-center gap-3">
              {application.profile.avatarUrl && (
                <img
                  src={application.profile.avatarUrl}
                  alt={application.profile.displayName}
                  className="h-12 w-12 rounded-full"
                />
              )}
              <div>
                <p className="font-medium">{application.profile.displayName}</p>
                <p className="text-sm text-muted-foreground">@{application.user.username}</p>
              </div>
            </div>
          </div>

          {/* Program */}
          <div className="space-y-2">
            <h3 className="font-semibold">Program</h3>
            <p>{application.program.name}</p>
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <h3 className="font-semibold">Goal</h3>
            <p className="text-sm">{application.goal}</p>
          </div>

          {/* Social Accounts */}
          {(application.profile.githubUsername ||
            application.profile.twitterUsername) && (
            <div className="space-y-2">
              <h3 className="font-semibold">Social Accounts</h3>
              <div className="space-y-1 text-sm">
                {application.profile.githubUsername && (
                  <p>GitHub: @{application.profile.githubUsername}</p>
                )}
                {application.profile.twitterUsername && (
                  <p>X: @{application.profile.twitterUsername}</p>
                )}
              </div>
            </div>
          )}

          {/* Review Notes */}
          <div className="space-y-2">
            <h3 className="font-semibold">Review Notes</h3>
            <Textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add notes about this review..."
              rows={4}
            />
          </div>

          {/* Actions */}
          {application.status === 'pending' && (
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => approveMutation.mutate('approve_member')}
                disabled={approveMutation.isPending}
                className="w-full"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve as Member
              </Button>
              <Button
                onClick={() => approveMutation.mutate('approve_guest')}
                disabled={approveMutation.isPending}
                variant="outline"
                className="w-full"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Approve as Guest
              </Button>
              <Button
                onClick={() => approveMutation.mutate('reject')}
                disabled={approveMutation.isPending}
                variant="destructive"
                className="w-full"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          )}

          {application.status !== 'pending' && (
            <div className="rounded-lg border bg-muted p-4">
              <p className="text-sm">
                This application was already reviewed on{' '}
                {new Date(application.reviewedAt).toLocaleDateString()}
              </p>
              {application.reviewNotes && (
                <p className="text-sm mt-2">Notes: {application.reviewNotes}</p>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

## ✅ Acceptance Criteria

- [ ] Admin can view list of all applications with filtering
- [ ] Admin can filter by status (pending, approved, rejected)
- [ ] Admin can filter by program
- [ ] Admin can view application details
- [ ] Admin can approve as guest or member
- [ ] Admin can reject application
- [ ] Admin can add review notes
- [ ] Applications list shows pagination
- [ ] Application status updates immediately after action

## 🧪 Testing

### E2E Test
```typescript
test('admin reviews application', async ({ page }) => {
  await page.goto('/admin/applications')

  // Filter to pending
  await page.selectOption('[name=status]', 'pending')

  // Click first application
  await page.click('tbody tr:first-child')

  // Review and approve as guest
  await page.fill('[name=reviewNotes]', 'Good application')
  await page.click('text=Approve as Guest')

  await expect(page.locator('text=processed successfully')).toBeVisible()
})
```

## 📝 Implementation Notes

- Use Tanstack Table for applications list with sorting
- Implement optimistic updates for better UX
- Cache application list queries for 5 minutes
- Invalidate queries after approval actions

## 📖 References

- [E3-T1: Database Schema](./E3-T1-database-schema-setup.md)
- [E3-T3: Guest Status](./E3-T3-guest-status-implementation.md)
- [EPIC-3-SCOPE.md](./EPIC-3-SCOPE.md)
