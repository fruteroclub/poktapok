'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { profileSchema, type ProfileFormData } from '@/lib/validators/profile'
import { useCreateProfile } from '@/hooks/use-profile'
import { LocationSection } from './location-section'
import { LearningSection } from './learning-section'
import { SocialLinksSection } from './social-links-section'
import { ProfilePreviewModal } from './profile-preview-modal'
import { Eye } from 'lucide-react'

interface ProfileFormProps {
  userInfo: {
    username: string
    displayName: string | null
    avatarUrl: string | null
  }
}

/**
 * ProfileForm - Main profile creation form
 * - Uses React Hook Form + Zod validation
 * - Includes preview modal before submission
 * - Redirects to /dashboard on success
 */
export function ProfileForm({ userInfo }: ProfileFormProps) {
  const router = useRouter()
  const [showPreview, setShowPreview] = useState(false)
  const createProfileMutation = useCreateProfile()

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onBlur',
    defaultValues: {
      city: '',
      country: '',
      countryCode: '',
      learningTrack: undefined as 'ai' | 'crypto' | 'privacy' | undefined,
      availabilityStatus: 'available' as const,
      socialLinks: {
        github: '',
        twitter: '',
        linkedin: '',
        telegram: '',
      },
    },
  })

  const handleSubmit = async (data: ProfileFormData) => {
    try {
      await createProfileMutation.mutate(data as any)
      toast.success('¡Perfil creado exitosamente!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating profile:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al crear perfil. Intenta de nuevo',
      )
    }
  }

  const handlePreview = () => {
    // Trigger validation before showing preview
    form.trigger().then((isValid) => {
      if (isValid) {
        setShowPreview(true)
      } else {
        toast.error('Por favor, completa todos los campos requeridos')
      }
    })
  }

  const handleConfirmSubmit = () => {
    const data = form.getValues()
    handleSubmit(data)
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <LocationSection />
          <LearningSection />
          <SocialLinksSection />

          {/* Action buttons */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="flex-1 gap-2"
              onClick={handlePreview}
              disabled={createProfileMutation.isPending}
            >
              <Eye className="h-4 w-4" />
              Vista Previa
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createProfileMutation.isPending}
            >
              {createProfileMutation.isPending ? 'Creando...' : 'Crear Perfil'}
            </Button>
          </div>
        </form>
      </Form>

      <ProfilePreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={handleConfirmSubmit}
        data={form.getValues()}
        userInfo={userInfo}
        isSubmitting={createProfileMutation.isPending}
      />
    </>
  )
}
