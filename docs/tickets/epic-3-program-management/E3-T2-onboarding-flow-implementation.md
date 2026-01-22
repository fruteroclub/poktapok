# E3-T2: Onboarding Flow Implementation

> **Epic**: E3 - Program Management
> **Status**: 🎯 Todo
> **Priority**: 🔴 Critical
> **Effort**: M (2 days)
> **Dependencies**: E3-T1 (Database Schema Setup - BLOCKING)

## 📋 Overview

Enhance the onboarding flow to include program selection and goal commitment. Transform the current simple profile completion into a comprehensive application process that captures user intent, program choice, and commitment goals while maintaining a smooth UX.

**Current Flow:**
```
Email → Username → Display Name → Bio → Avatar → Complete
```

**New Flow:**
```
Email → Username → Display Name → Bio → Avatar
→ Choose Program → Set Goal → Link Social Accounts (GitHub, X) → Apply/Submit
→ Status: pending (awaiting admin review)
```

## 🎯 Objectives

1. Extend onboarding form to capture program selection and goal commitment
2. Implement program selection UI with program details display
3. Create goal input component with validation (1-280 characters)
4. Add social account linking (GitHub, Twitter/X)
5. Update applications table with new fields
6. Create application submission endpoint
7. Handle pending status post-onboarding
8. Ensure smooth multi-step form UX

## 📦 Deliverables

### Backend
- [ ] Update applications table schema with program_id, goal fields
- [ ] Create `POST /api/applications` endpoint (application submission)
- [ ] Create `GET /api/programs/active` endpoint (list available programs)
- [ ] Implement application validation logic
- [ ] Add social account fields to user profile
- [ ] Update user status to 'pending' after application

### Frontend
- [ ] Create `ProgramSelector` component (program selection with details)
- [ ] Create `GoalInput` component (goal commitment with character count)
- [ ] Create `SocialAccountsForm` component (GitHub, X linking)
- [ ] Update `OnboardingForm` to multi-step flow
- [ ] Create onboarding progress indicator component
- [ ] Implement form state management across steps
- [ ] Add validation for each step
- [ ] Create application submission flow

### Documentation
- [ ] Update onboarding flow documentation
- [ ] Document application submission process
- [ ] Create user guide for program selection

## 🔧 Technical Requirements

### Backend

#### Database Schema Update

**File**: `drizzle/schema/applications.ts`

```typescript
import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { timestamps, metadata } from './utils'
import { users } from './users'
import { programs } from './programs'

export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  programId: uuid('program_id')
    .notNull()
    .references(() => programs.id, { onDelete: 'restrict' }),

  // Goal commitment
  goal: text('goal').notNull(), // 1-280 characters, validated at API level

  // Status tracking
  status: varchar('status', { length: 50 })
    .notNull()
    .default('pending'), // 'pending' | 'approved_guest' | 'approved_member' | 'rejected'

  // Review fields (populated by admin)
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  reviewNotes: text('review_notes'),

  ...timestamps,
  ...metadata,
})

// Relations
export const applicationsRelations = relations(applications, ({ one }) => ({
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
  program: one(programs, {
    fields: [applications.programId],
    references: [programs.id],
  }),
  reviewer: one(users, {
    fields: [applications.reviewedBy],
    references: [users.id],
  }),
}))
```

**Update**: `drizzle/schema/profiles.ts`

```typescript
export const profiles = pgTable('profiles', {
  // ... existing fields ...

  // Social accounts
  githubUsername: varchar('github_username', { length: 100 }),
  twitterUsername: varchar('twitter_username', { length: 100 }), // X/Twitter handle
  linkedinUrl: varchar('linkedin_url', { length: 500 }),
  telegramUsername: varchar('telegram_username', { length: 100 }),

  // ... rest of schema ...
})
```

#### API Endpoints

**1. Get Active Programs**

**File**: `src/app/api/programs/active/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { programs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { apiSuccess, apiError } from '@/lib/api/response'

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
    return apiError('Failed to fetch programs', { status: 500 })
  }
}
```

**2. Submit Application**

