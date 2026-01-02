import { NextRequest } from 'next/server'
import { put, del } from '@vercel/blob'
import { requireAuth } from '@/lib/auth/helpers'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { apiSuccess, apiError, apiErrors } from '@/lib/api/response'

/**
 * POST /api/profiles/avatar
 * Upload user avatar to Vercel Blob Storage
 *
 * Requires BLOB_READ_WRITE_TOKEN environment variable
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const { user } = await requireAuth()

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('avatar') as File | null

    if (!file) {
      return apiError('No file provided', { status: 400 })
    }

    // Validate file type
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!acceptedTypes.includes(file.type)) {
      return apiError('Invalid file type. Please upload JPEG, PNG, or WebP', {
        status: 400,
      })
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return apiError('File size exceeds 5MB limit', { status: 400 })
    }

    // Delete old avatar from Vercel Blob Storage if it exists
    if (user.avatarUrl && user.avatarUrl.includes('vercel-storage.com')) {
      try {
        await del(user.avatarUrl)
      } catch (error) {
        console.error('Failed to delete old avatar from blob storage:', error)
        // Continue with upload even if deletion fails
      }
    }

    // Upload to Vercel Blob Storage
    const blob = await put(`avatars/${user.id}/${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true, // Prevents filename collisions
    })

    const avatarUrl = blob.url

    // Update user's avatarUrl in database
    await db
      .update(users)
      .set({
        avatarUrl: avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    return apiSuccess(
      { avatarUrl },
      {
        message: 'Avatar uploaded successfully',
      },
    )
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return apiErrors.unauthorized()
    }

    console.error('Error uploading avatar:', error)
    return apiErrors.internal()
  }
}

/**
 * DELETE /api/profiles/avatar
 * Remove user avatar and delete from Vercel Blob Storage
 */
export async function DELETE() {
  try {
    // Require authentication
    const { user } = await requireAuth()

    // Delete from Vercel Blob Storage if URL exists
    if (user.avatarUrl && user.avatarUrl.includes('vercel-storage.com')) {
      try {
        await del(user.avatarUrl)
      } catch (error) {
        console.error('Failed to delete avatar from blob storage:', error)
        // Continue with database update even if blob deletion fails
      }
    }

    // Update user's avatarUrl to null in database
    await db
      .update(users)
      .set({
        avatarUrl: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    return apiSuccess(
      {},
      {
        message: 'Avatar removed successfully',
      },
    )
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return apiErrors.unauthorized()
    }

    console.error('Error removing avatar:', error)
    return apiErrors.internal()
  }
}
