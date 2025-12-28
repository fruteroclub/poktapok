/**
 * Project Individual Image Deletion API
 *
 * DELETE /api/projects/[id]/images/[imageId] - Delete specific image by URL (encoded as imageId)
 */

import { NextRequest } from 'next/server';
import { del } from '@vercel/blob';
import { requireAuth } from '@/lib/auth/helpers';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { apiSuccess, apiError, apiErrors } from '@/lib/api/response';

/**
 * DELETE /api/projects/[id]/images/[imageId]
 * Delete specific project image from Vercel Blob Storage
 *
 * Authorization: Owner only
 * imageId: Base64-encoded image URL (to handle URLs in path safely)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    // Authentication required
    const { user } = await requireAuth();

    const { id: projectId, imageId } = await params;

    // Decode imageId (Base64-encoded URL)
    let imageUrl: string;
    try {
      imageUrl = Buffer.from(decodeURIComponent(imageId), 'base64').toString('utf-8');
    } catch (error) {
      return apiError('Invalid image ID', { status: 400, code: 'INVALID_IMAGE_ID' });
    }

    // Verify project exists and user is owner
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
      .limit(1);

    if (!project) {
      return apiErrors.notFound('Project');
    }

    // Check if image exists in project's imageUrls
    const currentImages = project.imageUrls || [];
    if (!currentImages.includes(imageUrl)) {
      return apiError('Image not found in project', { status: 404, code: 'IMAGE_NOT_FOUND' });
    }

    // Delete from Vercel Blob Storage if it's a Vercel-hosted image
    if (imageUrl.includes('vercel-storage.com')) {
      try {
        await del(imageUrl);
      } catch (error) {
        console.error('Failed to delete image from blob storage:', error);
        // Continue with database update even if blob deletion fails
      }
    }

    // Remove URL from imageUrls array
    const updatedImageUrls = currentImages.filter(url => url !== imageUrl);

    // Update project's imageUrls in database
    await db
      .update(projects)
      .set({
        imageUrls: updatedImageUrls,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));

    return apiSuccess(
      { imageUrls: updatedImageUrls },
      {
        message: 'Image removed successfully',
      }
    );
  } catch (error) {
    console.error('Error removing project image:', error);
    return apiErrors.internal();
  }
}
