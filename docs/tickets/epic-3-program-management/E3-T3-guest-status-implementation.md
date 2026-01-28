# E3-T3: Guest Status Implementation

> **Epic**: E3 - Program Management
> **Status**: 🎯 Todo
> **Priority**: 🟡 High
> **Effort**: M (3 days - 1.5 backend + 1.5 frontend)
> **Dependencies**: E3-T1 (Database Schema), E3-T2 (Onboarding Flow)

## 📋 Overview

Implement the Guest status tier and member promotion system. Enable admins to approve applications as Guests (limited access) or fast-track to Members (full access). Implement progress-based promotion from Guest to Member status based on participation history.

**Account Status Flow:**
```
incomplete → pending → guest (Club Guest) → active (Full Member)
```

**Key Features:**
- Admin approval workflow (pending → guest or pending → active)
- Guest capabilities (browse, view, submit, participate, but limited)
- Member promotion based on progress (guest → active)
- Promotion API for admin-triggered upgrades
- UI indicators for status and capabilities
- Activity submission tracking with guest vs member distinction

## 🎯 Objectives

1. Implement admin application approval with status selection (guest vs member)
2. Create guest access control middleware
3. Implement member promotion endpoint
4. Build progress tracking for guest-to-member promotion
5. Create status indicator UI components
6. Add guest badges to submissions and activities
7. Implement capability-based UI (show/hide features by status)
8. Add promotion history tracking

## 📦 Deliverables

### Backend
- [ ] Application approval endpoint with status selection
- [ ] Guest access control middleware
- [ ] Member promotion endpoint
- [ ] Progress calculation logic for promotion eligibility
- [ ] Promotion history tracking (via metadata or separate table)
- [ ] Activity submission marking (guest vs member)
- [ ] Attendance tracking (admin only)

### Frontend
- [ ] Account status indicator component
- [ ] Capability-based component wrappers (e.g., `<MemberOnly>`, `<GuestRestricted>`)
- [ ] Guest badge component for submissions
- [ ] Promotion eligibility indicator (for admins)
- [ ] Status explanation modal/page
- [ ] Promotion request flow (admin-initiated)

### Documentation
- [ ] Guest vs Member capabilities reference
- [ ] Promotion criteria documentation
- [ ] Admin approval workflow guide

## 🔧 Technical Requirements

### Backend

#### Application Approval Endpoint

**File**: `src/app/api/admin/applications/[id]/approve/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { applications, users, program_enrollments } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { apiSuccess, apiError, apiValidationError, apiErrors } from '@/lib/api/response'

const approveApplicationSchema = z.object({
  decision: z.enum(['approve_guest', 'approve_member', 'reject']),
  reviewNotes: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get admin user from middleware
    const adminUserId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')

    if (!adminUserId || userRole !== 'admin') {
      return apiErrors.unauthorized()
    }

    const applicationId = params.id

    // Parse request body
    const body = await request.json()
    const result = approveApplicationSchema.safeParse(body)

    if (!result.success) {
      return apiValidationError(result.error)
    }

    const { decision, reviewNotes } = result.data

    // Fetch application
    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, applicationId))
      .limit(1)

    if (!application) {
      return apiErrors.notFound('Application')
    }

    if (application.status !== 'pending') {
      return apiError('Application has already been reviewed', {
        code: 'APPLICATION_ALREADY_REVIEWED',
        status: 400,
      })
    }

    // Process approval/rejection in transaction
    await db.transaction(async (tx) => {
      // Update application
      await tx
        .update(applications)
        .set({
          status: decision,
          reviewedBy: adminUserId,
          reviewedAt: new Date(),
          reviewNotes: reviewNotes || null,
          updatedAt: new Date(),
        })
        .where(eq(applications.id, applicationId))

      // Update user account status based on decision
      let newAccountStatus: 'guest' | 'active' | 'rejected'
      if (decision === 'approve_guest') {
        newAccountStatus = 'guest'
      } else if (decision === 'approve_member') {
        newAccountStatus = 'active'
      } else {
        newAccountStatus = 'rejected'
      }

      await tx
        .update(users)
        .set({
          accountStatus: newAccountStatus,
          updatedAt: new Date(),
        })
        .where(eq(users.id, application.userId))

      // If approved, create program enrollment
      if (decision === 'approve_guest' || decision === 'approve_member') {
        await tx.insert(program_enrollments).values({
          userId: application.userId,
          programId: application.programId,
          status: 'enrolled',
          enrolledAt: new Date(),
        })
      }
    })

    return apiSuccess(
      { application },
      { message: `Application ${decision === 'reject' ? 'rejected' : 'approved'} successfully` }
    )
  } catch (error) {
    console.error('Error approving application:', error)
    return apiErrors.internal()
  }
}
```

