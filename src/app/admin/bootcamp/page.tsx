'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useAuthWithConvex } from '@/hooks/use-auth-with-convex'
import PageWrapper from '@/components/layout/page-wrapper'
import { AdminRoute } from '@/components/layout/admin-route-wrapper'
import { Section } from '@/components/layout/section'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Loader2, ExternalLink, CheckCircle, XCircle, Clock, 
  GraduationCap, Users, FileCheck, AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import type { Id } from '../../../../convex/_generated/dataModel'

type DeliverableStatus = 'submitted' | 'approved' | 'needs_revision'
type Level = 'core' | 'complete' | 'excellent' | 'bonus'

const statusLabels: Record<DeliverableStatus, string> = {
  submitted: 'Pendiente',
  approved: 'Aprobado',
  needs_revision: 'Necesita Revisión',
}

const statusColors: Record<DeliverableStatus, string> = {
  submitted: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
  approved: 'bg-green-500/10 text-green-500 border-green-500/30',
  needs_revision: 'bg-red-500/10 text-red-500 border-red-500/30',
}

const levelLabels: Record<Level, string> = {
  core: '🟢 Core',
  complete: '🟡 Completo',
  excellent: '🔵 Excelente',
  bonus: '🟣 Bonus',
}

const levelColors: Record<Level, string> = {
  core: 'bg-green-500/20 text-green-400 border-green-500/30',
  complete: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  excellent: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  bonus: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

export default function AdminBootcampPage() {
  const { convexUser } = useAuthWithConvex()
  const [statusFilter, setStatusFilter] = useState<DeliverableStatus | 'all'>('submitted')
  
  // Get programs
  const programs = useQuery(api.bootcamp.listPrograms)
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null)
  
  // Get deliverables for selected program
  const deliverables = useQuery(
    api.bootcamp.listDeliverablesByProgram,
    selectedProgramId 
      ? { programId: selectedProgramId as Id<'bootcampPrograms'>, status: statusFilter !== 'all' ? statusFilter : undefined }
      : 'skip'
  )

  // Get enrollments for stats
  const enrollments = useQuery(
    api.bootcamp.listEnrollmentsByProgram,
    selectedProgramId 
      ? { programId: selectedProgramId as Id<'bootcampPrograms'> }
      : 'skip'
  )

  const reviewDeliverable = useMutation(api.bootcamp.reviewDeliverable)

  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean
    deliverableId: Id<'bootcampDeliverables'> | null
    action: 'approved' | 'needs_revision' | null
  }>({ open: false, deliverableId: null, action: null })
  const [selectedLevel, setSelectedLevel] = useState<Level>('complete')
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auto-select first program
  if (programs && programs.length > 0 && !selectedProgramId) {
    setSelectedProgramId(programs[0]._id)
  }

  const handleReview = async () => {
    if (!reviewDialog.deliverableId || !reviewDialog.action || !convexUser) return

    setIsSubmitting(true)
    try {
      await reviewDeliverable({
        deliverableId: reviewDialog.deliverableId,
        status: reviewDialog.action,
        level: reviewDialog.action === 'approved' ? selectedLevel : undefined,
        feedback: feedback.trim() || undefined,
        reviewedByUserId: convexUser._id,
      })

      toast.success(
        reviewDialog.action === 'approved' 
          ? 'Entregable aprobado' 
          : 'Entregable marcado para revisión'
      )
      
      setReviewDialog({ open: false, deliverableId: null, action: null })
      setFeedback('')
      setSelectedLevel('complete')
    } catch (error: any) {
      toast.error(error.message || 'Error al revisar')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Stats
  const stats = {
    totalEnrollments: enrollments?.length ?? 0,
    activeEnrollments: enrollments?.filter(e => e.enrollment.status === 'active').length ?? 0,
    pendingDeliverables: deliverables?.filter(d => d.deliverable.status === 'submitted').length ?? 0,
    completedEnrollments: enrollments?.filter(e => e.enrollment.status === 'completed').length ?? 0,
  }

  const filteredDeliverables = statusFilter === 'all' 
    ? deliverables 
    : deliverables?.filter(d => d.deliverable.status === statusFilter)

  return (
    <AdminRoute>
      <PageWrapper>
        <div className="page">
          <div className="page-content gap-y-6">
            {/* Header */}
            <Section>
              <div className="header-section space-y-4">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-8 w-8 text-primary" />
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">
                      Admin Bootcamp
                    </h1>
                    <p className="text-muted-foreground">
                      Gestiona inscripciones y revisa entregables
                    </p>
                  </div>
                </div>
              </div>
            </Section>

            {/* Program Selector */}
            <Section>
              <div className="flex items-center gap-4">
                <Select
                  value={selectedProgramId ?? ''}
                  onValueChange={setSelectedProgramId}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Selecciona un programa" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs?.map((program) => (
                      <SelectItem key={program._id} value={program._id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Section>

            {/* Stats */}
            {selectedProgramId && (
              <Section>
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <Users className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="text-2xl font-bold">{stats.totalEnrollments}</p>
                          <p className="text-sm text-muted-foreground">Inscritos</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                        <div>
                          <p className="text-2xl font-bold">{stats.activeEnrollments}</p>
                          <p className="text-sm text-muted-foreground">Activos</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <Clock className="h-8 w-8 text-yellow-500" />
                        <div>
                          <p className="text-2xl font-bold">{stats.pendingDeliverables}</p>
                          <p className="text-sm text-muted-foreground">Por revisar</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <GraduationCap className="h-8 w-8 text-purple-500" />
                        <div>
                          <p className="text-2xl font-bold">{stats.completedEnrollments}</p>
                          <p className="text-sm text-muted-foreground">Graduados</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </Section>
            )}

            {/* Deliverables */}
            {selectedProgramId && (
              <Section>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileCheck className="h-5 w-5" />
                          Entregables
                        </CardTitle>
                        <CardDescription>
                          Revisa y califica los entregables de los estudiantes
                        </CardDescription>
                      </div>
                      <Select
                        value={statusFilter}
                        onValueChange={(v) => setStatusFilter(v as DeliverableStatus | 'all')}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="submitted">Pendientes</SelectItem>
                          <SelectItem value="approved">Aprobados</SelectItem>
                          <SelectItem value="needs_revision">Revisión</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {deliverables === undefined ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : filteredDeliverables?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          No hay entregables {statusFilter !== 'all' ? `con estado "${statusLabels[statusFilter as DeliverableStatus]}"` : ''}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredDeliverables?.map(({ deliverable, user, enrollment }) => (
                          <div
                            key={deliverable._id}
                            className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors space-y-3"
                          >
                            {/* Header: User + Status */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={user?.avatarUrl ?? undefined} />
                                  <AvatarFallback>
                                    {user?.username?.[0]?.toUpperCase() ?? '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {user?.username ?? user?.email ?? 'Usuario'}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Sesión {deliverable.sessionNumber} • {new Date(deliverable.submittedAt).toLocaleDateString('es-MX')}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={statusColors[deliverable.status as DeliverableStatus]}>
                                  {statusLabels[deliverable.status as DeliverableStatus]}
                                </Badge>
                                
                                {deliverable.level && (
                                  <Badge variant="outline" className={levelColors[deliverable.level as Level]}>
                                    {levelLabels[deliverable.level as Level]}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Links */}
                            <div className="flex flex-wrap gap-3 text-sm">
                              <a
                                href={deliverable.projectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                              >
                                <ExternalLink className="h-4 w-4" />
                                {deliverable.projectUrl.replace(/^https?:\/\//, '').slice(0, 40)}
                                {deliverable.projectUrl.length > 50 && '...'}
                              </a>
                              {deliverable.repositoryUrl && (
                                <a
                                  href={deliverable.repositoryUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                                >
                                  📦 Repo
                                </a>
                              )}
                            </div>

                            {/* Notes */}
                            {deliverable.notes && (
                              <div className="text-sm text-muted-foreground bg-muted/50 rounded p-2">
                                💬 {deliverable.notes}
                              </div>
                            )}

                            {/* Actions */}
                            {deliverable.status === 'submitted' && (
                              <div className="flex gap-2 pt-2 border-t">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => setReviewDialog({
                                    open: true,
                                    deliverableId: deliverable._id,
                                    action: 'approved',
                                  })}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Aprobar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => setReviewDialog({
                                    open: true,
                                    deliverableId: deliverable._id,
                                    action: 'needs_revision',
                                  })}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Revisión
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Section>
            )}
          </div>
        </div>

        {/* Review Dialog */}
        <Dialog open={reviewDialog.open} onOpenChange={(open) => {
          if (!open) {
            setReviewDialog({ open: false, deliverableId: null, action: null })
            setFeedback('')
            setSelectedLevel('complete')
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewDialog.action === 'approved' ? 'Aprobar Entregable' : 'Solicitar Revisión'}
              </DialogTitle>
              <DialogDescription>
                {reviewDialog.action === 'approved'
                  ? 'Selecciona el nivel alcanzado y agrega feedback opcional.'
                  : 'Indica qué necesita corregir el estudiante.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {reviewDialog.action === 'approved' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nivel alcanzado</label>
                  <Select value={selectedLevel} onValueChange={(v) => setSelectedLevel(v as Level)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="core">{levelLabels.core}</SelectItem>
                      <SelectItem value="complete">{levelLabels.complete}</SelectItem>
                      <SelectItem value="excellent">{levelLabels.excellent}</SelectItem>
                      <SelectItem value="bonus">{levelLabels.bonus}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Feedback {reviewDialog.action === 'needs_revision' ? '(requerido)' : '(opcional)'}
                </label>
                <Textarea
                  placeholder={
                    reviewDialog.action === 'approved'
                      ? 'Excelente trabajo! Tu implementación...'
                      : 'Falta implementar... Por favor revisa...'
                  }
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setReviewDialog({ open: false, deliverableId: null, action: null })}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleReview}
                disabled={isSubmitting || (reviewDialog.action === 'needs_revision' && !feedback.trim())}
                className={reviewDialog.action === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : reviewDialog.action === 'approved' ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                {reviewDialog.action === 'approved' ? 'Aprobar' : 'Solicitar Revisión'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageWrapper>
    </AdminRoute>
  )
}
