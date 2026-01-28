'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Pencil, X, Check, Loader2 } from 'lucide-react'
import { AvatarUpload } from './avatar-upload'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth-store'
import { uploadAvatar } from '@/services/profile'
import { updateUser as updateUserService } from '@/services/auth'
import { ApiError } from '@/lib/api/fetch'
import type { User } from '@/types/api-v1'

interface EditableUserCardProps {
  className?: string
  user: {
    id: string
    username: string | null
    displayName: string | null
    email: string | null
    bio: string | null
    avatarUrl: string | null
    role: string
    accountStatus: string
  }
}

interface UpdateUserData {
  displayName?: string
  bio?: string
}

export function EditableUserCard({ className, user }: EditableUserCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user.displayName || '')
  const [bio, setBio] = useState(user.bio || '')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const { setUser } = useAuthStore()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data: UpdateUserData) => {
      const response = await updateUserService(data)
      return response.user
    },
    onSuccess: (updatedUser: User) => {
      // Update store directly with response data
      setUser(updatedUser)
      // Invalidate React Query cache to trigger parent re-render
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      toast.success('Profile updated successfully')
      setIsEditing(false)
    },
    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Failed to update profile')
      }
    },
  })

  // Handle avatar file selection - immediate upload pattern
  const handleAvatarFileSelect = async (file: File | null) => {
    if (!file) return

    setIsUploadingAvatar(true)

    try {
      // Service handles FormData creation and API call
      const avatarUrl = await uploadAvatar(file)

      // Update store with new avatar URL
      setUser({
        id: user.id,
        username: user.username || '',
        displayName: user.displayName,
        email: user.email,
        bio: user.bio,
        avatarUrl,
        accountStatus: user.accountStatus,
        role: user.role,
      })

      // Invalidate React Query cache to trigger parent re-render
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })

      toast.success('Avatar updated successfully')
    } catch (error) {
      // Structured error handling from ApiError
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Failed to upload avatar')
      }
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSave = () => {
    // Only send fields that are being updated
    mutation.mutate({
      displayName: displayName.trim() || undefined,
      bio: bio.trim() || undefined,
    })
  }

  const handleCancel = () => {
    setDisplayName(user.displayName || '')
    setBio(user.bio || '')
    setIsEditing(false)
  }

  const initials = user.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.username?.slice(0, 2).toUpperCase() || '??'

  return (
    <Card className={className}>
      <CardContent className="space-y-4">
        {/* Avatar Section */}
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            {isEditing ? (
              <AvatarUpload
                currentAvatarUrl={user.avatarUrl}
                username={user.username || ''}
                displayName={user.displayName}
                onFileSelect={handleAvatarFileSelect}
                disabled={isUploadingAvatar}
              />
            ) : (
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={user.avatarUrl || undefined}
                  alt={user.displayName || user.username || 'User'}
                />
                <AvatarFallback className="text-2xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          <div
            className={
              isEditing
                ? 'flex-1 space-y-4'
                : 'flex-1 space-y-2 md:grid md:grid-cols-2 md:gap-2'
            }
          >
            {/* Username (read-only) */}
            <div>
              <label className="text-sm font-semibold">Username</label>
              <p className="text-lg font-semibold">@{user.username}</p>
            </div>

            {/* Display Name */}
            <div>
              <label className="text-sm font-semibold">Display Name</label>
              {isEditing ? (
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                />
              ) : (
                <p className="text-lg">
                  {user.displayName || (
                    <span className="text-gray-400">Not set</span>
                  )}
                </p>
              )}
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="text-sm font-semibold">Email</label>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {user.email || <span className="text-gray-400">Not set</span>}
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="text-sm font-semibold">Bio</label>
              {isEditing ? (
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  rows={5}
                />
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {user.bio || <span className="text-gray-400">Not set</span>}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2">
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={mutation.isPending || isUploadingAvatar}
              >
                Cancelar <X className="ml-1.5 h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={mutation.isPending || isUploadingAvatar}
              >
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Guardar <Check className="ml-1.5 h-4 w-4" />
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              Editar <Pencil className="ml-1.5 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
