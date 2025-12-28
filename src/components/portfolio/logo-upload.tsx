/**
 * LogoUpload Component
 *
 * Project logo upload with drag-and-drop, compression, and preview
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { X, Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { validateImage } from '@/lib/upload/image-validation';
import { compressImage, createPreviewUrl, revokePreviewUrl } from '@/lib/upload/image-compression';

interface LogoUploadProps {
  projectId: string | null; // null for new projects (upload after creation)
  currentLogoUrl?: string | null;
  onUploadComplete?: (logoUrl: string) => void;
  onDelete?: () => void;
  disabled?: boolean;
}

export function LogoUpload({
  projectId,
  currentLogoUrl,
  onUploadComplete,
  onDelete,
  disabled = false,
}: LogoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Validate file
      const error = validateImage(file);
      if (error) {
        toast.error(error.message);
        return;
      }

      try {
        setIsUploading(true);

        // Compress image
        toast.info('Compressing image...');
        const compressedFile = await compressImage(file, { preserveFormat: false });

        // Show preview
        const preview = createPreviewUrl(compressedFile);
        if (previewUrl && previewUrl.startsWith('blob:')) {
          revokePreviewUrl(previewUrl);
        }
        setPreviewUrl(preview);

        // If projectId exists, upload immediately
        if (projectId) {
          const formData = new FormData();
          formData.append('logo', compressedFile);

          toast.info('Uploading logo...');
          const response = await fetch(`/api/projects/${projectId}/logo`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Upload failed');
          }

          const data = await response.json();
          const logoUrl = data.data.logoUrl;

          // Update preview with uploaded URL
          setPreviewUrl(logoUrl);
          toast.success('Logo uploaded successfully');

          onUploadComplete?.(logoUrl);
        } else {
          // For new projects, just show preview (will upload on form submit)
          toast.success('Logo ready to upload');
          onUploadComplete?.(preview);
        }
      } catch (error) {
        console.error('Logo upload error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to upload logo');
        setPreviewUrl(currentLogoUrl || null);
      } finally {
        setIsUploading(false);
      }
    },
    [projectId, currentLogoUrl, previewUrl, onUploadComplete]
  );

  const handleDelete = async () => {
    if (!projectId || !currentLogoUrl) return;

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/projects/${projectId}/logo`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete logo');
      }

      setPreviewUrl(null);
      toast.success('Logo removed successfully');

      onDelete?.();
    } catch (error) {
      console.error('Logo delete error:', error);
      toast.error('Failed to delete logo');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleFileSelect(file);
      } else {
        toast.error('Please drop an image file');
      }
    },
    [handleFileSelect]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Project Logo</label>
        {previewUrl && projectId && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting || disabled}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            Remove
          </Button>
        )}
      </div>

      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8
          transition-colors cursor-pointer
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          onChange={handleFileInputChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {previewUrl ? (
          <div className="flex flex-col items-center space-y-4">
            <img
              src={previewUrl}
              alt="Logo preview"
              className="max-w-full max-h-48 object-contain rounded-md"
            />
            <p className="text-sm text-muted-foreground">
              Click or drag to replace
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <div className="rounded-full bg-muted p-4">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Drag and drop or click to upload logo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPEG, PNG, WebP, SVG • Max 5MB
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Your project logo will be displayed on cards and detail pages. Square images work best.
      </p>
    </div>
  );
}
