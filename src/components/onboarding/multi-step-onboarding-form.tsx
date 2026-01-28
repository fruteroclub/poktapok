'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { ProgramSelector } from './program-selector'
import { GoalInput } from './goal-input'
import { SocialAccountsForm } from './social-accounts-form'
import { useSubmitApplication } from '@/hooks/use-onboarding'

type OnboardingStep = 'program' | 'goal' | 'social' | 'review'

interface FormData {
  programId: string
  goal: string
  motivationText: string
  githubUsername: string
  twitterUsername: string
  linkedinUrl: string
  telegramUsername: string
}

interface FormErrors {
  [key: string]: string
}

export default function MultiStepOnboardingForm() {
  const router = useRouter()
  const submitMutation = useSubmitApplication()

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('program')
  const [formData, setFormData] = useState<FormData>({
    programId: '',
    goal: '',
    motivationText: '',
    githubUsername: '',
    twitterUsername: '',
    linkedinUrl: '',
    telegramUsername: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  // Step configuration
  const steps: OnboardingStep[] = ['program', 'goal', 'social', 'review']
  const stepTitles: Record<OnboardingStep, string> = {
    program: 'Elige tu Programa',
    goal: 'Define tu Meta',
    social: 'Conecta tus Cuentas',
    review: 'Revisa y Envía',
  }

  const currentStepIndex = steps.indexOf(currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  // Validation functions
  const validateProgramStep = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.programId) {
      newErrors.programId = 'Debes seleccionar un programa'
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
    if (!formData.motivationText.trim()) {
      newErrors.motivationText = 'Este campo es requerido'
    } else if (formData.motivationText.length > 500) {
      newErrors.motivationText = 'No puede exceder 500 caracteres'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateSocialStep = (): boolean => {
    const newErrors: FormErrors = {}
    if (formData.linkedinUrl && !/^https?:\/\/.+/.test(formData.linkedinUrl)) {
      newErrors.linkedinUrl = 'URL de LinkedIn inválida'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Navigation handlers
  const handleNext = () => {
    let isValid = false

    switch (currentStep) {
      case 'program':
        isValid = validateProgramStep()
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

  const handleSubmit = () => {
    submitMutation.mutate(
      {
        programId: formData.programId,
        goal: formData.goal,
        motivationText: formData.motivationText,
        githubUsername: formData.githubUsername || undefined,
        twitterUsername: formData.twitterUsername || undefined,
        linkedinUrl: formData.linkedinUrl || undefined,
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

      {/* Step content - render all, show/hide with CSS to preserve input state */}
      <div className="min-h-[400px]">
        {/* Program Step */}
        <div className={currentStep === 'program' ? 'block' : 'hidden'}>
          <ProgramSelector
            value={formData.programId}
            onChange={(programId) => setFormData((prev) => ({ ...prev, programId }))}
            error={errors.programId}
          />
        </div>

        {/* Goal Step */}
        <div className={currentStep === 'goal' ? 'block' : 'hidden'}>
          <GoalInput
            goal={formData.goal}
            onGoalChange={(goal) => setFormData((prev) => ({ ...prev, goal }))}
            goalError={errors.goal}
            motivationText={formData.motivationText}
            onMotivationChange={(motivationText) =>
              setFormData((prev) => ({ ...prev, motivationText }))
            }
            motivationError={errors.motivationText}
          />
        </div>

        {/* Social Step */}
        <div className={currentStep === 'social' ? 'block' : 'hidden'}>
          <SocialAccountsForm
            values={{
              githubUsername: formData.githubUsername,
              twitterUsername: formData.twitterUsername,
              linkedinUrl: formData.linkedinUrl,
              telegramUsername: formData.telegramUsername,
            }}
            onChange={(field, value) => setFormData((prev) => ({ ...prev, [field]: value }))}
            errors={errors}
          />
        </div>

        {/* Review Step */}
        <div className={currentStep === 'review' ? 'block' : 'hidden'}>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Revisa tu información</h3>
              <p className="text-sm text-muted-foreground">
                Por favor verifica que toda la información sea correcta antes de enviar tu
                aplicación.
              </p>
            </div>

            {/* Goal summary */}
            <div className="space-y-3 rounded-lg border p-4">
              <h4 className="font-semibold">Meta</h4>
              <p className="text-sm">{formData.goal}</p>
            </div>

            {/* Motivation summary */}
            <div className="space-y-3 rounded-lg border p-4">
              <h4 className="font-semibold">¿Por qué quieres unirte?</h4>
              <p className="text-sm">{formData.motivationText}</p>
            </div>

            {/* Social accounts summary */}
            {(formData.githubUsername ||
              formData.twitterUsername ||
              formData.linkedinUrl ||
              formData.telegramUsername) && (
              <div className="space-y-3 rounded-lg border p-4">
                <h4 className="font-semibold">Cuentas conectadas</h4>
                <div className="space-y-2 text-sm">
                  {formData.githubUsername && (
                    <div>
                      <span className="text-muted-foreground">GitHub:</span>{' '}
                      <span className="font-medium">@{formData.githubUsername}</span>
                    </div>
                  )}
                  {formData.twitterUsername && (
                    <div>
                      <span className="text-muted-foreground">X/Twitter:</span>{' '}
                      <span className="font-medium">@{formData.twitterUsername}</span>
                    </div>
                  )}
                  {formData.linkedinUrl && (
                    <div>
                      <span className="text-muted-foreground">LinkedIn:</span>{' '}
                      <span className="font-medium text-xs break-all">{formData.linkedinUrl}</span>
                    </div>
                  )}
                  {formData.telegramUsername && (
                    <div>
                      <span className="text-muted-foreground">Telegram:</span>{' '}
                      <span className="font-medium">@{formData.telegramUsername}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
