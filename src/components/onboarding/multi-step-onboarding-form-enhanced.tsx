'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Github,
  Twitter,
  Linkedin,
  MessageCircle
} from 'lucide-react'
import { UserInfoForm } from './user-info-form'
import { GoalInput } from './goal-input'
import { SocialAccountsFormEnhanced } from './social-accounts-form-enhanced'
import { useSubmitApplication } from '@/hooks/use-onboarding'
import { usePrivy } from '@privy-io/react-auth'

type OnboardingStep = 'userInfo' | 'goal' | 'social' | 'review'

interface FormData {
  // User Info
  avatarFile: File | null
  username: string
  email: string
  displayName: string
  bio: string

  // Goal
  goal: string

  // Social Accounts (all usernames only)
  githubUsername: string
  twitterUsername: string
  linkedinUsername: string
  telegramUsername: string
}

type FormErrors = Partial<Record<keyof FormData, string>>

export default function MultiStepOnboardingFormEnhanced() {
  const router = useRouter()
  const { user } = usePrivy()
  const submitMutation = useSubmitApplication()

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('userInfo')
  const [formData, setFormData] = useState<FormData>({
    // User Info
    avatarFile: null,
    username: '',
    email: user?.email?.address || '',
    displayName: '',
    bio: '',

    // Goal
    goal: '',

    // Social Accounts
    githubUsername: '',
    twitterUsername: '',
    linkedinUsername: '',
    telegramUsername: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Step configuration - memoized to prevent recreation
  const steps = useMemo<OnboardingStep[]>(() =>
    ['userInfo', 'goal', 'social', 'review'], []
  )

  const stepTitles = useMemo<Record<OnboardingStep, string>>(() => ({
    userInfo: 'Tu Información',
    goal: 'Define tu Meta',
    social: 'Conecta tus Cuentas',
    review: 'Revisa y Envía',
  }), [])

  const currentStepIndex = steps.indexOf(currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  // Validation functions
  const validateUserInfoStep = (): boolean => {
    const newErrors: FormErrors = {}

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido'
    } else if (!/^[a-z0-9_]{3,50}$/.test(formData.username)) {
      newErrors.username = 'Formato inválido (3-50 caracteres, minúsculas, números y guiones bajos)'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de correo inválido'
    }

    // Display name validation (optional)
    if (formData.displayName && formData.displayName.length > 100) {
      newErrors.displayName = 'El nombre para mostrar no puede exceder 100 caracteres'
    }

    // Bio validation (optional)
    if (formData.bio && formData.bio.length > 280) {
      newErrors.bio = 'La biografía no puede exceder 280 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateGoalStep = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.goal.trim()) {
      newErrors.goal = 'La meta es requerida'
    } else if (formData.goal.length > 280) {
      newErrors.goal = 'La meta no puede exceder 280 caracteres'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateSocialStep = (): boolean => {
    // All social accounts are optional, so no validation errors
    return true
  }

  // Check username availability - memoized
  const checkUsernameAvailability = useCallback(async (username: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`)
      if (!response.ok) return false
      const { available } = await response.json()
      return available
    } catch (error) {
      console.error('Error checking username availability:', error)
      return false
    }
  }, [])

  // Navigation handlers
  const handleNext = () => {
    let isValid = false

    switch (currentStep) {
      case 'userInfo':
        isValid = validateUserInfoStep()
        break
      case 'goal':
        isValid = validateGoalStep()
        break
      case 'social':
        isValid = validateSocialStep()
        break
      case 'review':
        isValid = true
        break
    }

    if (isValid) {
      const nextIndex = currentStepIndex + 1
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex])
      }
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex])
      setErrors({})
    }
  }

  const handleSubmit = async () => {
    try {
      // Step 1: Upload avatar if provided
      let avatarUrl = null
      if (formData.avatarFile) {
        const avatarFormData = new FormData()
        avatarFormData.append('file', formData.avatarFile)

        const avatarResponse = await fetch('/api/profiles/avatar', {
          method: 'POST',
          body: avatarFormData,
        })

        if (avatarResponse.ok) {
          const { url } = await avatarResponse.json()
          avatarUrl = url
        }
      }

      // Step 2: Update user profile
      await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          displayName: formData.displayName || undefined,
          bio: formData.bio || undefined,
          avatarUrl: avatarUrl || undefined,
        }),
      })

      // Step 3: Submit application
      submitMutation.mutate(
        {
          goal: formData.goal,
          githubUsername: formData.githubUsername || undefined,
          twitterUsername: formData.twitterUsername || undefined,
          // Convert LinkedIn username back to URL for backwards compatibility
          linkedinUrl: formData.linkedinUsername
            ? `https://linkedin.com/in/${formData.linkedinUsername}`
            : undefined,
          telegramUsername: formData.telegramUsername || undefined,
        },
        {
          onSuccess: () => {
            toast.success('¡Aplicación enviada exitosamente!')
            toast.info('Tu aplicación está siendo revisada. Te notificaremos pronto.')
            router.push('/profile')
          },
          onError: (error) => {
            toast.error(error.message || 'Error al enviar la aplicación')
          },
        },
      )
    } catch (error) {
      toast.error('Error al procesar la aplicación')
      console.error('Submission error:', error)
    }
  }

  // Helper function to get initials
  const getInitials = (name?: string): string => {
    if (!name) return '?'
    return name.charAt(0).toUpperCase()
  }

  // Handle form data changes - memoized
  const handleFormDataChange = useCallback((field: string, value: string | File | null) => {
    if (field === 'avatarFile' && value instanceof File) {
      // Create preview for avatar
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(value)
    }

    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  // Memoized handlers for child components
  const handleGoalChange = useCallback((goal: string) => {
    setFormData((prev) => ({ ...prev, goal }))
  }, [])

  const handleSocialChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'userInfo':
        return (
          <UserInfoForm
            values={{
              avatarFile: formData.avatarFile,
              username: formData.username,
              email: formData.email,
              displayName: formData.displayName,
              bio: formData.bio,
            }}
            onChange={handleFormDataChange}
            errors={errors}
            checkUsernameAvailability={checkUsernameAvailability}
            currentUser={{
              email: user?.email?.address,
              ethAddress: user?.wallet?.address as `0x${string}` | undefined,
            }}
          />
        )

      case 'goal':
        return (
          <GoalInput
            value={formData.goal}
            onChange={handleGoalChange}
            error={errors.goal}
          />
        )

      case 'social':
        return (
          <SocialAccountsFormEnhanced
            values={{
              githubUsername: formData.githubUsername,
              twitterUsername: formData.twitterUsername,
              linkedinUsername: formData.linkedinUsername,
              telegramUsername: formData.telegramUsername,
            }}
            onChange={handleSocialChange}
            errors={errors}
          />
        )

      case 'review':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Revisa tu información</h3>
              <p className="text-sm text-muted-foreground">
                Por favor verifica que toda la información sea correcta antes de enviar tu
                aplicación.
              </p>
            </div>

            {/* User Info Summary */}
            <div className="space-y-3 rounded-lg border p-4">
              <h4 className="font-semibold">Tu Información</h4>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  {avatarPreview && <AvatarImage src={avatarPreview} alt="Avatar" />}
                  <AvatarFallback>
                    {getInitials(formData.displayName || formData.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="font-medium">
                    {formData.displayName || formData.username}
                  </div>
                  <div className="text-sm text-muted-foreground">@{formData.username}</div>
                  <div className="text-sm text-muted-foreground">{formData.email}</div>
                  {formData.bio && (
                    <div className="text-sm mt-2 text-muted-foreground">{formData.bio}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Goal summary */}
            <div className="space-y-3 rounded-lg border p-4">
              <h4 className="font-semibold">Meta</h4>
              <p className="text-sm">{formData.goal}</p>
            </div>

            {/* Social accounts summary */}
            {(formData.githubUsername ||
              formData.twitterUsername ||
              formData.linkedinUsername ||
              formData.telegramUsername) && (
              <div className="space-y-3 rounded-lg border p-4">
                <h4 className="font-semibold">Cuentas conectadas</h4>
                <div className="space-y-2 text-sm">
                  {formData.githubUsername && (
                    <div className="flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      <span>github.com/{formData.githubUsername}</span>
                    </div>
                  )}
                  {formData.linkedinUsername && (
                    <div className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      <span>linkedin.com/in/{formData.linkedinUsername}</span>
                    </div>
                  )}
                  {formData.twitterUsername && (
                    <div className="flex items-center gap-2">
                      <Twitter className="h-4 w-4" />
                      <span>x.com/{formData.twitterUsername}</span>
                    </div>
                  )}
                  {formData.telegramUsername && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>@{formData.telegramUsername}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{stepTitles[currentStep]}</span>
          <span className="text-muted-foreground">
            Paso {currentStepIndex + 1} de {steps.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">{renderStepContent()}</div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={currentStepIndex === 0 || submitMutation.isPending}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>

        {currentStep === 'review' ? (
          <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Aplicación'
            )}
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={submitMutation.isPending}>
            Siguiente
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}