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

  // Track uploaded avatar separately
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(
    null,
  )

  // Handle avatar upload completion
  const handleAvatarUpload = (newAvatarUrl: string) => {
    setUploadedAvatarUrl(newAvatarUrl)
    toast.success('¡Avatar subido exitosamente!')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // Update user profile (privyDid extracted from token by middleware)
      const response = await fetch('/api/users/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          email: privyEmail, // Use email from Privy (read-only)
          avatarUrl: uploadedAvatarUrl, // Include uploaded avatar URL (or null)
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        // Handle new error format: { success: false, error: { message, code?, details? } }
        const errorMessage =
          responseData.error?.message ||
          responseData.error ||
          'Failed to update profile'
        throw new Error(errorMessage)
      }

      // Invalidate auth query to refetch user with updated status
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })

      toast.success('¡Perfil completado exitosamente!')
      router.push('/profile')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al actualizar perfil. Intenta de nuevo',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Avatar Upload Section - TOP OF FORM */}
      <div className="flex flex-col items-center gap-2">
        <AvatarUpload
          currentAvatarUrl={uploadedAvatarUrl}
          username={formData.username || undefined}
          displayName={formData.displayName || undefined}
          ethAddress={ethAddress}
          onUploadComplete={handleAvatarUpload}
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