#### Member Promotion Endpoint

**File**: `src/app/api/admin/users/[id]/promote/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users, program_enrollments } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { apiSuccess, apiError, apiValidationError, apiErrors } from '@/lib/api/response'

const promoteUserSchema = z.object({
  programEnrollmentId: z.string().uuid('Invalid enrollment ID'),
  promotionNotes: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get admin user from middleware
    const adminUserId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')

    if (!adminUserId || userRole !== 'admin') {
      return apiErrors.unauthorized()
    }

    const userId = params.id

    // Parse request body
    const body = await request.json()
    const result = promoteUserSchema.safeParse(body)

    if (!result.success) {
      return apiValidationError(result.error)
    }

    const { programEnrollmentId, promotionNotes } = result.data

    // Fetch user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) {
      return apiErrors.notFound('User')
    }

    if (user.accountStatus !== 'guest') {
      return apiError('User must be a guest to be promoted to member', {
        code: 'INVALID_STATUS_FOR_PROMOTION',
        status: 400,
      })
    }

    // Verify enrollment exists
    const [enrollment] = await db
      .select()
      .from(program_enrollments)
      .where(
        and(
          eq(program_enrollments.id, programEnrollmentId),
          eq(program_enrollments.userId, userId)
        )
      )
      .limit(1)

    if (!enrollment) {
      return apiErrors.notFound('Program enrollment')
    }

    // Promote user in transaction
    await db.transaction(async (tx) => {
      // Update user status to active
      await tx
        .update(users)
        .set({
          accountStatus: 'active',
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))

      // Update enrollment with promotion timestamp and notes
      const updatedMetadata = {
        ...(enrollment.metadata as object),
        promotedAt: new Date().toISOString(),
        promotedBy: adminUserId,
        promotionNotes: promotionNotes || null,
      }

      await tx
        .update(program_enrollments)
        .set({
          promotedAt: new Date(),
          metadata: updatedMetadata,
          updatedAt: new Date(),
        })
        .where(eq(program_enrollments.id, programEnrollmentId))
    })

    return apiSuccess(
      { user: { ...user, accountStatus: 'active' } },
      { message: 'User promoted to member successfully' }
    )
  } catch (error) {
    console.error('Error promoting user:', error)
    return apiErrors.internal()
  }
}
```

#### Guest Access Control Middleware

**File**: `src/middleware/guest-access.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

/**
 * Guest access control
 *
 * Guest capabilities:
 * - ✅ Browse talent directory
 * - ✅ View activities
 * - ✅ Submit to activities (marked as guest)
 * - ✅ Participate in bounties
 * - ✅ Attend program sessions
 * - ❌ Mark attendance (admin only)
 * - ❌ Admin features
 * - ❌ Voting rights
 */

const GUEST_ALLOWED_ROUTES = [
  '/api/profiles', // Browse directory
  '/api/activities', // View activities
  '/api/submissions', // Submit work
  '/api/bounties', // View and participate in bounties
  '/api/programs', // View program details
]

const GUEST_RESTRICTED_ROUTES = [
  '/api/admin/', // All admin routes
  '/api/attendance/mark', // Mark attendance
  '/api/votes/', // Voting (future)
]

export function checkGuestAccess(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname
  const userStatus = request.headers.get('x-user-status')

  // If not a guest, allow access
  if (userStatus !== 'guest') {
    return true
  }

  // Check if route is explicitly restricted for guests
  const isRestricted = GUEST_RESTRICTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  if (isRestricted) {
    return false
  }

  // Check if route is in allowed list
  const isAllowed = GUEST_ALLOWED_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  return isAllowed
}

export function guestAccessMiddleware(request: NextRequest): NextResponse | null {
  const hasAccess = checkGuestAccess(request)

  if (!hasAccess) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Guest users do not have access to this resource',
          code: 'GUEST_ACCESS_RESTRICTED',
        },
      },
      { status: 403 }
    )
  }

  return null // Continue to next middleware/route
}
```

#### Progress Calculation for Promotion

**File**: `src/lib/promotion/calculate-eligibility.ts`

