# E3-T8: Admin Program CRUD

> **Epic**: E3 - Program Management
> **Status**: 🎯 Todo
> **Priority**: 🟡 High
> **Effort**: L (3 days - 1.5 backend + 1.5 frontend)
> **Dependencies**: E3-T1 (Database Schema)

## 📋 Overview

Build complete CRUD interface for program management. Admins need ability to create, read, update, and delete programs, as well as link activities to programs.

**Key Features:**
- Create new programs with details
- Edit existing programs
- Delete/archive programs
- Link activities to programs
- Manage program-activity relationships
- Program visibility (active/inactive toggle)

## 🎯 Objectives

1. Create program CRUD API endpoints
2. Build program creation form
3. Build program editing interface
4. Implement program deletion (soft delete)
5. Create activity linking interface
6. Manage program-activity relationships
7. Handle program activation/deactivation

## 📦 Deliverables

### Backend
- [ ] `POST /api/admin/programs` - Create program
- [ ] `PATCH /api/admin/programs/:id` - Update program
- [ ] `DELETE /api/admin/programs/:id` - Delete program
- [ ] `POST /api/admin/programs/:id/activities` - Link activity
- [ ] `DELETE /api/admin/programs/:programId/activities/:activityId` - Unlink activity
- [ ] `PATCH /api/admin/programs/:programId/activities/:activityId` - Update link

### Frontend
- [ ] Programs management page (`/admin/programs`)
- [ ] Program creation form
- [ ] Program editing form
- [ ] Program deletion confirmation
- [ ] Activity linking interface
- [ ] Program-activity list with management

## 🔧 Technical Implementation

### Backend

**1. Create Program**

```typescript
// src/app/api/admin/programs/route.ts
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { programs } from '@/lib/db/schema'
import { apiSuccess, apiValidationError, apiErrors } from '@/lib/api/response'

const createProgramSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1),
  programType: z.enum(['cohort', 'evergreen']),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
}).refine(
  (data) => {
    if (data.programType === 'cohort') {
      return data.startDate && data.endDate
    }
    return true
  },
  { message: 'Cohort programs must have start and end dates' }
)

export async function POST(request: NextRequest) {
  const adminRole = request.headers.get('x-user-role')
  if (adminRole !== 'admin') return apiErrors.unauthorized()

  const body = await request.json()
  const result = createProgramSchema.safeParse(body)

  if (!result.success) {
    return apiValidationError(result.error)
  }

  try {
    const [program] = await db
      .insert(programs)
      .values({
        name: result.data.name,
        description: result.data.description,
        programType: result.data.programType,
        startDate: result.data.startDate ? new Date(result.data.startDate) : null,
        endDate: result.data.endDate ? new Date(result.data.endDate) : null,
        isActive: result.data.isActive,
      })
      .returning()

    return apiSuccess({ program }, { message: 'Program created successfully' })
  } catch (error) {
    console.error('Error creating program:', error)
    return apiErrors.internal()
  }
}

export async function GET(request: NextRequest) {
  const adminRole = request.headers.get('x-user-role')
  if (adminRole !== 'admin') return apiErrors.unauthorized()

  try {
    const allPrograms = await db
      .select()
      .from(programs)
      .orderBy(programs.name)

    return apiSuccess({ programs: allPrograms })
  } catch (error) {
    console.error('Error fetching programs:', error)
    return apiErrors.internal()
  }
}
```

**2. Update Program**

```typescript
// src/app/api/admin/programs/[id]/route.ts
const updateProgramSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).optional(),
  programType: z.enum(['cohort', 'evergreen']).optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminRole = request.headers.get('x-user-role')
  if (adminRole !== 'admin') return apiErrors.unauthorized()

  const body = await request.json()
  const result = updateProgramSchema.safeParse(body)

  if (!result.success) {
    return apiValidationError(result.error)
  }

  try {
    const updates: any = { updatedAt: new Date() }
    if (result.data.name) updates.name = result.data.name
    if (result.data.description) updates.description = result.data.description
    if (result.data.programType) updates.programType = result.data.programType
    if (result.data.startDate !== undefined) {
      updates.startDate = result.data.startDate ? new Date(result.data.startDate) : null
    }
    if (result.data.endDate !== undefined) {
      updates.endDate = result.data.endDate ? new Date(result.data.endDate) : null
    }
    if (result.data.isActive !== undefined) updates.isActive = result.data.isActive

    const [program] = await db
      .update(programs)
      .set(updates)
      .where(eq(programs.id, params.id))
      .returning()

    if (!program) {
      return apiErrors.notFound('Program')
    }

    return apiSuccess({ program }, { message: 'Program updated successfully' })
  } catch (error) {
    console.error('Error updating program:', error)
    return apiErrors.internal()
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminRole = request.headers.get('x-user-role')
  if (adminRole !== 'admin') return apiErrors.unauthorized()

  try {
    // Soft delete: set isActive to false
    const [program] = await db
      .update(programs)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(programs.id, params.id))
      .returning()

    if (!program) {
      return apiErrors.notFound('Program')
    }

    return apiSuccess({ program }, { message: 'Program deleted successfully' })
  } catch (error) {
    console.error('Error deleting program:', error)
    return apiErrors.internal()
  }
}
```

