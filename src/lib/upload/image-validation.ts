/**
 * Image Validation Utilities
 *
 * Client-side and server-side validation for image uploads
 */

export const IMAGE_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB in bytes
  maxImages: 5, // Total (1 logo + 4 additional)
  maxAdditionalImages: 4,
  acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.svg'],
} as const;

export interface ImageValidationError {
  code: 'FILE_TOO_LARGE' | 'INVALID_FORMAT' | 'TOO_MANY_FILES' | 'NO_FILE';
  message: string;
}

/**
 * Validate image file size
 */
export function validateFileSize(file: File): ImageValidationError | null {
  if (file.size > IMAGE_CONFIG.maxSize) {
    return {
      code: 'FILE_TOO_LARGE',
      message: `File size exceeds 5MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }
  return null;
}

/**
 * Validate image file format
 */
export function validateFileFormat(file: File): ImageValidationError | null {
  const acceptedFormats: readonly string[] = IMAGE_CONFIG.acceptedFormats;
  if (!acceptedFormats.includes(file.type)) {
    return {
      code: 'INVALID_FORMAT',
      message: `Invalid file format. Accepted formats: JPEG, PNG, WebP, SVG`,
    };
  }
  return null;
}

/**
 * Validate single image file
 */
export function validateImage(file: File): ImageValidationError | null {
  const sizeError = validateFileSize(file);
  if (sizeError) return sizeError;

  const formatError = validateFileFormat(file);
  if (formatError) return formatError;

  return null;
}

/**
 * Validate multiple image files
 */
export function validateImages(files: File[], maxCount: number = IMAGE_CONFIG.maxAdditionalImages): ImageValidationError | null {
  if (files.length === 0) {
    return {
      code: 'NO_FILE',
      message: 'No files selected',
    };
  }

  if (files.length > maxCount) {
    return {
      code: 'TOO_MANY_FILES',
      message: `Too many files. Maximum ${maxCount} images allowed`,
    };
  }

  // Validate each file
  for (const file of files) {
    const error = validateImage(file);
    if (error) return error;
  }

  return null;
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  const acceptedFormats: readonly string[] = IMAGE_CONFIG.acceptedFormats;
  return acceptedFormats.includes(file.type);
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * Server-side: Validate uploaded file from FormData
 */
export async function validateUploadedFile(file: File): Promise<{ valid: true } | { valid: false; error: ImageValidationError }> {
  const error = validateImage(file);
  if (error) {
    return { valid: false, error };
  }
  return { valid: true };
}
