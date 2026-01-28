/**
 * Project Images Upload API
 *
 * POST /api/projects/[id]/images - Upload multiple project images (up to 4 additional)
 */

import { NextRequest } from 'next/server'
import { put } from '@vercel/blob'
import { requireAuth } from '@/lib/auth/helpers'
import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { apiSuccess, apiError, apiErrors } from '@/lib/api/response'
import {
  validateUploadedFile,
  IMAGE_CONFIG,
} from '@/lib/upload/image-validation'

/**
 * POST /api/projects/[id]/images
 * Upload multiple project images to Vercel Blob Storage
 *
 * Authorization: Owner only
 * Max: 4 additional images (excluding logo)
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
    const files: File[] = []

    // Extract all files from FormData
    for (const [key, value] of formData.entries()) {
      if (key === 'images' && value instanceof File) {
        files.push(value)
      }
    }

    if (files.length === 0) {
      return apiError('No files provided', { status: 400, code: 'NO_FILE' })
    }

    // Check total image count (current images + new images)
    const currentImageCount = project.imageUrls?.length || 0
    const totalImageCount = currentImageCount + files.length

    // Allow max 5 total images (1 logo + 4 additional)
    // Since logo is separate, we check if imageUrls would exceed 4
    if (totalImageCount > IMAGE_CONFIG.maxAdditionalImages) {
      return apiError(
        `Maximum ${IMAGE_CONFIG.maxAdditionalImages} additional images allowed. Current: ${currentImageCount}, Attempting to add: ${files.length}`,
        { status: 400, code: 'TOO_MANY_FILES' },
      )
    }

    // Validate each file
    for (const file of files) {
      const validation = await validateUploadedFile(file)
      if (!validation.valid) {
        return apiError(`File "${file.name}": ${validation.error.message}`, {
          status: 400,
          code: validation.error.code,
        })
      }
    }

    // Upload all files to Vercel Blob Storage
    const uploadPromises = files.map(async (file, index) => {
      const timestamp = Date.now()
      const blob = await put(
        `projects/${user.id}/${projectId}/image-${timestamp}-${index}-${file.name}`,
        file,
        {
          access: 'public',
          addRandomSuffix: true,
        },
      )
      return blob.url
    })

    const newImageUrls = await Promise.all(uploadPromises)

    // Merge with existing images
    const existingImages = project.imageUrls || []
    const updatedImageUrls = [...existingImages, ...newImageUrls]

    // Update project's imageUrls in database
    await db
      .update(projects)
      .set({
        imageUrls: updatedImageUrls,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))

    return apiSuccess(
      { imageUrls: updatedImageUrls },
      {
        message: `${newImageUrls.length} image(s) uploaded successfully`,
      },
    )
  } catch (error) {
    console.error('Error uploading project images:', error)
    return apiErrors.internal()
  }
}