**3. Link Activity to Program**

```typescript
// src/app/api/admin/programs/[id]/activities/route.ts
const linkActivitySchema = z.object({
  activityId: z.string().uuid(),
  isRequired: z.boolean().default(false),
  orderIndex: z.number().int().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminRole = request.headers.get('x-user-role')
  if (adminRole !== 'admin') return apiErrors.unauthorized()

  const body = await request.json()
  const result = linkActivitySchema.safeParse(body)

  if (!result.success) {
    return apiValidationError(result.error)
  }

  try {
    const [link] = await db
      .insert(program_activities)
      .values({
        programId: params.id,
        activityId: result.data.activityId,
        isRequired: result.data.isRequired,
        orderIndex: result.data.orderIndex,
      })
      .returning()

    return apiSuccess({ link }, { message: 'Activity linked successfully' })
  } catch (error) {
    console.error('Error linking activity:', error)
    return apiErrors.internal()
  }
}
```

### Frontend

**1. Program Management Page**

```typescript
// src/app/admin/programs/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ProgramsTable } from '@/components/admin/programs-table'
import { ProgramFormDialog } from '@/components/admin/program-form-dialog'

export default function ProgramsManagementPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'programs'],
    queryFn: fetchAllPrograms,
  })

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Programs Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Program
        </Button>
      </div>

      <ProgramsTable
        programs={data?.programs || []}
        isLoading={isLoading}
        onEdit={setEditingProgramId}
      />

      <ProgramFormDialog
        open={isCreateDialogOpen || !!editingProgramId}
        onClose={() => {
          setIsCreateDialogOpen(false)
          setEditingProgramId(null)
        }}
        programId={editingProgramId}
      />
    </div>
  )
}
```

**2. Program Form Dialog**

```typescript
// src/components/admin/program-form-dialog.tsx
'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface ProgramFormDialogProps {
  open: boolean
  onClose: () => void
  programId?: string | null
}

export function ProgramFormDialog({ open, onClose, programId }: ProgramFormDialogProps) {
  const queryClient = useQueryClient()
  const isEditing = !!programId

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    programType: 'cohort' as 'cohort' | 'evergreen',
    startDate: '',
    endDate: '',
    isActive: true,
  })

  // Fetch program data if editing
  const { data: programData } = useQuery({
    queryKey: ['admin', 'programs', programId],
    queryFn: () => fetchProgram(programId!),
    enabled: isEditing && open,
  })

  useEffect(() => {
    if (programData?.program) {
      setFormData({
        name: programData.program.name,
        description: programData.program.description,
        programType: programData.program.programType,
        startDate: programData.program.startDate
          ? new Date(programData.program.startDate).toISOString().split('T')[0]
          : '',
        endDate: programData.program.endDate
          ? new Date(programData.program.endDate).toISOString().split('T')[0]
          : '',
        isActive: programData.program.isActive,
      })
    }
  }, [programData])

  const saveMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      isEditing
        ? updateProgram(programId, data)
        : createProgram(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] })
      toast.success(isEditing ? 'Program updated' : 'Program created')
      onClose()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Program' : 'Create Program'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="programType">Type *</Label>
            <Select
              id="programType"
              value={formData.programType}
              onValueChange={(value: 'cohort' | 'evergreen') =>
                setFormData({ ...formData, programType: value })
              }
            >
              <option value="cohort">Cohort (time-bound)</option>
              <option value="evergreen">Evergreen (ongoing)</option>
            </Select>
          </div>

          {formData.programType === 'cohort' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required={formData.programType === 'cohort'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required={formData.programType === 'cohort'}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Active (visible to users)</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

## ✅ Acceptance Criteria

- [ ] Admin can create new programs
- [ ] Admin can edit existing programs
- [ ] Admin can delete/archive programs
- [ ] Admin can link activities to programs
- [ ] Admin can unlink activities from programs
- [ ] Admin can toggle program visibility (active/inactive)
- [ ] Cohort programs require start/end dates
- [ ] Evergreen programs don't require dates
- [ ] Form validation prevents invalid data

## 🧪 Testing

```typescript
test('admin creates cohort program', async ({ page }) => {
  await page.goto('/admin/programs')
  await page.click('text=Create Program')

  await page.fill('[id=name]', 'Test Cohort')
  await page.fill('[id=description]', 'Test description')
  await page.selectOption('[id=programType]', 'cohort')
  await page.fill('[id=startDate]', '2025-02-01')
  await page.fill('[id=endDate]', '2025-05-01')

  await page.click('text=Create')

  await expect(page.locator('text=Program created')).toBeVisible()
})
```

## 📝 Implementation Notes

- Use soft delete for programs (set isActive = false)
- Validate date ranges for cohort programs
- Consider adding program duplication feature in future
- Activity linking should validate activity exists

## 📖 References

- [E3-T1: Database Schema](./E3-T1-database-schema-setup.md)
- [EPIC-3-SCOPE.md](./EPIC-3-SCOPE.md)
