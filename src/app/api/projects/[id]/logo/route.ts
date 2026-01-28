/**
 * Project Logo Upload API
 *
 * POST   /api/projects/[id]/logo  - Upload project logo
 * DELETE /api/projects/[id]/logo  - Delete project logo
 */

import { NextRequest } from 'next/server'
import { put, del } from '@vercel/blob'
import { requireAuth } from '@/lib/auth/helpers'
import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { apiSuccess, apiError, apiErrors } from '@/lib/api/response'
import { validateUploadedFile } from '@/lib/upload/image-validation'

/**
 * POST /api/projects/[id]/logo
 * Upload project logo to Vercel Blob Storage
 *
 * Authorization: Owner only
 * Requires: BLOB_READ_WRITE_TOKEN environment variable
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Authentication required
    const { user } = await requireAuth()

    const { id: projectId } = await params

    // Verify project exists and user is owner
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
      .limit(1)

    if (!project) {
      return apiErrors.notFound('Project')
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('logo') as File | null

    if (!file) {
      return apiError('No file provided', { status: 400, code: 'NO_FILE' })
    }

    // Validate file
    const validation = await validateUploadedFile(file)
    if (!validation.valid) {
      return apiError(validation.error.message, {
        status: 400,
        code: validation.error.code,
      })
    }

    // Delete old logo from Vercel Blob Storage if it exists
    if (project.logoUrl && project.logoUrl.includes('vercel-storage.com')) {
      try {
        await del(project.logoUrl)
      } catch (error) {
        console.error('Failed to delete old logo from blob storage:', error)
        // Continue with upload even if deletion fails
      }
    }

    // Upload to Vercel Blob Storage
    // Path: projects/{userId}/{projectId}/logo-{filename}
    const blob = await put(
      `projects/${user.id}/${projectId}/logo-${file.name}`,
      file,
      {
        access: 'public',
        addRandomSuffix: true, // Prevents filename collisions
      },
    )

    const logoUrl = blob.url

    // Update project's logoUrl in database
    await db
      .update(projects)
      .set({
        logoUrl: logoUrl,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))

    return apiSuccess(
      { logoUrl },
      {
        message: 'Logo uploaded successfully',
      },
    )
  } catch (error) {
    console.error('Error uploading project logo:', error)
    return apiErrors.internal()
  }
}

/**
 * DELETE /api/projects/[id]/logo
 * Remove project logo and delete from Vercel Blob Storage
 *
 * Authorization: Owner only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Authentication required
    const { user } = await requireAuth()

    const { id: projectId } = await params

    // Verify project exists and user is owner
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
      .limit(1)

    if (!project) {
      return apiErrors.notFound('Project')
    }

    // Delete from Vercel Blob Storage if URL exists
    if (project.logoUrl && project.logoUrl.includes('vercel-storage.com')) {
      try {
        await del(project.logoUrl)
      } catch (error) {
        console.error('Failed to delete logo from blob storage:', error)
        // Continue with database update even if blob deletion fails
      }
    }

    // Update project's logoUrl to null in database
    await db
      .update(projects)
      .set({
        logoUrl: null,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))

    return apiSuccess(
      {},
      {
        message: 'Logo removed successfully',
      },
    )
  } catch (error) {
    console.error('Error removing project logo:', error)
    return apiErrors.internal()
  }
}
