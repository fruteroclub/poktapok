'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useBountySubmissions,
  useBountyMutations,
  formatReward,
  type SubmissionStatus,
} from '@/hooks/use-bounties';
import { useAuthWithConvex } from '@/hooks/use-auth-with-convex';
import PageWrapper from '@/components/layout/page-wrapper';
import { AdminRoute } from '@/components/layout/admin-route-wrapper';
import { Section } from '@/components/layout/section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Loader2, ArrowLeft, ExternalLink, CheckCircle, XCircle, 
  RotateCcw, Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { Id } from '../../../../../convex/_generated/dataModel';

const statusLabels: Record<SubmissionStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  revision_requested: 'Revisión Solicitada',
};

const statusColors: Record<SubmissionStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  revision_requested: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

export default function SubmissionsPage() {
  const { convexUser } = useAuthWithConvex();
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'all'>('pending');
  const { submissions, isLoading } = useBountySubmissions(
    statusFilter !== 'all' ? statusFilter : undefined
  );
  const { reviewSubmission } = useBountyMutations();

  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    submissionId: Id<'bountySubmissions'> | null;
    action: 'approved' | 'rejected' | 'revision_requested' | null;
  }>({ open: false, submissionId: null, action: null });
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReview = async () => {
    if (!reviewDialog.submissionId || !reviewDialog.action || !convexUser) return;

    setIsSubmitting(true);
    try {
      await reviewSubmission({
        submissionId: reviewDialog.submissionId,
        reviewerUserId: convexUser._id,
        status: reviewDialog.action,
        reviewNotes: reviewNotes.trim() || undefined,
      });

      const actionLabels = {
        approved: 'aprobada',
        rejected: 'rechazada',
        revision_requested: 'marcada para revisión',
      };
      toast.success(`Entrega ${actionLabels[reviewDialog.action]}`);
      
      setReviewDialog({ open: false, submissionId: null, action: null });
      setReviewNotes('');
    } catch (error: any) {
      toast.error(error.message || 'Error al revisar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReviewDialog = (
    submissionId: Id<'bountySubmissions'>,
    action: 'approved' | 'rejected' | 'revision_requested'
  ) => {
    setReviewDialog({ open: true, submissionId, action });
    setReviewNotes('');
  };

  return (
    <AdminRoute>
      <PageWrapper>
        <div className="page">
          <div className="page-content space-y-6">
            {/* Back + Header */}
            <Section>
              <div className="w-full">
                <Button variant="ghost" asChild className="mb-2">
                  <Link href="/admin/bounties">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Bounties
                  </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Revisión de Entregas</h1>
                <p className="mt-2 text-muted-foreground">
                  Revisa y aprueba las entregas de bounties
                </p>
              </div>
            </Section>

            {/* Filter */}
            <Section>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as SubmissionStatus | 'all')}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="approved">Aprobadas</SelectItem>
                  <SelectItem value="rejected">Rechazadas</SelectItem>
                  <SelectItem value="revision_requested">Revisión Solicitada</SelectItem>
                </SelectContent>
              </Select>
            </Section>

            {/* Submissions */}
            <Section>
              {isLoading ? (
                <div className="flex w-full items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : submissions.length === 0 ? (
                <Card className="w-full">
                  <CardContent className="py-12 text-center">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      No hay entregas para revisar
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="w-full space-y-4">
                  {submissions.map((sub) => (
                    <Card key={sub._id} className="w-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={sub.user?.avatarUrl || undefined} />
                              <AvatarFallback>
                                {(sub.user?.username || 'U')[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                @{sub.user?.username || 'unknown'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {sub.user?.displayName}
                              </p>
                            </div>
                          </div>
                          <Badge className={statusColors[sub.status]}>
                            {statusLabels[sub.status]}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Bounty Info */}
                        {sub.bounty && (
                          <div className="rounded-lg bg-muted/50 p-3">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{sub.bounty.title}</p>
                              <span className="text-green-600 dark:text-green-400">
                                {formatReward(sub.bounty.rewardAmount, sub.bounty.rewardCurrency)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Submission URL */}
                        <div>
                          <Label className="text-muted-foreground">Entrega:</Label>
                          <Button variant="outline" className="mt-1 w-full justify-start" asChild>
                            <a href={sub.submissionUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              {sub.submissionUrl}
                            </a>
                          </Button>
                        </div>

                        {/* Notes */}
                        {sub.notes && (
                          <div>
                            <Label className="text-muted-foreground">Notas del usuario:</Label>
                            <p className="mt-1 text-sm">{sub.notes}</p>
                          </div>
                        )}

                        {/* Attempt */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Intento #{sub.attemptNumber}</span>
                          <span>
                            Enviado: {new Date(sub._creationTime).toLocaleDateString('es-MX')}
                          </span>
                        </div>

                        {/* Review Notes (if already reviewed) */}
                        {sub.reviewNotes && (
                          <div className="rounded-lg border border-dashed p-3">
                            <Label className="text-muted-foreground">Notas de revisión:</Label>
                            <p className="mt-1 text-sm">{sub.reviewNotes}</p>
                          </div>
                        )}

                        {/* Actions */}
                        {sub.status === 'pending' && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            <Button
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => openReviewDialog(sub._id, 'approved')}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Aprobar
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => openReviewDialog(sub._id, 'revision_requested')}
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Solicitar Cambios
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => openReviewDialog(sub._id, 'rejected')}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Rechazar
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </Section>
          </div>
        </div>

        {/* Review Dialog */}
        <Dialog
          open={reviewDialog.open}
          onOpenChange={(open) =>
            setReviewDialog({ open, submissionId: null, action: null })
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewDialog.action === 'approved' && 'Aprobar Entrega'}
                {reviewDialog.action === 'rejected' && 'Rechazar Entrega'}
                {reviewDialog.action === 'revision_requested' && 'Solicitar Cambios'}
              </DialogTitle>
              <DialogDescription>
                {reviewDialog.action === 'approved' &&
                  'La recompensa se marcará como aprobada para pago.'}
                {reviewDialog.action === 'rejected' &&
                  'El usuario no podrá volver a reclamar este bounty.'}
                {reviewDialog.action === 'revision_requested' &&
                  'El usuario podrá enviar una nueva entrega.'}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Label htmlFor="reviewNotes">Notas (opcional)</Label>
              <Textarea
                id="reviewNotes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Feedback para el usuario..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setReviewDialog({ open: false, submissionId: null, action: null })}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleReview}
                disabled={isSubmitting}
                variant={reviewDialog.action === 'rejected' ? 'destructive' : 'default'}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageWrapper>
    </AdminRoute>
  );
}