```typescript
import { db } from '@/lib/db'
import { program_enrollments, activity_submissions, attendance } from '@/lib/db/schema'
import { eq, and, count, sql } from 'drizzle-orm'

export interface PromotionEligibility {
  isEligible: boolean
  criteria: {
    attendanceCount: number
    attendanceRequired: number
    submissionCount: number
    submissionRequired: number
    qualityScore: number
    qualityRequired: number
  }
  reasons: string[]
}

/**
 * Calculate promotion eligibility for a guest user
 *
 * Criteria:
 * - Minimum 5 attended sessions
 * - Minimum 3 quality submissions
 * - Average submission score >= 70%
 * - Consistent participation (no gaps >2 weeks)
 */
export async function calculatePromotionEligibility(
  userId: string,
  programEnrollmentId: string
): Promise<PromotionEligibility> {
  const reasons: string[] = []

  // Fetch enrollment
  const [enrollment] = await db
    .select()
    .from(program_enrollments)
    .where(eq(program_enrollments.id, programEnrollmentId))
    .limit(1)

  if (!enrollment) {
    throw new Error('Program enrollment not found')
  }

  // Count attendance records
  const attendanceResult = await db
    .select({ count: count() })
    .from(attendance)
    .where(
      and(
        eq(attendance.userId, userId),
        eq(attendance.status, 'present')
      )
    )

  const attendanceCount = attendanceResult[0]?.count || 0
  const attendanceRequired = 5

  if (attendanceCount < attendanceRequired) {
    reasons.push(`Need ${attendanceRequired - attendanceCount} more attended sessions`)
  }

  // Count submissions
  const submissionResult = await db
    .select({ count: count() })
    .from(activity_submissions)
    .where(
      and(
        eq(activity_submissions.userId, userId),
        eq(activity_submissions.status, 'approved')
      )
    )

  const submissionCount = submissionResult[0]?.count || 0
  const submissionRequired = 3

  if (submissionCount < submissionRequired) {
    reasons.push(`Need ${submissionRequired - submissionCount} more approved submissions`)
  }

  // Calculate quality score (average of approved submissions)
  const qualityResult = await db
    .select({
      avgScore: sql<number>`AVG(CAST(metadata->>'score' AS NUMERIC))`,
    })
    .from(activity_submissions)
    .where(
      and(
        eq(activity_submissions.userId, userId),
        eq(activity_submissions.status, 'approved')
      )
    )

  const qualityScore = qualityResult[0]?.avgScore || 0
  const qualityRequired = 70

  if (qualityScore < qualityRequired) {
    reasons.push(`Quality score ${qualityScore.toFixed(1)}% is below ${qualityRequired}%`)
  }

  // Check participation consistency (no gaps >2 weeks)
  // This would require more complex date range queries, simplified for MVP

  const isEligible =
    attendanceCount >= attendanceRequired &&
    submissionCount >= submissionRequired &&
    qualityScore >= qualityRequired

  return {
    isEligible,
    criteria: {
      attendanceCount,
      attendanceRequired,
      submissionCount,
      submissionRequired,
      qualityScore,
      qualityRequired,
    },
    reasons,
  }
}
```

### Frontend

#### Account Status Indicator Component

**File**: `src/components/common/account-status-badge.tsx`

```typescript
'use client'

import { Badge } from '@/components/ui/badge'
import { HelpCircle, UserCheck, UserX, Clock, Shield } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface AccountStatusBadgeProps {
  status: 'incomplete' | 'pending' | 'guest' | 'active' | 'rejected'
  showTooltip?: boolean
  className?: string
}

const STATUS_CONFIG = {
  incomplete: {
    label: 'Perfil Incompleto',
    icon: HelpCircle,
    variant: 'secondary' as const,
    description: 'Completa tu perfil para aplicar a un programa',
  },
  pending: {
    label: 'En Revisión',
    icon: Clock,
    variant: 'default' as const,
    description: 'Tu aplicación está siendo revisada por los administradores',
  },
  guest: {
    label: 'Club Guest',
    icon: UserCheck,
    variant: 'outline' as const,
    description:
      'Acceso limitado a la plataforma. Demuestra tu participación para convertirte en Miembro',
  },
  active: {
    label: 'Miembro',
    icon: Shield,
    variant: 'default' as const,
    description: 'Acceso completo a todas las funciones de la plataforma',
  },
  rejected: {
    label: 'Rechazado',
    icon: UserX,
    variant: 'destructive' as const,
    description: 'Tu aplicación fue rechazada. Contacta a los administradores para más información',
  },
}

export function AccountStatusBadge({
  status,
  showTooltip = true,
  className,
}: AccountStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  const badge = (
    <Badge variant={config.variant} className={className}>
      <Icon className="mr-1.5 h-3 w-3" />
      {config.label}
    </Badge>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-sm">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

#### Capability-Based Component Wrapper

**File**: `src/components/common/member-only.tsx`

```typescript
'use client'

