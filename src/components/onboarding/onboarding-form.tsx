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

export default function OnboardingForm() {
  const { user } = usePrivy()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    displayName: '',
    bio: '',
    avatarUrl: '',
  })

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
        body: JSON.stringify(formData),
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
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div className="space-y-2">
        <Label htmlFor="avatarUrl">URL del avatar (opcional)</Label>
        <Input
          id="avatarUrl"
          type="url"
          placeholder="https://ejemplo.com/avatar.jpg"
          value={formData.avatarUrl}
          onChange={(e) =>
            setFormData({ ...formData, avatarUrl: e.target.value })
          }
          maxLength={500}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : 'Completar perfil'}
      </Button>
    </form>
  )
}
