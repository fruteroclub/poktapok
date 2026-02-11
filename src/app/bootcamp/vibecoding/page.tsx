'use client'

import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useAuthWithConvex } from '@/hooks/use-auth-with-convex'
import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  CheckCircle, 
  Circle, 
  ExternalLink, 
  Clock, 
  Send,
  XCircle,
  AlertCircle,
  Lock,
  Rocket
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import PageWrapper from '@/components/layout/page-wrapper'
import { Section } from '@/components/layout/section'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Id } from '../../../../convex/_generated/dataModel'

const LEVEL_COLORS = {
  core: 'bg-green-500/20 text-green-400 border-green-500/30',
  complete: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  excellent: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  bonus: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

const LEVEL_LABELS = {
  core: '🟢 Core',
  complete: '🟡 Completo',
  excellent: '🔵 Excelente',
  bonus: '🟣 Bonus',
}

export default function VibeCodingDashboard() {
  const { user, convexUser, isLoading: authLoading } = useAuthWithConvex()
  const { authenticated } = usePrivy()
  
  const enrollmentData = useQuery(
    api.bootcamp.getEnrollmentWithDetails,
    convexUser?._id ? { programSlug: 'vibecoding', userId: convexUser._id } : 'skip'
  )

  // Loading
  if (authLoading || enrollmentData === undefined) {
    return (
      <PageWrapper>
        <div className="page">
          <div className="page-content">
            <Section className="flex justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Cargando bootcamp...</p>
              </div>
            </Section>
          </div>
        </div>
      </PageWrapper>
    )
  }

  // Not logged in
  if (!authenticated || !convexUser) {
    return (
      <PageWrapper>
        <div className="page">
          <div className="page-content">
            <Section className="flex justify-center py-20">
              <Card className="w-full max-w-md text-center">
                <CardHeader>
                  <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <CardTitle>Acceso restringido</CardTitle>
                  <CardDescription>
                    Debes iniciar sesión para acceder al bootcamp
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href="/">Iniciar sesión</Link>
                  </Button>
                </CardContent>
              </Card>
            </Section>
          </div>
        </div>
      </PageWrapper>
    )
  }

  // Not enrolled
  if (!enrollmentData) {
    return (
      <PageWrapper>
        <div className="page">
          <div className="page-content">
            <Section className="flex justify-center py-20">
              <Card className="w-full max-w-md text-center">
                <CardHeader>
                  <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                  <CardTitle>No estás inscrito</CardTitle>
                  <CardDescription>
                    No tienes acceso al VibeCoding Bootcamp. Si tienes un código de inscripción, úsalo para activar tu lugar.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline">
                    <Link href="/">Volver al inicio</Link>
                  </Button>
                </CardContent>
              </Card>
            </Section>
          </div>
        </div>
      </PageWrapper>
    )
  }

  const { program, enrollment, sessions, deliverables } = enrollmentData

  return (
    <PageWrapper>
      <div className="page">
        <div className="page-content gap-y-8">
          {/* Header */}
          <Section>
            <div className="header-section space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    {program.name}
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    {program.description}
                  </p>
                </div>
                <div className="flex items-center gap-4 bg-card rounded-lg p-4 border">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Progreso</p>
                    <p className="text-2xl font-bold text-primary">{enrollment.progress}%</p>
                  </div>
                  <div className="w-24">
                    <Progress value={enrollment.progress} className="h-3" />
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Sessions Grid */}
          <Section>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sessions.map((session) => {
                // Pick the best deliverable for this session: approved > submitted > needs_revision, then latest
                const sessionDeliverables = deliverables
                  .filter((d) => d.sessionNumber === session.sessionNumber)
                  .sort((a, b) => {
                    const priority: Record<string, number> = { approved: 0, submitted: 1, needs_revision: 2 }
                    const pa = priority[a.status] ?? 3
                    const pb = priority[b.status] ?? 3
                    if (pa !== pb) return pa - pb
                    return (b.submittedAt ?? 0) - (a.submittedAt ?? 0)
                  })
                const deliverable = sessionDeliverables[0]
                return (
                  <SessionCard
                    key={session._id}
                    session={session}
                    deliverable={deliverable}
                    enrollmentId={enrollment._id}
                  />
                )
              })}
            </div>
          </Section>

          {/* Footer */}
          <Section>
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                📚 Contenido del bootcamp en{' '}
                <a
                  href="https://bootcamp.frutero.club"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  bootcamp.frutero.club
                </a>
              </p>
            </div>
          </Section>
        </div>
      </div>
    </PageWrapper>
  )
}

interface SessionCardProps {
  session: {
    _id: Id<'bootcampSessions'>
    sessionNumber: number
    title: string
    deliverableTitle: string
    contentUrl?: string
  }
  deliverable?: {
    _id: Id<'bootcampDeliverables'>
    projectUrl: string
    status: string
    level?: string
    feedback?: string
  }
  enrollmentId: Id<'bootcampEnrollments'>
}

