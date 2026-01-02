/**
 * ImagesUpload Component
 *
 * Multiple project images upload with drag-and-drop reordering
 * Supports up to 4 additional images with compression and preview
 */

'use client'

import { useState, useCallback, useRef } from 'react'
import { X, Loader2, ImageIcon, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { validateImage, IMAGE_CONFIG } from '@/lib/upload/image-validation'
import {
  compressImage,
  createPreviewUrl,
  revokePreviewUrl,
} from '@/lib/upload/image-compression'

interface ImagesUploadProps {
  projectId: string | null // null for new projects (upload after creation)
  currentImageUrls?: string[]
  onUploadComplete?: (imageUrls: string[]) => void
  onFilesSelected?: (files: File[]) => void // For new projects (file selection before upload)
  onDelete?: (imageUrl: string) => void
  onReorder?: (imageUrls: string[]) => void
  disabled?: boolean
}

interface ImageItem {
  url: string
  isUploading: boolean
  isDeleting: boolean
}

export function ImagesUpload({
  projectId,
  currentImageUrls = [],
  onUploadComplete,
  onFilesSelected,
  onDelete,
  onReorder,
  disabled = false,
}: ImagesUploadProps) {
  const [images, setImages] = useState<ImageItem[]>(
    currentImageUrls.map((url) => ({
      url,
      isUploading: false,
      isDeleting: false,
    })),
  )
  const [isDragging, setIsDragging] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [pendingFiles, setPendingFiles] = useState<File[]>([]) // Store files for new projects
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFilesSelect = useCallback(
    async (files: File[]) => {
      // Check if adding these files would exceed the limit
      const currentCount = images.length
      const newCount = currentCount + files.length

      if (newCount > IMAGE_CONFIG.maxAdditionalImages) {
        toast.error(
          `Maximum ${IMAGE_CONFIG.maxAdditionalImages} images allowed. Current: ${currentCount}, Attempting to add: ${files.length}`,
        )
        return
      }

      // Validate all files first
      for (const file of files) {
        const error = validateImage(file)
        if (error) {
          toast.error(`${file.name}: ${error.message}`)
          return
        }
      }

      try {
        // Compress all files
        toast.info(`Compressing ${files.length} image(s)...`)
        const compressedFiles = await Promise.all(
          files.map((file) => compressImage(file, { preserveFormat: false })),
        )

        // Show previews immediately
        const previews = compressedFiles.map(createPreviewUrl)
        const newImages: ImageItem[] = previews.map((url) => ({
          url,
          isUploading: projectId !== null,
          isDeleting: false,
        }))
        setImages((prev) => [...prev, ...newImages])

        // If projectId exists, upload immediately
        if (projectId) {
          const formData = new FormData()
          compressedFiles.forEach((file) => {
            formData.append('images', file)
          })

          toast.info('Uploading images...')
          const response = await fetch(`/api/projects/${projectId}/images`, {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error?.message || 'Upload failed')
          }

          const data = await response.json()
          const uploadedUrls = data.data.imageUrls

          // Replace preview URLs with uploaded URLs
          setImages((prev) => {
            const withoutPreviews = prev.filter(
              (img) => !previews.includes(img.url),
            )
            const uploaded = uploadedUrls
              .slice(-compressedFiles.length)
              .map((url: string) => ({
                url,
                isUploading: false,
                isDeleting: false,
              }))
            return [...withoutPreviews, ...uploaded]
          })

          // Revoke preview URLs
          previews.forEach(revokePreviewUrl)

          toast.success(`${files.length} image(s) uploaded successfully`)
          onUploadComplete?.(uploadedUrls)
        } else {
          // For new projects, store the file objects (will upload after project creation)
          const allFiles = [...pendingFiles, ...compressedFiles]
          setPendingFiles(allFiles)
          toast.success('Images ready')
          onFilesSelected?.(allFiles)
        }
      } catch (error) {
        console.error('Images upload error:', error)
        toast.error(
          error instanceof Error ? error.message : 'Failed to upload images',
        )
        // Remove failed uploads
        setImages((prev) => prev.filter((img) => !img.isUploading))
      }
    },
    [projectId, images.length, pendingFiles, onUploadComplete, onFilesSelected],
  )

  const handleDelete = async (imageUrl: string, index: number) => {
    if (!projectId) {
      // For new projects, just remove from preview and pending files
      setImages((prev) => prev.filter((_, i) => i !== index))
      setPendingFiles((prev) => prev.filter((_, i) => i !== index))
      if (imageUrl.startsWith('blob:')) {
        revokePreviewUrl(imageUrl)
      }
      // Update parent with new file list
      onFilesSelected?.(pendingFiles.filter((_, i) => i !== index))
      onDelete?.(imageUrl)
      return
    }

    try {
      setImages((prev) =>
        prev.map((img, i) =>
          i === index ? { ...img, isDeleting: true } : img,
        ),
      )

      // Encode URL as Base64 for safe URL path
      const encodedImageId = Buffer.from(imageUrl).toString('base64')
      const response = await fetch(
        `/api/projects/${projectId}/images/${encodeURIComponent(encodedImageId)}`,
        {
          method: 'DELETE',
        },
      )

      if (!response.ok) {
        throw new Error('Failed to delete image')
      }

      setImages((prev) => prev.filter((_, i) => i !== index))
      toast.success('Image removed successfully')
      onDelete?.(imageUrl)
    } catch (error) {
      console.error('Image delete error:', error)
      toast.error('Failed to delete image')
      setImages((prev) =>
        prev.map((img, i) =>
          i === index ? { ...img, isDeleting: false } : img,
        ),
      )
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...images]
    const draggedItem = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedItem)

    setImages(newImages)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    const urls = images.map((img) => img.url)
    onReorder?.(urls)
  }

  const handleDropZoneDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDropZoneDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDropZoneDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/'),
      )
      if (files.length > 0) {
        handleFilesSelect(files)
      } else {
        toast.error('Please drop image files')
      }
    },
    [handleFilesSelect],
  )

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFilesSelect(files)
    }
  }

  const handleClick = () => {
    if (!disabled && images.length < IMAGE_CONFIG.maxAdditionalImages) {
      fileInputRef.current?.click()
    }
  }

  const canAddMore = images.length < IMAGE_CONFIG.maxAdditionalImages

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Project Images</label>
        <span className="text-sm text-muted-foreground">
          {images.length} / {IMAGE_CONFIG.maxAdditionalImages}
        </span>
      </div>

      {/* Existing Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={image.url}
              draggable={!image.isUploading && !image.isDeleting && !disabled}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`group relative overflow-hidden rounded-lg border-2 ${draggedIndex === index ? 'opacity-50' : ''} ${!image.isUploading && !image.isDeleting && !disabled ? 'cursor-move' : ''} `}
            >
              {/* Drag Handle */}
              {!image.isUploading && !image.isDeleting && !disabled && (
                <div className="absolute top-2 left-2 z-10 cursor-move rounded bg-background/80 p-1">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
              )}

              {/* Image */}
              <div className="relative aspect-square">
                <img
                  src={image.url}
                  alt={`Project image ${index + 1}`}
                  className="h-full w-full object-cover"
                />

                {/* Loading Overlay */}
                {(image.isUploading || image.isDeleting) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}

                {/* Delete Button */}
                {!image.isUploading && !image.isDeleting && (
                  <button
                    type="button"
                    onClick={() => handleDelete(image.url, index)}
                    disabled={disabled}
                    className="text-destructive-foreground absolute top-2 right-2 rounded-full bg-destructive p-1.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Drop Zone */}
      {canAddMore && (
        <div
          className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'} ${disabled ? 'cursor-not-allowed opacity-50' : ''} `}
          onDragOver={handleDropZoneDragOver}
          onDragLeave={handleDropZoneDragLeave}
          onDrop={handleDropZoneDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            multiple
            onChange={handleFileInputChange}
            disabled={disabled}
            className="hidden"
          />

          <div className="flex flex-col items-center space-y-3 text-center">
            <div className="rounded-full bg-muted p-3">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Drag and drop or click to upload images
              </p>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WebP, SVG • Max 5MB each •{' '}
                {IMAGE_CONFIG.maxAdditionalImages - images.length} remaining
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Add up to {IMAGE_CONFIG.maxAdditionalImages} additional images to
        showcase your project. Drag images to reorder.
      </p>
    </div>
  )
}