**File**: `src/app/api/applications/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { applications, users, programs } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { apiSuccess, apiError, apiValidationError, apiErrors } from '@/lib/api/response'

const applicationSchema = z.object({
  programId: z.string().uuid('Invalid program ID'),
  goal: z.string()
    .min(1, 'Goal is required')
    .max(280, 'Goal must not exceed 280 characters'),
  githubUsername: z.string().optional(),
  twitterUsername: z.string().optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  telegramUsername: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from middleware
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return apiErrors.unauthorized()
    }

    // Parse and validate request body
    const body = await request.json()
    const result = applicationSchema.safeParse(body)

    if (!result.success) {
      return apiValidationError(result.error)
    }

    const { programId, goal, githubUsername, twitterUsername, linkedinUrl, telegramUsername } = result.data

    // Verify user exists and is in 'incomplete' status
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) {
      return apiErrors.notFound('User')
    }

    if (user.accountStatus !== 'incomplete') {
      return apiError('User has already submitted an application', {
        code: 'APPLICATION_ALREADY_SUBMITTED',
        status: 400,
      })
    }

    // Verify program exists and is active
    const [program] = await db
      .select()
      .from(programs)
      .where(and(
        eq(programs.id, programId),
        eq(programs.isActive, true)
      ))
      .limit(1)

    if (!program) {
      return apiErrors.notFound('Program')
    }

    // Check for existing application (shouldn't happen, but safety check)
    const [existingApplication] = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId))
      .limit(1)

    if (existingApplication) {
      return apiError('Application already exists', {
        code: 'DUPLICATE_APPLICATION',
        status: 409,
      })
    }

    // Create application in transaction
    const result = await db.transaction(async (tx) => {
      // Create application
      const [application] = await tx
        .insert(applications)
        .values({
          userId,
          programId,
          goal,
          status: 'pending',
        })
        .returning()

      // Update user status to pending
      await tx
        .update(users)
        .set({
          accountStatus: 'pending',
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))

      // Update profile with social accounts
      const profileUpdates: any = { updatedAt: new Date() }
      if (githubUsername) profileUpdates.githubUsername = githubUsername
      if (twitterUsername) profileUpdates.twitterUsername = twitterUsername
      if (linkedinUrl) profileUpdates.linkedinUrl = linkedinUrl
      if (telegramUsername) profileUpdates.telegramUsername = telegramUsername

      await tx
        .update(profiles)
        .set(profileUpdates)
        .where(eq(profiles.userId, userId))

      return { application }
    })

    return apiSuccess(
      { application: result.application },
      { message: 'Application submitted successfully' }
    )
  } catch (error) {
    console.error('Error submitting application:', error)
    return apiErrors.internal()
  }
}
```

### Frontend

#### 1. Program Selector Component