import { ReactNode } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Shield } from 'lucide-react'

interface MemberOnlyProps {
  children: ReactNode
  fallback?: ReactNode
  showMessage?: boolean
}

/**
 * Wrapper component that only renders children if user is a full member (active status)
 * Shows upgrade message for guests by default
 */
export function MemberOnly({ children, fallback, showMessage = true }: MemberOnlyProps) {
  const { user } = useAuthStore()

  if (!user) {
    return null
  }

  if (user.accountStatus === 'active') {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (showMessage && user.accountStatus === 'guest') {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Solo para Miembros</AlertTitle>
        <AlertDescription>
          Esta función está disponible solo para miembros completos. Sigue participando en
          actividades y asistiendo a sesiones para ser promovido a Miembro.
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
```

**File**: `src/components/common/guest-restricted.tsx`

```typescript
'use client'

import { ReactNode } from 'react'
import { useAuthStore } from '@/store/auth-store'

interface GuestRestrictedProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Wrapper component that hides children for guest users
 * Useful for features guests shouldn't see at all
 */
export function GuestRestricted({ children, fallback }: GuestRestrictedProps) {
  const { user } = useAuthStore()

  if (!user || user.accountStatus === 'guest') {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}
```

#### Guest Badge for Submissions

**File**: `src/components/common/guest-badge.tsx`

```typescript
'use client'

import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface GuestBadgeProps {
  showTooltip?: boolean
  size?: 'sm' | 'md'
}

export function GuestBadge({ showTooltip = true, size = 'sm' }: GuestBadgeProps) {
  const badge = (
    <Badge variant="outline" className={size === 'sm' ? 'text-xs' : ''}>
      <Users className={`mr-1 ${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`} />
      Guest
    </Badge>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">Enviado mientras el usuario era Club Guest</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

#### Promotion Eligibility Indicator (Admin)

**File**: `src/components/admin/promotion-eligibility-card.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, XCircle, Loader2, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

interface PromotionEligibilityCardProps {
  userId: string
  programEnrollmentId: string
  onPromote?: () => void
}

interface EligibilityData {
  isEligible: boolean
  criteria: {
    attendanceCount: number
    attendanceRequired: number
    submissionCount: number
    submissionRequired: number
    qualityScore: number
    qualityRequired: number
  }
  reasons: string[]
}

export function PromotionEligibilityCard({
  userId,
  programEnrollmentId,
  onPromote,
}: PromotionEligibilityCardProps) {
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPromoting, setIsPromoting] = useState(false)

  useEffect(() => {
    async function fetchEligibility() {
      try {
        const response = await fetch(
          `/api/admin/users/${userId}/eligibility?enrollmentId=${programEnrollmentId}`
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error?.message || 'Failed to fetch eligibility')
        }

        setEligibility(data.data)
      } catch (error) {
        console.error('Error fetching eligibility:', error)
        toast.error('Error al cargar elegibilidad para promoción')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEligibility()
  }, [userId, programEnrollmentId])

  const handlePromote = async () => {
    setIsPromoting(true)

    try {
      const response = await fetch(`/api/admin/users/${userId}/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programEnrollmentId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to promote user')
      }

      toast.success('Usuario promovido a Miembro exitosamente')
      onPromote?.()
    } catch (error) {
      console.error('Error promoting user:', error)
      toast.error(
        error instanceof Error ? error.message : 'Error al promover usuario'
      )
    } finally {
      setIsPromoting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!eligibility) {
    return null
  }

  const attendanceProgress =
    (eligibility.criteria.attendanceCount / eligibility.criteria.attendanceRequired) * 100
  const submissionProgress =
    (eligibility.criteria.submissionCount / eligibility.criteria.submissionRequired) * 100
  const qualityProgress =
    (eligibility.criteria.qualityScore / eligibility.criteria.qualityRequired) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Elegibilidad para Promoción
            </CardTitle>
            <CardDescription>
              Progreso del usuario hacia membresía completa
            </CardDescription>
          </div>
          <Badge variant={eligibility.isEligible ? 'default' : 'secondary'}>
            {eligibility.isEligible ? 'Elegible' : 'No Elegible'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Attendance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Asistencia a Sesiones</span>
            <span className="text-muted-foreground">
              {eligibility.criteria.attendanceCount} / {eligibility.criteria.attendanceRequired}
            </span>
          </div>
          <Progress value={Math.min(attendanceProgress, 100)} />
        </div>

        {/* Submissions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Entregas Aprobadas</span>
            <span className="text-muted-foreground">
              {eligibility.criteria.submissionCount} / {eligibility.criteria.submissionRequired}
            </span>
          </div>
          <Progress value={Math.min(submissionProgress, 100)} />
        </div>

        {/* Quality Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Calidad Promedio</span>
            <span className="text-muted-foreground">
              {eligibility.criteria.qualityScore.toFixed(1)}% /{' '}
              {eligibility.criteria.qualityRequired}%
            </span>
          </div>
          <Progress value={Math.min(qualityProgress, 100)} />
        </div>

        {/* Reasons (if not eligible) */}
        {!eligibility.isEligible && eligibility.reasons.length > 0 && (
          <div className="space-y-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
            <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
              Requisitos Pendientes:
            </h4>
            <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
              {eligibility.reasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-2">
                  <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Promote Button */}
        {eligibility.isEligible && (
          <Button
            onClick={handlePromote}
            disabled={isPromoting}
            className="w-full"
          >
            {isPromoting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Promoviendo...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Promover a Miembro
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
```

#### Status Explanation Modal

**File**: `src/components/common/status-explanation-dialog.tsx`

```typescript
'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { HelpCircle, CheckCircle2, XCircle } from 'lucide-react'

interface StatusExplanationDialogProps {
  children?: React.ReactNode
}

export function StatusExplanationDialog({ children }: StatusExplanationDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            <HelpCircle className="mr-2 h-4 w-4" />
            ¿Qué significa mi estado?
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Estados de Cuenta en Poktapok</DialogTitle>
          <DialogDescription>
            Comprende los diferentes niveles de acceso y cómo progresar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Incomplete */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Perfil Incompleto</h3>
            <p className="text-sm text-muted-foreground">
              Has iniciado sesión pero aún no has completado tu perfil ni aplicado a un programa.
            </p>
            <div className="space-y-1 text-sm">
              <p className="font-medium">Siguiente paso:</p>
              <p>Completa tu perfil y aplica a un programa para comenzar.</p>
            </div>
          </div>

          {/* Pending */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">En Revisión</h3>
            <p className="text-sm text-muted-foreground">
              Tu aplicación fue enviada y está siendo revisada por los administradores.
            </p>
            <div className="space-y-2 text-sm">
              <p className="font-medium">Qué esperar:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Revisión en 2-3 días hábiles</li>
                <li>Notificación por email cuando sea aprobada</li>
                <li>Acceso limitado mientras esperas</li>
              </ul>
            </div>
          </div>

          {/* Guest */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Club Guest</h3>
            <p className="text-sm text-muted-foreground">
              Tienes acceso limitado a la plataforma. Demuestra tu compromiso para convertirte
              en Miembro completo.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Puedes:
                </p>
                <ul className="ml-6 list-disc space-y-1 text-sm">
                  <li>Ver el directorio de talentos</li>
                  <li>Ver actividades y programas</li>
                  <li>Enviar entregas (marcadas como guest)</li>
                  <li>Participar en bounties</li>
                  <li>Asistir a sesiones</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <XCircle className="h-4 w-4 text-red-600" />
                  No puedes:
                </p>
                <ul className="ml-6 list-disc space-y-1 text-sm">
                  <li>Marcar asistencia (solo admins)</li>
                  <li>Acceder a funciones de admin</li>
                  <li>Votar (futuro)</li>
                  <li>Algunas funciones de miembros</li>
                </ul>
              </div>
            </div>
            <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
              <p className="font-medium text-sm">Cómo ser promovido a Miembro:</p>
              <ul className="ml-6 list-disc space-y-1 text-sm">
                <li>Asistir a al menos 5 sesiones</li>
                <li>Completar 3+ entregas de calidad</li>
                <li>Mantener calidad promedio ≥70%</li>
                <li>Participación consistente</li>
              </ul>
            </div>
          </div>

          {/* Active/Member */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Miembro</h3>
            <p className="text-sm text-muted-foreground">
              Acceso completo a todas las funciones de la plataforma. Has demostrado tu
              compromiso con la comunidad.
            </p>
            <div className="space-y-2 text-sm">
              <p className="font-medium">Beneficios adicionales:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Todas las capacidades de Guest</li>
                <li>Derechos de voto (futuro)</li>
                <li>Prioridad para oportunidades</li>
                <li>Acceso a red de alumni (futuro)</li>
                <li>Posibilidad de referir usuarios</li>
              </ul>
            </div>
          </div>

          {/* Rejected */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Rechazado</h3>
            <p className="text-sm text-muted-foreground">
              Tu aplicación no fue aprobada en esta ocasión.
            </p>
            <div className="space-y-1 text-sm">
              <p className="font-medium">Siguiente paso:</p>
              <p>
                Contacta a los administradores para entender las razones y cómo puedes mejorar
                tu aplicación para una futura resubmisión.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

## ✅ Acceptance Criteria

### Functional Requirements
- [ ] Admin can approve applications as Guest or Member
- [ ] Admin can reject applications
- [ ] Guest users have limited platform access (browse, view, submit, participate)
- [ ] Guest users cannot mark attendance or access admin features
- [ ] Guest submissions are marked with guest badge
- [ ] Admin can promote Guest users to Member status
- [ ] Promotion eligibility is calculated based on participation metrics
- [ ] Promotion history is tracked
- [ ] Status badge displays correctly on user profiles
- [ ] Capability-based UI components show/hide features appropriately

### Non-Functional Requirements
- [ ] Approval/promotion endpoints respond within 2 seconds
- [ ] Access control middleware adds <10ms latency
- [ ] Status indicators render without flickering
- [ ] Promotion eligibility calculations complete within 1 second
- [ ] Guest restrictions are enforced at API level (not just UI)

### Testing Requirements
- [ ] Unit tests for eligibility calculation logic
- [ ] Integration tests for approval and promotion endpoints
- [ ] E2E tests for guest user journey
- [ ] Manual testing of all guest restrictions

## 🔗 Dependencies

### Blocks
- E3-T4: Admin Applications Queue (needs approval endpoint)
- E3-T6: Program Dashboard (needs status indicators)

### Blocked By
- E3-T1: Database Schema Setup (REQUIRED)
- E3-T2: Onboarding Flow Implementation (creates applications)

### Related
- E3-T5: Admin Attendance Management (attendance affects promotion)

## 🧪 Testing Plan

### Unit Tests

**File**: `src/lib/promotion/__tests__/calculate-eligibility.test.ts`

```typescript
import { calculatePromotionEligibility } from '../calculate-eligibility'
import { db } from '@/lib/db'

jest.mock('@/lib/db')

describe('calculatePromotionEligibility', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns eligible when all criteria met', async () => {
    // Mock 6 attendance, 4 submissions, 75% quality
    ;(db.select as jest.Mock)
      .mockResolvedValueOnce([{ count: 6 }]) // attendance
      .mockResolvedValueOnce([{ count: 4 }]) // submissions
      .mockResolvedValueOnce([{ avgScore: 75 }]) // quality

    const result = await calculatePromotionEligibility('user-id', 'enrollment-id')

    expect(result.isEligible).toBe(true)
    expect(result.reasons).toHaveLength(0)
  })

  it('returns not eligible with insufficient attendance', async () => {
    ;(db.select as jest.Mock)
      .mockResolvedValueOnce([{ count: 3 }]) // attendance
      .mockResolvedValueOnce([{ count: 4 }]) // submissions
      .mockResolvedValueOnce([{ avgScore: 75 }]) // quality

    const result = await calculatePromotionEligibility('user-id', 'enrollment-id')

    expect(result.isEligible).toBe(false)
    expect(result.reasons).toContain('Need 2 more attended sessions')
  })

  it('returns not eligible with low quality score', async () => {
    ;(db.select as jest.Mock)
      .mockResolvedValueOnce([{ count: 6 }]) // attendance
      .mockResolvedValueOnce([{ count: 4 }]) // submissions
      .mockResolvedValueOnce([{ avgScore: 60 }]) // quality

    const result = await calculatePromotionEligibility('user-id', 'enrollment-id')

    expect(result.isEligible).toBe(false)
    expect(result.reasons).toContain('Quality score 60.0% is below 70%')
  })
})
```

### Integration Tests

**File**: `src/app/api/admin/users/[id]/promote/__tests__/route.test.ts`

```typescript
import { POST } from '../route'
import { db } from '@/lib/db'

jest.mock('@/lib/db')

describe('POST /api/admin/users/[id]/promote', () => {
  it('promotes guest user to member', async () => {
    const mockRequest = new Request('http://localhost/api/admin/users/user-id/promote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'admin-id',
        'x-user-role': 'admin',
      },
      body: JSON.stringify({ programEnrollmentId: 'enrollment-id' }),
    })

    ;(db.select as jest.Mock)
      .mockResolvedValueOnce([{ id: 'user-id', accountStatus: 'guest' }])
      .mockResolvedValueOnce([{ id: 'enrollment-id', userId: 'user-id' }])
    ;(db.transaction as jest.Mock).mockResolvedValueOnce({})

    const response = await POST(mockRequest, { params: { id: 'user-id' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toContain('promoted')
  })

  it('rejects promotion if user is not guest', async () => {
    const mockRequest = new Request('http://localhost/api/admin/users/user-id/promote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'admin-id',
        'x-user-role': 'admin',
      },
      body: JSON.stringify({ programEnrollmentId: 'enrollment-id' }),
    })

    ;(db.select as jest.Mock).mockResolvedValueOnce([
      { id: 'user-id', accountStatus: 'active' },
    ])

    const response = await POST(mockRequest, { params: { id: 'user-id' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('INVALID_STATUS_FOR_PROMOTION')
  })
})
```

### E2E Tests

**File**: `tests/e2e/guest-user-journey.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Guest User Journey', () => {
  test('guest can view but not access member features', async ({ page }) => {
    // Login as guest user
    await page.goto('/profile')

    // Verify guest badge is visible
    await expect(page.locator('text=Club Guest')).toBeVisible()

    // Can view directory
    await page.goto('/directory')
    await expect(page.locator('text=Talent Directory')).toBeVisible()

    // Can view activities
    await page.goto('/activities')
    await expect(page.locator('text=Actividades')).toBeVisible()

    // Cannot access admin features
    await page.goto('/admin')
    await expect(page.locator('text=Guest users do not have access')).toBeVisible()
  })

  test('admin can promote guest to member', async ({ page }) => {
    // Login as admin
    await page.goto('/admin/applications')

    // Find guest user
    await page.click('text=testguestuser')

    // Verify eligibility card
    await expect(page.locator('text=Elegibilidad para Promoción')).toBeVisible()

    // If eligible, promote button is visible
    const promoteButton = page.locator('text=Promover a Miembro')
    if (await promoteButton.isVisible()) {
      await promoteButton.click()
      await expect(page.locator('text=promovido exitosamente')).toBeVisible()
    }
  })

  test('guest submission shows guest badge', async ({ page }) => {
    // Login as guest user
    await page.goto('/activities/1')

    // Submit work
    await page.fill('[name=submissionContent]', 'My submission as a guest')
    await page.click('text=Enviar')

    // Verify submission has guest badge
    await page.goto('/my-submissions')
    await expect(page.locator('text=Guest').first()).toBeVisible()
  })
})
```

### Manual Testing Checklist
- [ ] Admin approves application as Guest → user receives guest status
- [ ] Admin approves application as Member → user receives active status
- [ ] Admin rejects application → user receives rejected status
- [ ] Guest user can browse directory
- [ ] Guest user can view activities
- [ ] Guest user can submit to activities (marked as guest)
- [ ] Guest user cannot access admin routes
- [ ] Guest user cannot mark attendance
- [ ] Status badge displays correctly on profile
- [ ] MemberOnly wrapper hides content for guests
- [ ] GuestRestricted wrapper hides content for guests
- [ ] Promotion eligibility card shows correct criteria
- [ ] Promotion eligibility card calculates progress correctly
- [ ] Admin can promote eligible guest to member
- [ ] Status explanation dialog shows all states correctly
- [ ] Mobile responsive (320px, 768px, 1920px widths)

## 📝 Implementation Notes

### Architecture Decisions

1. **Three-Tier Status System**: incomplete → pending → guest → active provides gradual access and validates user commitment
2. **Middleware-Based Access Control**: Guest restrictions enforced at API level using middleware, not just UI hiding
3. **Flexible Promotion Criteria**: Eligibility calculation is centralized and can be adjusted without code changes
4. **Progress Tracking in Metadata**: Promotion history stored in enrollment metadata for flexibility
5. **Component-Based Capability Control**: `<MemberOnly>` and `<GuestRestricted>` wrappers provide declarative access control

### Code Organization

```
src/
├── app/api/
│   └── admin/
│       ├── applications/[id]/approve/
│       │   └── route.ts              # Application approval
│       └── users/[id]/
│           ├── promote/
│           │   └── route.ts          # Member promotion
│           └── eligibility/
│               └── route.ts          # Eligibility calculation
├── components/
│   ├── common/
│   │   ├── account-status-badge.tsx  # Status indicator
│   │   ├── guest-badge.tsx           # Guest submission badge
│   │   ├── member-only.tsx           # Member-only wrapper
│   │   ├── guest-restricted.tsx      # Guest-restricted wrapper
│   │   └── status-explanation-dialog.tsx # Status help
│   └── admin/
│       └── promotion-eligibility-card.tsx # Admin promotion UI
├── middleware/
│   └── guest-access.ts               # Guest access control
└── lib/
    └── promotion/
        └── calculate-eligibility.ts  # Eligibility logic
```

### Known Limitations

1. **Manual Promotion Trigger**: Admins must manually promote eligible guests; no automatic promotion
2. **Simple Eligibility Criteria**: Uses basic metrics; could be enhanced with more sophisticated scoring
3. **No Progress Notifications**: Guests aren't notified when they become eligible for promotion
4. **Static Promotion Requirements**: Criteria are hardcoded; future could make configurable per program

## 🚀 Deployment

### Environment Variables
No new environment variables required.

### Database Migrations
```bash
# Already created in E3-T1, verify schema
bun run scripts/verify-migration.ts
```

### Post-Deployment Verification
- [ ] Application approval endpoint works for all statuses
- [ ] Guest access middleware correctly restricts routes
- [ ] Member promotion endpoint updates status
- [ ] Eligibility calculation returns correct results
- [ ] Status badges render correctly
- [ ] Capability wrappers show/hide content appropriately
- [ ] No errors in production logs

## 📚 Documentation

### Files to Update
- [ ] Document guest vs member capabilities in user guide
- [ ] Add promotion criteria to FAQ
- [ ] Update admin guide with approval workflow
- [ ] Add status explanation to onboarding docs
- [ ] Update [CLAUDE.md](../../../CLAUDE.md) with access control patterns

### Documentation Content

**Guest vs Member Capabilities Reference** (add to user guide):

```markdown
## Account Status Tiers

### Club Guest
**How to get**: Complete onboarding and get approved by admins

**Capabilities**:
- ✅ Browse talent directory
- ✅ View activities and programs
- ✅ Submit work to activities (marked as guest)
- ✅ Participate in bounties
- ✅ Attend program sessions
- ❌ Mark attendance (admin only)
- ❌ Access admin features
- ❌ Voting rights (future)

**Goal**: Build participation history to be promoted to Member

### Full Member
**How to get**: Demonstrate consistent participation as Guest

**Promotion Criteria**:
- Attend 5+ program sessions
- Complete 3+ quality submissions
- Maintain 70%+ average quality score
- Consistent participation (no gaps >2 weeks)

**Additional Capabilities**:
- All Guest capabilities
- Voting rights (future)
- Priority for opportunities
- Alumni network access (future)
- Referral privileges
```

## 🔄 Future Iterations

### Phase 1 (This Ticket)
- Guest status tier implementation
- Admin approval with status selection
- Member promotion endpoint
- Basic eligibility calculation
- Status indicators and capability wrappers

### Phase 2 (Future)
- Automatic promotion notifications
- Progress dashboard for guests
- Configurable promotion criteria per program
- Gamification of promotion progress
- Guest onboarding tour

### Phase 3 (Future)
- Advanced eligibility scoring with ML
- Community reputation system
- Peer review for promotion validation
- Automated promotion for high performers
- Status history timeline

## 📖 References

- **Discovery Questions**: [program-discovery-questions.md](../../design/program-discovery-questions.md)
- **Epic Scope**: [EPIC-3-SCOPE.md](./EPIC-3-SCOPE.md)
- **Implementation Workflow**: [IMPLEMENTATION-WORKFLOW.md](./IMPLEMENTATION-WORKFLOW.md)
- **Related Tickets**:
  - [E3-T1: Database Schema Setup](./E3-T1-database-schema-setup.md)
  - [E3-T2: Onboarding Flow Implementation](./E3-T2-onboarding-flow-implementation.md)

---

## 📊 Progress Tracking

### Milestones
- [ ] Planning and design complete
- [ ] Backend approval endpoint implemented
- [ ] Backend promotion endpoint implemented
- [ ] Guest access middleware implemented
- [ ] Eligibility calculation logic complete
- [ ] Frontend status indicators created
- [ ] Frontend capability wrappers created
- [ ] Testing complete
- [ ] Documentation complete
- [ ] Code review complete
- [ ] Deployed to staging
- [ ] Deployed to production

### Time Tracking
- **Estimated**: 24 hours (3 days)
- **Actual**: ___ hours
- **Variance**: ___ hours

### Notes and Blockers
- **[Date]**: Note or blocker description
- **[Date]**: Resolution or update