function SessionCard({ session, deliverable, enrollmentId }: SessionCardProps) {
  const [showForm, setShowForm] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [projectUrl, setProjectUrl] = useState(deliverable?.projectUrl || '')
  const [repositoryUrl, setRepositoryUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitDeliverable = useMutation(api.bootcamp.submitDeliverable)

  const handlePreSubmit = () => {
    if (!projectUrl.trim()) {
      setError('El URL del proyecto es requerido')
      return
    }
    setError(null)
    setShowConfirm(true)
  }

  const handleConfirmSubmit = async () => {
    setShowConfirm(false)
    setSubmitting(true)
    setError(null)

    try {
      await submitDeliverable({
        enrollmentId,
        sessionNumber: session.sessionNumber,
        projectUrl: projectUrl.trim(),
        repositoryUrl: repositoryUrl.trim() || undefined,
        notes: notes.trim() || undefined,
      })
      setShowForm(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al enviar')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = () => {
    if (!deliverable) return null

    switch (deliverable.status) {
      case 'submitted':
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            En revisión
          </Badge>
        )
      case 'approved':
        return (
          <Badge variant="outline" className={LEVEL_COLORS[deliverable.level as keyof typeof LEVEL_COLORS] || 'bg-green-500/20 text-green-400'}>
            <CheckCircle className="w-3 h-3 mr-1" />
            {deliverable.level ? LEVEL_LABELS[deliverable.level as keyof typeof LEVEL_LABELS] : 'Aprobado'}
          </Badge>
        )
      case 'needs_revision':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Revisión
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {deliverable?.status === 'approved' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : deliverable ? (
              <Clock className="h-5 w-5 text-yellow-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
            <CardTitle className="text-lg">
              Sesión {session.sessionNumber}
            </CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>{session.title}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div className="bg-muted rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Entregable</p>
          <p className="font-medium text-sm">{session.deliverableTitle}</p>
        </div>

        {session.contentUrl && (
          <a
            href={session.contentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Ver contenido de la sesión
          </a>
        )}

        {deliverable?.feedback && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Feedback del mentor</p>
            <p className="text-sm">{deliverable.feedback}</p>
          </div>
        )}

        {showForm && (
          <div className="space-y-3 pt-2 border-t">
            <div>
              <label className="text-sm font-medium">URL del proyecto *</label>
              <Input
                placeholder="https://mi-regenmon.vercel.app"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Repositorio (opcional)</label>
              <Input
                placeholder="https://github.com/user/repo"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Notas (opcional)</label>
              <Textarea
                placeholder="Comentarios sobre tu entrega..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
                rows={2}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handlePreSubmit}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1" />
                    Revisar y Enviar
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar entrega - Sesión {session.sessionNumber}</AlertDialogTitle>
              <AlertDialogDescription>
                Revisa que la información sea correcta antes de enviar.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-3">
              <div className="rounded-lg border p-3">
                <p className="text-xs font-medium text-muted-foreground">Entregable</p>
                <p className="text-sm font-medium">{session.deliverableTitle}</p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-xs font-medium text-muted-foreground">URL del proyecto</p>
                <a
                  href={projectUrl.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline break-all"
                >
                  {projectUrl.trim()}
                </a>
              </div>

              {repositoryUrl.trim() && (
                <div className="rounded-lg border p-3">
                  <p className="text-xs font-medium text-muted-foreground">Repositorio</p>
                  <a
                    href={repositoryUrl.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {repositoryUrl.trim()}
                  </a>
                </div>
              )}

              {notes.trim() && (
                <div className="rounded-lg border p-3">
                  <p className="text-xs font-medium text-muted-foreground">Notas</p>
                  <p className="text-sm">{notes.trim()}</p>
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Volver a editar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmSubmit}>
                <Send className="h-4 w-4 mr-1" />
                Confirmar entrega
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>

      <CardFooter className="pt-0">
        {!showForm && (
          <>
            {!deliverable ? (
              <Button
                className="w-full"
                onClick={() => setShowForm(true)}
              >
                <Rocket className="h-4 w-4 mr-2" />
                Entregar
              </Button>
            ) : deliverable.status === 'needs_revision' ? (
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setShowForm(true)}
              >
                Reenviar entrega
              </Button>
            ) : deliverable.status === 'submitted' ? (
              <Button className="w-full" variant="secondary" disabled>
                <Clock className="h-4 w-4 mr-2" />
                Esperando revisión
              </Button>
            ) : (
              <Button className="w-full" variant="secondary" disabled>
                <CheckCircle className="h-4 w-4 mr-2" />
                Completado
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  )
}
