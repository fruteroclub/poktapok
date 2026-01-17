import { NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { events } from '@/lib/db/schema'
import { apiSuccess, apiError } from '@/lib/api/response'
import { requireAdmin, handleApiError } from '@/lib/auth/middleware'

/**
 * GET /api/admin/events/:id
 * Get a single event by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request)
    const { id } = await params

    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1)

    if (!event) {
      return apiError('Event not found', { code: 'NOT_FOUND', status: 404 })
    }

    return apiSuccess(event)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/admin/events/:id
 * Delete an event
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request)
    const { id } = await params

    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1)

    if (!event) {
      return apiError('Event not found', { code: 'NOT_FOUND', status: 404 })
    }

    await db.delete(events).where(eq(events.id, id))

    return apiSuccess({ deleted: true })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/admin/events/:id
 * Update an event
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request)
    const { id } = await params

    const body = await request.json()
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1)

    if (!event) {
      return apiError('Event not found', { code: 'NOT_FOUND', status: 404 })
    }

    const [updatedEvent] = await db
      .update(events)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning()

    return apiSuccess(updatedEvent)
  } catch (error) {
    return handleApiError(error)
  }
}