**File**: `src/components/onboarding/program-selector.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Calendar, Infinity } from 'lucide-react'

interface Program {
  id: string
  name: string
  description: string
  programType: 'cohort' | 'evergreen'
  startDate?: string
  endDate?: string
}

interface ProgramSelectorProps {
  value: string
  onChange: (programId: string) => void
  error?: string
}

export function ProgramSelector({ value, onChange, error }: ProgramSelectorProps) {
  const [programs, setPrograms] = useState<Program[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const response = await fetch('/api/programs/active')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error?.message || 'Failed to fetch programs')
        }

        setPrograms(data.data.programs)
      } catch (err) {
        console.error('Error fetching programs:', err)
        setFetchError(err instanceof Error ? err.message : 'Failed to load programs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrograms()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Cargando programas...</span>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm text-destructive">{fetchError}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">
          Selecciona un programa <span className="text-destructive">*</span>
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Elige el programa que mejor se alinee con tus objetivos de aprendizaje
        </p>
      </div>

      <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
        {programs.map((program) => (
          <Card
            key={program.id}
            className={`cursor-pointer transition-colors ${
              value === program.id
                ? 'border-primary ring-2 ring-primary ring-offset-2'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onChange(program.id)}
          >
            <CardHeader className="space-y-2 pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value={program.id} id={program.id} />
                  <Label htmlFor={program.id} className="text-base font-semibold cursor-pointer">
                    {program.name}
                  </Label>
                </div>
                <Badge variant={program.programType === 'cohort' ? 'default' : 'secondary'}>
                  {program.programType === 'cohort' ? (
                    <>
                      <Calendar className="h-3 w-3 mr-1" />
                      Cohorte
                    </>
                  ) : (
                    <>
                      <Infinity className="h-3 w-3 mr-1" />
                      Continuo
                    </>
                  )}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {program.description}
              </CardDescription>
            </CardHeader>

            {program.programType === 'cohort' && (program.startDate || program.endDate) && (
              <CardContent className="pt-0 pb-4">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {program.startDate && (
                    <div>
                      <span className="font-medium">Inicio:</span>{' '}
                      {new Date(program.startDate).toLocaleDateString('es-MX', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  )}
                  {program.endDate && (
                    <div>
                      <span className="font-medium">Fin:</span>{' '}
                      {new Date(program.endDate).toLocaleDateString('es-MX', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </RadioGroup>

      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </div>
  )
}
```

#### 2. Goal Input Component

**File**: `src/components/onboarding/goal-input.tsx`

```typescript
'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'

interface GoalInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function GoalInput({ value, onChange, error }: GoalInputProps) {
  const minLength = 1
  const maxLength = 280
  const currentLength = value.length
  const isValid = currentLength >= minLength && currentLength <= maxLength
  const isTooShort = currentLength > 0 && currentLength < minLength
  const isTooLong = currentLength > maxLength

  return (
    <div className="space-y-2">
      <Label htmlFor="goal" className="text-base font-semibold">
        Tu meta para el próximo mes <span className="text-destructive">*</span>
      </Label>
      <p className="text-sm text-muted-foreground">
        Describe qué quieres lograr en el próximo mes. Debe ser específico, medible y alcanzable.
        Por ejemplo: "Completar un portafolio web con 3 proyectos y conseguir mi primer cliente freelance".
      </p>

      <Textarea
        id="goal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escribe tu meta aquí..."
        className={`min-h-[120px] resize-none ${
          error || isTooShort || isTooLong ? 'border-destructive' : ''
        } ${isValid && currentLength > 0 ? 'border-green-500' : ''}`}
        maxLength={maxLength}
      />

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {isTooShort && (
            <span className="flex items-center gap-1 text-destructive">
              <AlertCircle className="h-4 w-4" />
              Mínimo {minLength} caracteres
            </span>
          )}
          {isTooLong && (
            <span className="flex items-center gap-1 text-destructive">
              <AlertCircle className="h-4 w-4" />
              Máximo {maxLength} caracteres
            </span>
          )}
          {isValid && (
            <span className="text-green-600 dark:text-green-500">
              ✓ Meta válida
            </span>
          )}
        </div>

        <span
          className={`font-mono ${
            isTooLong ? 'text-destructive' : 'text-muted-foreground'
          }`}
        >
          {currentLength}/{maxLength}
        </span>
      </div>

      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  )
}
```

#### 3. Social Accounts Form Component

**File**: `src/components/onboarding/social-accounts-form.tsx`

```typescript
'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Github, Twitter, Linkedin, MessageCircle } from 'lucide-react'

interface SocialAccountsFormProps {
  values: {
    githubUsername?: string
    twitterUsername?: string
    linkedinUrl?: string
    telegramUsername?: string
  }
  onChange: (field: string, value: string) => void
  errors?: Partial<Record<keyof SocialAccountsFormProps['values'], string>>
}

export function SocialAccountsForm({ values, onChange, errors }: SocialAccountsFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">Conecta tus cuentas sociales</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Vincula tus perfiles para que podamos validar tu identidad y actividad. GitHub es altamente recomendado.
        </p>
      </div>

      {/* GitHub */}
      <div className="space-y-2">
        <Label htmlFor="githubUsername" className="flex items-center gap-2">
          <Github className="h-4 w-4" />
          Usuario de GitHub
          <span className="text-xs text-muted-foreground font-normal">(recomendado)</span>
        </Label>
        <Input
          id="githubUsername"
          type="text"
          placeholder="tu-usuario"
          value={values.githubUsername || ''}
          onChange={(e) => onChange('githubUsername', e.target.value)}
          className={errors?.githubUsername ? 'border-destructive' : ''}
        />
        {errors?.githubUsername && (
          <p className="text-sm text-destructive">{errors.githubUsername}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Tu nombre de usuario de GitHub (sin el @)
        </p>
      </div>

      {/* Twitter/X */}
      <div className="space-y-2">
        <Label htmlFor="twitterUsername" className="flex items-center gap-2">
          <Twitter className="h-4 w-4" />
          Usuario de X (Twitter)
          <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
        </Label>
        <Input
          id="twitterUsername"
          type="text"
          placeholder="tu_usuario"
          value={values.twitterUsername || ''}
          onChange={(e) => onChange('twitterUsername', e.target.value)}
          className={errors?.twitterUsername ? 'border-destructive' : ''}
        />
        {errors?.twitterUsername && (
          <p className="text-sm text-destructive">{errors.twitterUsername}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Tu nombre de usuario de X/Twitter (sin el @)
        </p>
      </div>

      {/* LinkedIn */}
      <div className="space-y-2">
        <Label htmlFor="linkedinUrl" className="flex items-center gap-2">
          <Linkedin className="h-4 w-4" />
          URL de LinkedIn
          <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
        </Label>
        <Input
          id="linkedinUrl"
          type="url"
          placeholder="https://linkedin.com/in/tu-perfil"
          value={values.linkedinUrl || ''}
          onChange={(e) => onChange('linkedinUrl', e.target.value)}
          className={errors?.linkedinUrl ? 'border-destructive' : ''}
        />
        {errors?.linkedinUrl && (
          <p className="text-sm text-destructive">{errors.linkedinUrl}</p>
        )}
        <p className="text-xs text-muted-foreground">
          La URL completa de tu perfil de LinkedIn
        </p>
      </div>

      {/* Telegram */}
      <div className="space-y-2">
        <Label htmlFor="telegramUsername" className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Usuario de Telegram
          <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
        </Label>
        <Input
          id="telegramUsername"
          type="text"
          placeholder="tu_usuario"
          value={values.telegramUsername || ''}
          onChange={(e) => onChange('telegramUsername', e.target.value)}
          className={errors?.telegramUsername ? 'border-destructive' : ''}
        />
        {errors?.telegramUsername && (
          <p className="text-sm text-destructive">{errors.telegramUsername}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Tu nombre de usuario de Telegram (sin el @)
        </p>
      </div>
    </div>
  )
}
```

#### 4. Multi-Step Onboarding Form

**File**: `src/components/onboarding/multi-step-onboarding-form.tsx`

```typescript
'use client'

import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { ProgramSelector } from './program-selector'
import { GoalInput } from './goal-input'
import { SocialAccountsForm } from './social-accounts-form'

type OnboardingStep = 'profile' | 'program' | 'goal' | 'social' | 'review'

interface FormData {
  // Profile step
  username: string
  displayName: string
  bio: string
  avatarUrl: string

  // Program step
  programId: string

  // Goal step
  goal: string

  // Social step
  githubUsername: string
  twitterUsername: string
  linkedinUrl: string
  telegramUsername: string
}

interface FormErrors {
  [key: string]: string
}

export default function MultiStepOnboardingForm() {
  const { user } = usePrivy()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('profile')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Extract email from Privy user
  const privyEmail =
    user?.email?.address ||
    user?.google?.email ||
    user?.github?.email ||
    user?.discord?.email ||
    ''

  const [formData, setFormData] = useState<FormData>({
    username: '',
    displayName: '',
    bio: '',
    avatarUrl: '',
    programId: '',
    goal: '',
    githubUsername: '',
    twitterUsername: '',
    linkedinUrl: '',
    telegramUsername: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})

  // Step configuration
  const steps: OnboardingStep[] = ['profile', 'program', 'goal', 'social', 'review']
  const stepTitles: Record<OnboardingStep, string> = {
    profile: 'Tu Perfil',
    program: 'Elige tu Programa',
    goal: 'Define tu Meta',
    social: 'Conecta tus Cuentas',
    review: 'Revisa y Envía',
  }

  const currentStepIndex = steps.indexOf(currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  // Validation functions
  const validateProfileStep = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido'
    } else if (!/^[a-z0-9_]{3,50}$/.test(formData.username)) {
      newErrors.username = 'Solo minúsculas, números y guiones bajos (3-50 caracteres)'
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'El nombre para mostrar es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateProgramStep = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.programId) {
      newErrors.programId = 'Debes seleccionar un programa'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateGoalStep = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.goal.trim()) {
      newErrors.goal = 'La meta es requerida'
    } else if (formData.goal.length < 1) {
      newErrors.goal = 'La meta es requerida'
    } else if (formData.goal.length > 280) {
      newErrors.goal = 'La meta no puede exceder 280 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateSocialStep = (): boolean => {
    const newErrors: FormErrors = {}

    // LinkedIn URL validation (only if provided)
    if (formData.linkedinUrl && !/^https?:\/\/.+/.test(formData.linkedinUrl)) {
      newErrors.linkedinUrl = 'URL de LinkedIn inválida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Navigation handlers
  const handleNext = () => {
    let isValid = false

    switch (currentStep) {
      case 'profile':
        isValid = validateProfileStep()
        break
      case 'program':
        isValid = validateProgramStep()
        break
      case 'goal':
        isValid = validateGoalStep()
        break
      case 'social':
        isValid = validateSocialStep()
        break
      case 'review':
        isValid = true
        break
    }

    if (isValid) {
      const nextIndex = currentStepIndex + 1
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex])
      }
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex])
      setErrors({})
    }
  }

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error('Usuario no autenticado')
      return
    }

    setIsSubmitting(true)

    try {
      // Step 1: Update user profile
      const profileResponse = await fetch('/api/users/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          displayName: formData.displayName,
          bio: formData.bio,
          avatarUrl: formData.avatarUrl,
          email: privyEmail,
        }),
      })

      const profileData = await profileResponse.json()

      if (!profileResponse.ok) {
        throw new Error(profileData.error?.message || 'Failed to update profile')
      }

      // Step 2: Submit application
      const applicationResponse = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: formData.programId,
          goal: formData.goal,
          githubUsername: formData.githubUsername || undefined,
          twitterUsername: formData.twitterUsername || undefined,
          linkedinUrl: formData.linkedinUrl || undefined,
          telegramUsername: formData.telegramUsername || undefined,
        }),
      })

      const applicationData = await applicationResponse.json()

      if (!applicationResponse.ok) {
        throw new Error(applicationData.error?.message || 'Failed to submit application')
      }

      // Invalidate auth query to refetch user with updated status
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })

      toast.success('¡Aplicación enviada exitosamente!')
      toast.info('Tu aplicación está siendo revisada. Te notificaremos pronto.')

      router.push('/profile')
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al enviar la aplicación. Intenta de nuevo'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                required
                disabled
                value={privyEmail}
                className="cursor-not-allowed"
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">
                Nombre de usuario <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                type="text"
                required
                placeholder="usuario123"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className={errors.username ? 'border-destructive' : ''}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Solo minúsculas, números y guiones bajos (3-50 caracteres)
              </p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">
                Nombre para mostrar <span className="text-destructive">*</span>
              </Label>
              <Input
                id="displayName"
                type="text"
                required
                placeholder="Tu Nombre"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                maxLength={100}
                className={errors.displayName ? 'border-destructive' : ''}
              />
              {errors.displayName && (
                <p className="text-sm text-destructive">{errors.displayName}</p>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio (opcional)</Label>
              <Textarea
                id="bio"
                placeholder="Cuéntanos sobre ti..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                maxLength={280}
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                {formData.bio.length}/280 caracteres
              </p>
            </div>

            {/* Avatar URL */}
            <div className="space-y-2">
              <Label htmlFor="avatarUrl">URL del avatar (opcional)</Label>
              <Input
                id="avatarUrl"
                type="url"
                placeholder="https://ejemplo.com/avatar.jpg"
                value={formData.avatarUrl}
                onChange={(e) =>
                  setFormData({ ...formData, avatarUrl: e.target.value })
                }
                maxLength={500}
              />
            </div>
          </div>
        )

      case 'program':
        return (
          <ProgramSelector
            value={formData.programId}
            onChange={(programId) => setFormData({ ...formData, programId })}
            error={errors.programId}
          />
        )

      case 'goal':
        return (
          <GoalInput
            value={formData.goal}
            onChange={(goal) => setFormData({ ...formData, goal })}
            error={errors.goal}
          />
        )

      case 'social':
        return (
          <SocialAccountsForm
            values={{
              githubUsername: formData.githubUsername,
              twitterUsername: formData.twitterUsername,
              linkedinUrl: formData.linkedinUrl,
              telegramUsername: formData.telegramUsername,
            }}
            onChange={(field, value) =>
              setFormData({ ...formData, [field]: value })
            }
            errors={errors}
          />
        )

      case 'review':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Revisa tu información</h3>
              <p className="text-sm text-muted-foreground">
                Por favor verifica que toda la información sea correcta antes de enviar tu aplicación.
              </p>
            </div>

            {/* Profile summary */}
            <div className="space-y-3 rounded-lg border p-4">
              <h4 className="font-semibold">Perfil</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Usuario:</span>{' '}
                  <span className="font-medium">@{formData.username}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Nombre:</span>{' '}
                  <span className="font-medium">{formData.displayName}</span>
                </div>
                {formData.bio && (
                  <div>
                    <span className="text-muted-foreground">Bio:</span>{' '}
                    <span className="font-medium">{formData.bio}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Goal summary */}
            <div className="space-y-3 rounded-lg border p-4">
              <h4 className="font-semibold">Meta</h4>
              <p className="text-sm">{formData.goal}</p>
            </div>

            {/* Social accounts summary */}
            {(formData.githubUsername ||
              formData.twitterUsername ||
              formData.linkedinUrl ||
              formData.telegramUsername) && (
              <div className="space-y-3 rounded-lg border p-4">
                <h4 className="font-semibold">Cuentas conectadas</h4>
                <div className="space-y-2 text-sm">
                  {formData.githubUsername && (
                    <div>
                      <span className="text-muted-foreground">GitHub:</span>{' '}
                      <span className="font-medium">@{formData.githubUsername}</span>
                    </div>
                  )}
                  {formData.twitterUsername && (
                    <div>
                      <span className="text-muted-foreground">X/Twitter:</span>{' '}
                      <span className="font-medium">@{formData.twitterUsername}</span>
                    </div>
                  )}
                  {formData.linkedinUrl && (
                    <div>
                      <span className="text-muted-foreground">LinkedIn:</span>{' '}
                      <span className="font-medium text-xs break-all">
                        {formData.linkedinUrl}
                      </span>
                    </div>
                  )}
                  {formData.telegramUsername && (
                    <div>
                      <span className="text-muted-foreground">Telegram:</span>{' '}
                      <span className="font-medium">@{formData.telegramUsername}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{stepTitles[currentStep]}</span>
          <span className="text-muted-foreground">
            Paso {currentStepIndex + 1} de {steps.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">{renderStepContent()}</div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={currentStepIndex === 0 || isSubmitting}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>

        {currentStep === 'review' ? (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Aplicación'
            )}
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={isSubmitting}>
            Siguiente
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
```

## ✅ Acceptance Criteria

### Functional Requirements
- [ ] User can select from available programs with clear descriptions
- [ ] User can write and validate goal (1-280 characters)
- [ ] User can link social accounts (GitHub, X, LinkedIn, Telegram)
- [ ] Multi-step form maintains state across navigation
- [ ] Form validates each step before allowing progression
- [ ] Application is created with status 'pending' after submission
- [ ] User status changes from 'incomplete' to 'pending' after application
- [ ] Profile is updated with social account information
- [ ] User is redirected to profile page after successful submission
- [ ] Clear error messages for validation failures

### Non-Functional Requirements
- [ ] Form responds to user input within 100ms
- [ ] Step transitions are smooth with progress indicator
- [ ] All form fields properly validated before submission
- [ ] API endpoints return within 2 seconds under normal load
- [ ] Proper error handling with user-friendly messages
- [ ] Mobile-responsive design (works on 320px+ screens)

### Testing Requirements
- [ ] Unit tests for form validation logic
- [ ] Integration tests for API endpoints
- [ ] E2E tests for complete onboarding flow
- [ ] Manual testing on different screen sizes

## 🔗 Dependencies

### Blocks
- None (can start after E3-T1)

### Blocked By
- E3-T1: Database Schema Setup (REQUIRED - must complete first)

### Related
- E3-T3: Guest Status Implementation (uses same application data)
- E3-T4: Admin Applications Queue (processes these applications)

## 🧪 Testing Plan

### Unit Tests

**File**: `src/components/onboarding/__tests__/goal-input.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { GoalInput } from '../goal-input'

describe('GoalInput', () => {
  it('renders with empty value', () => {
    render(<GoalInput value="" onChange={jest.fn()} />)
    expect(screen.getByPlaceholderText('Escribe tu meta aquí...')).toBeInTheDocument()
  })

  it('shows error for too short goal', () => {
    render(<GoalInput value="Too short" onChange={jest.fn()} />)
    expect(screen.getByText(/Mínimo 140 caracteres/)).toBeInTheDocument()
  })

  it('shows success for valid goal', () => {
    const validGoal = 'A'.repeat(150)
    render(<GoalInput value={validGoal} onChange={jest.fn()} />)
    expect(screen.getByText(/Meta válida/)).toBeInTheDocument()
  })

  it('shows error for too long goal', () => {
    const longGoal = 'A'.repeat(300)
    render(<GoalInput value={longGoal} onChange={jest.fn()} />)
    expect(screen.getByText(/Máximo 280 caracteres/)).toBeInTheDocument()
  })

  it('displays character count', () => {
    render(<GoalInput value="Hello" onChange={jest.fn()} />)
    expect(screen.getByText('5/280')).toBeInTheDocument()
  })
})
```

### Integration Tests

**File**: `src/app/api/applications/__tests__/route.test.ts`

```typescript
import { POST } from '../route'
import { db } from '@/lib/db'

jest.mock('@/lib/db')

describe('POST /api/applications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates application successfully', async () => {
    const mockRequest = new Request('http://localhost/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user-id',
      },
      body: JSON.stringify({
        programId: 'program-id',
        goal: 'A'.repeat(150),
        githubUsername: 'testuser',
      }),
    })

    // Mock database responses
    ;(db.select as jest.Mock).mockResolvedValueOnce([{ id: 'user-id', accountStatus: 'incomplete' }])
    ;(db.select as jest.Mock).mockResolvedValueOnce([{ id: 'program-id', isActive: true }])
    ;(db.transaction as jest.Mock).mockResolvedValueOnce({ application: { id: 'app-id' } })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('rejects application if goal too short', async () => {
    const mockRequest = new Request('http://localhost/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user-id',
      },
      body: JSON.stringify({
        programId: 'program-id',
        goal: 'Too short',
      }),
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })
})
```

### E2E Tests

**File**: `tests/e2e/onboarding-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Onboarding Flow', () => {
  test('complete onboarding application', async ({ page }) => {
    // Mock authentication
    await page.goto('/onboarding')

    // Step 1: Profile
    await page.fill('[id=username]', 'testuser123')
    await page.fill('[id=displayName]', 'Test User')
    await page.fill('[id=bio]', 'A passionate developer')
    await page.click('text=Siguiente')

    // Step 2: Program selection
    await page.click('text=De Cero a Chamba')
    await page.click('text=Siguiente')

    // Step 3: Goal
    const goal = 'Complete a portfolio with 3 projects and land my first freelance client within the next month. Focus on React and Node.js development.'
    await page.fill('[id=goal]', goal)
    await expect(page.locator('text=Meta válida')).toBeVisible()
    await page.click('text=Siguiente')

    // Step 4: Social accounts
    await page.fill('[id=githubUsername]', 'testuser')
    await page.fill('[id=twitterUsername]', 'testuser')
    await page.click('text=Siguiente')

    // Step 5: Review and submit
    await expect(page.locator('text=@testuser123')).toBeVisible()
    await expect(page.locator('text=Test User')).toBeVisible()
    await page.click('text=Enviar Aplicación')

    // Verify success
    await expect(page).toHaveURL('/profile')
    await expect(page.locator('text=Aplicación enviada exitosamente')).toBeVisible()
  })

  test('validates required fields', async ({ page }) => {
    await page.goto('/onboarding')

    // Try to proceed without filling required fields
    await page.click('text=Siguiente')
    await expect(page.locator('text=El nombre de usuario es requerido')).toBeVisible()
  })

  test('maintains state when navigating back', async ({ page }) => {
    await page.goto('/onboarding')

    // Fill profile
    await page.fill('[id=username]', 'testuser123')
    await page.fill('[id=displayName]', 'Test User')
    await page.click('text=Siguiente')

    // Select program
    await page.click('text=DeFi-esta')
    await page.click('text=Siguiente')

    // Go back
    await page.click('text=Anterior')

    // Verify program selection is maintained
    const programCard = page.locator('text=DeFi-esta').locator('..')
    await expect(programCard).toHaveClass(/ring-primary/)

    // Go back to profile
    await page.click('text=Anterior')

    // Verify profile data is maintained
    await expect(page.locator('[id=username]')).toHaveValue('testuser123')
    await expect(page.locator('[id=displayName]')).toHaveValue('Test User')
  })
})
```

### Manual Testing Checklist
- [ ] Happy path: Complete full onboarding flow successfully
- [ ] Error case: Submit with invalid username format
- [ ] Error case: Submit goal with empty value
- [ ] Error case: Submit goal with >280 characters
- [ ] Error case: Submit without selecting program
- [ ] Error case: Submit with invalid LinkedIn URL
- [ ] Navigation: Go back and forth between steps, verify state persists
- [ ] Visual: Verify progress indicator updates correctly
- [ ] Visual: Verify program cards display correctly with badges
- [ ] Visual: Verify character count updates in real-time
- [ ] Responsive: Test on mobile (320px width)
- [ ] Responsive: Test on tablet (768px width)
- [ ] Responsive: Test on desktop (1920px width)

## 📝 Implementation Notes

### Architecture Decisions

1. **Multi-Step Form with Client State**: Using local component state instead of URL params for simpler implementation and better UX
2. **Validation on Step Transition**: Each step validates before allowing progression to catch errors early
3. **Transaction for Application Submission**: Ensuring atomicity when creating application, updating user status, and updating profile
4. **Separate API Endpoints**: Programs list and application submission are separate for better separation of concerns
5. **Rich Program Display**: Program cards show type, dates, and descriptions to help users make informed choices

### Code Organization

```
src/
├── app/api/
│   ├── applications/
│   │   └── route.ts                    # Application submission
│   └── programs/
│       └── active/
│           └── route.ts                # List active programs
├── components/onboarding/
│   ├── program-selector.tsx           # Program selection with cards
│   ├── goal-input.tsx                 # Goal input with validation
│   ├── social-accounts-form.tsx       # Social accounts form
│   └── multi-step-onboarding-form.tsx # Main multi-step form
└── types/
    └── api-v1.ts                      # Type definitions
```

### Known Limitations

1. **No Draft Saving**: If user closes browser, progress is lost (future: add auto-save to localStorage)
2. **Program Details Popup**: Program descriptions are inline; could add modal for detailed view
3. **Social Account Verification**: No real-time validation of GitHub/Twitter usernames existence
4. **Avatar Upload**: Uses URL input; future enhancement could add file upload like profile page

## 🚀 Deployment

### Environment Variables
No new environment variables required. Uses existing `DATABASE_URL` and Privy configuration.

### Database Migrations
```bash
# Generate migration from schema changes
bun run db:generate

# Apply migration
bun run db:migrate

# Verify schema
bun run scripts/verify-migration.ts
```

### Post-Deployment Verification
- [ ] `/api/programs/active` returns programs list
- [ ] `/api/applications` accepts valid application submission
- [ ] User status updates to 'pending' after application
- [ ] Profile updates with social account information
- [ ] No errors in production logs
- [ ] Multi-step form renders correctly on all screen sizes

## 📚 Documentation

### Files to Update
- [ ] Update onboarding flow diagram in [docs/features/onboarding.md](../../features/onboarding.md)
- [ ] Document application API endpoints in API reference
- [ ] Add program selection guide to user documentation
- [ ] Update [CLAUDE.md](../../../CLAUDE.md) with new API endpoints

### Documentation Content

**Onboarding Flow Documentation** (add to `docs/features/onboarding.md`):

```markdown
## Multi-Step Onboarding Flow

The onboarding process consists of 5 steps:

### Step 1: Profile
User completes basic profile information:
- Email (pre-filled from Privy, read-only)
- Username (3-50 chars, lowercase, numbers, underscores)
- Display Name (1-100 chars)
- Bio (optional, max 280 chars)
- Avatar URL (optional)

### Step 2: Program Selection
User selects from available programs:
- Programs displayed as cards with descriptions
- Badge indicates program type (Cohort vs Evergreen)
- Cohort programs show start/end dates
- Only active programs are shown

### Step 3: Goal Commitment
User writes their 1-month goal:
- Required: 1-280 characters
- Real-time character count
- Validation feedback (too short, too long, valid)
- Placeholder provides example format

### Step 4: Social Accounts
User links social profiles (all optional):
- GitHub username (recommended)
- X/Twitter username
- LinkedIn profile URL
- Telegram username

### Step 5: Review & Submit
User reviews all information before submitting:
- Profile summary
- Selected program
- Goal commitment
- Connected social accounts
- Submit button creates application

## Application Submission Process

1. **Profile Update**: User profile created/updated with basic info
2. **Application Created**: New application record with status 'pending'
3. **Status Update**: User accountStatus changes to 'pending'
4. **Profile Enhancement**: Social accounts added to profile
5. **Redirect**: User sent to profile page with success message
6. **Admin Review**: Application enters admin queue for review

## API Endpoints

### GET /api/programs/active
Returns list of active programs for selection.

### POST /api/applications
Submits user application with program selection and goal.
```

## 🔄 Future Iterations

### Phase 1 (This Ticket)
- Multi-step onboarding form
- Program selection
- Goal commitment input
- Social account linking
- Application submission

### Phase 2 (Future)
- Draft saving to localStorage
- Avatar upload within onboarding
- Program details modal/popup
- Social account verification (check if GitHub/Twitter username exists)
- Email verification step
- Progress auto-save

### Phase 3 (Future)
- Video introduction upload
- Portfolio link validation
- Skills assessment quiz
- Prerequisite validation (e.g., GitHub account setup verification)
- Onboarding analytics (drop-off rates by step)

## 📖 References

- **Design**: [Onboarding Flow Figma](link-to-design)
- **Discovery Questions**: [program-discovery-questions.md](../../design/program-discovery-questions.md)
- **Epic Scope**: [EPIC-3-SCOPE.md](./EPIC-3-SCOPE.md)
- **Implementation Workflow**: [IMPLEMENTATION-WORKFLOW.md](./IMPLEMENTATION-WORKFLOW.md)
- **Related Ticket**: [E3-T1: Database Schema Setup](./E3-T1-database-schema-setup.md)

---

## 📊 Progress Tracking

### Milestones
- [ ] Planning and design complete
- [ ] Database schema updated
- [ ] Backend API endpoints implemented
- [ ] Frontend components created
- [ ] Multi-step form integrated
- [ ] Testing complete
- [ ] Documentation complete
- [ ] Code review complete
- [ ] Deployed to staging
- [ ] Deployed to production

### Time Tracking
- **Estimated**: 16 hours (2 days)
- **Actual**: ___ hours
- **Variance**: ___ hours

### Notes and Blockers
- **[Date]**: Note or blocker description
- **[Date]**: Resolution or update
