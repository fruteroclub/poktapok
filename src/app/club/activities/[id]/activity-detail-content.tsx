'use client'

/**
 * ActivityDetailContent - Client component for activity detail page
 * Displays activity information and submission form
 */

import { useState } from 'react'
import { ArrowLeft, Trophy, Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import PageWrapper from '@/components/layout/page-wrapper'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useActivityDetail, useSubmitActivity } from '@/hooks/use-activities'
import { usePrivy } from '@privy-io/react-auth'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ActivityDetailContentProps {
  activityId: string
}

export function ActivityDetailContent({ activityId }: ActivityDetailContentProps) {
  const router = useRouter()
  const { authenticated } = usePrivy()
  const { data, isLoading, isError, error } = useActivityDetail(activityId)
  const submitMutation = useSubmitActivity()

  const [submissionUrl, setSubmissionUrl] = useState('')
  const [submissionText, setSubmissionText] = useState('')

  if (isError) {
    return (
      <PageWrapper>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive">Error al cargar actividad</h2>
            <p className="mt-2 text-muted-foreground">
              {error instanceof Error ? error.message : 'Ocurrió un error desconocido'}
            </p>
            <Button variant="outline" onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="mr-2 size-4" />
              Volver
            </Button>
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="space-y-8">
          <Skeleton className="h-10 w-3/4" />
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </Card>
            ))}
          </div>
          <Card className="p-6">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="mt-4 h-32 w-full" />
          </Card>
        </div>
      </PageWrapper>
    )
  }

  if (!data) {
    return null
  }

  const { activity } = data

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  }

  const difficultyLabels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  }

  const difficulty = activity.difficulty as 'beginner' | 'intermediate' | 'advanced'

  const handleSubmit = () => {
    if (!authenticated) {
      toast.error('Debes iniciar sesión para enviar una actividad')
      router.push('/onboarding')
      return
    }

    if (!submissionUrl && !submissionText) {
      toast.error('Debes proporcionar al menos un URL o texto de entrega')
      return
    }

    submitMutation.mutate(
      {
        activityId,
        data: {
          submission_url: submissionUrl || undefined,
          submission_text: submissionText || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success('Actividad enviada exitosamente')
          setSubmissionUrl('')
          setSubmissionText('')
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Error al enviar actividad')
        },
      }
    )
  }

  const isSlotsAvailable =
    !activity.totalAvailableSlots ||
    activity.currentSubmissionsCount < activity.totalAvailableSlots

  return (
    <PageWrapper>
      <div className="space-y-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 size-4" />
          Volver a actividades
        </Button>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-start gap-3">
            <h1 className="flex-1 text-4xl font-bold">{activity.title}</h1>
            <Badge className={difficultyColors[difficulty]}>{difficultyLabels[difficulty]}</Badge>
            {activity.status === 'active' && isSlotsAvailable && (
              <Badge variant="outline" className="border-green-500 text-green-700">
                Activa
              </Badge>
            )}
          </div>
          <p className="text-lg text-muted-foreground">{activity.description}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Trophy className="size-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{activity.rewardPulpaAmount} $PULPA</p>
                <p className="text-sm text-muted-foreground">Recompensa</p>
              </div>
            </div>
          </Card>

          {activity.totalAvailableSlots && (
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Users className="size-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">
                    {activity.currentSubmissionsCount}/{activity.totalAvailableSlots}
                  </p>
                  <p className="text-sm text-muted-foreground">Participantes</p>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-8 text-primary" />
              <div>
                <Badge variant="secondary">{activity.activityType}</Badge>
                <p className="mt-1 text-sm text-muted-foreground">Tipo de actividad</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Instructions */}
        {activity.instructions && (
          <Card className="p-6">
            <h2 className="text-xl font-bold">Instrucciones</h2>
            <div className="mt-4 whitespace-pre-wrap text-muted-foreground">
              {activity.instructions}
            </div>
          </Card>
        )}

        {/* Evidence Requirements */}
        <Card className="p-6">
          <h2 className="text-xl font-bold">Requisitos de evidencia</h2>
          <div className="mt-4 space-y-2">
            {activity.evidenceRequirements.url_required && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-green-600" />
                <span>URL requerido (GitHub, demo, etc.)</span>
              </div>
            )}
            {activity.evidenceRequirements.screenshot_required && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-green-600" />
                <span>Captura de pantalla requerida</span>
              </div>
            )}
            {activity.evidenceRequirements.text_required && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-green-600" />
                <span>Descripción de texto requerida</span>
              </div>
            )}
          </div>
        </Card>

        {/* Submission Form */}
        {authenticated ? (
          isSlotsAvailable ? (
            <Card className="p-6">
              <h2 className="text-xl font-bold">Enviar tu trabajo</h2>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    URL de entrega {activity.evidenceRequirements.url_required && '*'}
                  </label>
                  <Input
                    type="url"
                    placeholder="https://github.com/tu-usuario/proyecto"
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    className="mt-2"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    GitHub, demo en vivo, o cualquier URL relevante
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Descripción {activity.evidenceRequirements.text_required && '*'}
                  </label>
                  <Textarea
                    placeholder="Describe tu trabajo y cómo cumpliste los requisitos..."
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {submitMutation.isPending ? 'Enviando...' : 'Enviar actividad'}
                </Button>
              </div>
            </Card>
          ) : (
            <Alert>
              <AlertCircle className="size-4" />
              <AlertTitle>Cupos llenos</AlertTitle>
              <AlertDescription>
                Esta actividad ha alcanzado el límite máximo de participantes. Mantente atento a nuevas actividades.
              </AlertDescription>
            </Alert>
          )
        ) : (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 p-8">
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
              <div className="flex-1">
                <h3 className="text-2xl font-bold">¿Listo para participar?</h3>
                <p className="mt-2 text-muted-foreground">
                  Inicia sesión para enviar tu trabajo y ganar $PULPA tokens
                </p>
              </div>
              <Button size="lg" onClick={() => router.push('/onboarding')}>
                Comenzar aplicación
              </Button>
            </div>
          </Card>
        )}
      </div>
    </PageWrapper>
  )
}
