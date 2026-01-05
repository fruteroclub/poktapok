'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { blo } from 'blo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Upload, X } from 'lucide-react'
import { toast } from 'sonner'

interface AvatarUploadProps {
  currentAvatarUrl: string | null
  username?: string
  displayName?: string | null
  ethAddress?: `0x${string}` | null
  onFileSelect: (file: File | null) => void
  disabled?: boolean
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Pure UI component for avatar selection and preview
 *
 * Responsibilities:
 * - File selection interface with validation feedback
 * - Live preview display before upload
 * - Fallback avatar generation (blo for Ethereum addresses, initials otherwise)
 * - Client-side validation (file type, size)
 * - Returns selected File object to parent via callback
 *
 * Does NOT handle:
 * - API calls or upload orchestration
 * - State management beyond preview
 * - Success/error notifications (parent handles via service layer)
 */
export function AvatarUpload({
  currentAvatarUrl,
  username,
  displayName,
  ethAddress,
  onFileSelect,
  disabled = false,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Generate fallback image from Ethereum address (if available)
  const bloFallback = ethAddress ? blo(ethAddress) : undefined

  // Get initials for fallback
  const initials = displayName
    ? displayName.charAt(0).toUpperCase()
    : username
      ? username.charAt(0).toUpperCase()
      : '?'

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) {
      return
    }

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or WebP image')
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 5MB')
      return
    }

    // Set selected file
    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Notify parent of file selection
    onFileSelect(file)
  }

  // Handle cancel
  const handleCancel = () => {
    setPreview(currentAvatarUrl)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    // Notify parent of cancellation
    onFileSelect(null)
  }

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Preview */}
      <Avatar className="h-24 w-24">
        {preview ? (
          <AvatarImage src={preview} alt={displayName || username || 'User'} />
        ) : bloFallback ? (
          <AvatarImage src={bloFallback} alt="Ethereum avatar" />
        ) : null}
        <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
      </Avatar>

      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Action Buttons */}
      <div className="flex gap-2">
        {selectedFile ? (
          // Cancel button when file selected (parent handles submit)
          <Button
            type="button"
            onClick={handleCancel}
            disabled={disabled}
            variant="outline"
            size="sm"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        ) : (
          // Change avatar button when no file selected
          <Button
            type="button"
            onClick={triggerFileInput}
            disabled={disabled}
            variant="outline"
            size="sm"
          >
            <Upload className="mr-2 h-4 w-4" />
            Change Avatar
          </Button>
        )}
      </div>
    </div>
  )
}
