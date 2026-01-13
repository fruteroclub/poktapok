'use client'

import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import { useUploadAvatar } from '@/hooks/use-profile'
import { useUpdateUser } from '@/hooks/use-auth'
import { ApiError } from '@/lib/api/fetch'

export default function OnboardingForm() {
  const { user } = usePrivy()
  const router = useRouter()

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
    avatarUrl: '',
    email: privyEmail, // Allow user to edit email if not provided by Privy
  })

  // Mutations
  const uploadAvatarMutation = useUploadAvatar()
  const updateUserMutation = useUpdateUser()

  // Avatar upload handler
  const handleAvatarFileSelect = async (file: File | null) => {
    if (!file) return

    try {
      const avatarUrl = await uploadAvatarMutation.mutateAsync(file)
      setFormData({ ...formData, avatarUrl })
      toast.success('Avatar uploaded successfully')
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Failed to upload avatar')
      }
    }
  }

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateUserMutation.mutateAsync(formData)
      toast.success('¡Perfil completado exitosamente!')
      router.push('/profile')
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Error al actualizar perfil. Intenta de nuevo')
      }
    }
  }

  const isSubmitting = updateUserMutation.isPending
  const isUploadingAvatar = uploadAvatarMutation.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Avatar Upload Section - TOP OF FORM */}
      <div className="flex flex-col items-center gap-2">
        <AvatarUpload
          currentAvatarUrl={formData.avatarUrl || null}
          username={formData.username || undefined}
          displayName={formData.displayName || undefined}
          ethAddress={ethAddress}
          onFileSelect={handleAvatarFileSelect}
          disabled={isSubmitting || isUploadingAvatar}
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
          placeholder="tu@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || isUploadingAvatar}
      >
        {isSubmitting
          ? 'Guardando...'
          : isUploadingAvatar
            ? 'Subiendo avatar...'
            : 'Completar perfil'}
      </Button>
    </form>
  )
}
