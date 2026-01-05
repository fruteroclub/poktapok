'use client'

import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import { uploadAvatar } from '@/services/profile'
import { updateUser } from '@/services/auth'
import { ApiError } from '@/lib/api/fetch'

export default function OnboardingForm() {
  const { user } = usePrivy()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Extract email from Privy user (email, Google, GitHub, Discord)
  const privyEmail =
    user?.email?.address ||
    user?.google?.email ||
    user?.github?.email ||
    user?.discord?.email ||
    ''

  // Extract Ethereum address from Privy wallet (if available)
  const ethAddress = user?.wallet?.address as `0x${string}` | undefined

  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    bio: '',
  })

  // Track selected avatar file (not uploaded yet)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null,
  )

  // Handle avatar file selection (UI component returns File object)
  const handleAvatarFileSelect = (file: File | null) => {
    setSelectedAvatarFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // Step 1: Upload avatar if selected (service handles FormData and API call)
      let avatarUrl = null
      if (selectedAvatarFile) {
        try {
          avatarUrl = await uploadAvatar(selectedAvatarFile)
        } catch (error) {
          // Avatar upload failed - warn user but allow profile completion
          if (error instanceof ApiError) {
            toast.error(`Avatar upload failed: ${error.message}`)
          } else {
            toast.error('Avatar upload failed')
          }
          // Continue without avatar
        }
      }

      // Step 2: Update user with all form data + avatar URL (service handles API call)
      await updateUser({
        ...formData,
        email: privyEmail, // Use email from Privy (read-only)
        avatarUrl, // Include uploaded avatar URL (or null)
      })

      // Invalidate auth query to refetch user with updated status
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })

      toast.success('¡Perfil completado exitosamente!')
      router.push('/profile')
    } catch (error) {
      console.error('Error updating profile:', error)
      // Structured error handling from ApiError
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Error al actualizar perfil. Intenta de nuevo')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Avatar Upload Section - TOP OF FORM */}
      <div className="flex flex-col items-center gap-2">
        <AvatarUpload
          currentAvatarUrl={null}
          username={formData.username || undefined}
          displayName={formData.displayName || undefined}
          ethAddress={ethAddress}
          onFileSelect={handleAvatarFileSelect}
          disabled={isSubmitting}
        />
        <p className="text-center text-sm text-muted-foreground">
          Sube una foto de perfil (opcional)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          required
          disabled
          placeholder="tu@email.com"
          value={privyEmail}
          className="cursor-not-allowed"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">
          Nombre de usuario <span className="text-destructive">*</span>
        </Label>
        <Input
          id="username"
          type="text"
          required
          placeholder="usuario123"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          pattern="^[a-z0-9_]{3,50}$"
          title="Solo minúsculas, números y guiones bajos (3-50 caracteres)"
        />
        <p className="text-sm text-muted-foreground">
          Solo minúsculas, números y guiones bajos (3-50 caracteres)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">
          Nombre para mostrar <span className="text-destructive">*</span>
        </Label>
        <Input
          id="displayName"
          type="text"
          required
          placeholder="Tu Nombre"
          value={formData.displayName}
          onChange={(e) =>
            setFormData({ ...formData, displayName: e.target.value })
          }
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio (opcional)</Label>
        <Textarea
          id="bio"
          placeholder="Cuéntanos sobre ti..."
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          maxLength={280}
          rows={4}
        />
        <p className="text-sm text-muted-foreground">
          {formData.bio.length}/280 caracteres
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : 'Completar perfil'}
      </Button>
    </form>
  )
}
