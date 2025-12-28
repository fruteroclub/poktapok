/**
 * Image Compression Utilities
 *
 * Client-side image compression using browser-image-compression
 */

import imageCompression from 'browser-image-compression';

export const COMPRESSION_CONFIG = {
  maxSizeMB: 5,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/webp', // Convert to WebP for better compression
  initialQuality: 0.8,
} as const;

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  initialQuality?: number;
  preserveFormat?: boolean; // Keep original format instead of converting to WebP
}

/**
 * Compress an image file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const compressionOptions = {
    maxSizeMB: options.maxSizeMB ?? COMPRESSION_CONFIG.maxSizeMB,
    maxWidthOrHeight: options.maxWidthOrHeight ?? COMPRESSION_CONFIG.maxWidthOrHeight,
    useWebWorker: options.useWebWorker ?? COMPRESSION_CONFIG.useWebWorker,
    initialQuality: options.initialQuality ?? COMPRESSION_CONFIG.initialQuality,
    ...(options.preserveFormat ? {} : { fileType: COMPRESSION_CONFIG.fileType }),
  };

  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    // Return original file if compression fails
    return file;
  }
}

/**
 * Compress multiple images
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  const compressionPromises = files.map(file => compressImage(file, options));
  return Promise.all(compressionPromises);
}

/**
 * Get compression stats
 */
export function getCompressionStats(originalSize: number, compressedSize: number) {
  const savedBytes = originalSize - compressedSize;
  const savedPercentage = ((savedBytes / originalSize) * 100).toFixed(1);

  return {
    originalSize,
    compressedSize,
    savedBytes,
    savedPercentage: `${savedPercentage}%`,
    compressionRatio: (compressedSize / originalSize).toFixed(2),
  };
}

/**
 * Create preview URL from file
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke preview URL to free memory
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Compress image with progress callback
 */
export async function compressImageWithProgress(
  file: File,
  onProgress?: (progress: number) => void,
  options: CompressionOptions = {}
): Promise<File> {
  const compressionOptions = {
    maxSizeMB: options.maxSizeMB ?? COMPRESSION_CONFIG.maxSizeMB,
    maxWidthOrHeight: options.maxWidthOrHeight ?? COMPRESSION_CONFIG.maxWidthOrHeight,
    useWebWorker: options.useWebWorker ?? COMPRESSION_CONFIG.useWebWorker,
    initialQuality: options.initialQuality ?? COMPRESSION_CONFIG.initialQuality,
    onProgress: onProgress,
    ...(options.preserveFormat ? {} : { fileType: COMPRESSION_CONFIG.fileType }),
  };

  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    return file;
  }
}
