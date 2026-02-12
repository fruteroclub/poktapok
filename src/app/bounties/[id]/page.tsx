'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useBounty,
  useHasUserClaimed,
  useBountyMutations,
  getDifficultyDisplayName,
  getDifficultyColor,
  getStatusDisplayName,
  getStatusColor,
  formatReward,
} from '@/hooks/use-bounties';
import { useAuthWithConvex } from '@/hooks/use-auth-with-convex';
import PageWrapper from '@/components/layout/page-wrapper';
import { Section } from '@/components/layout/section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Loader2, ArrowLeft, Clock, DollarSign, ExternalLink, 
  CheckCircle, AlertCircle, Send 
} from 'lucide-react';
import { toast } from 'sonner';
import { Id } from '../../../../convex/_generated/dataModel';

export default function BountyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bountyId = params.id as Id<'bounties'>;
  
  const { convexUser, isAuthenticated } = useAuthWithConvex();
  const { bounty, isLoading } = useBounty(bountyId);
  const { claim: existingClaim, isLoading: loadingClaim } = useHasUserClaimed(
    bountyId,
    convexUser?._id
  );
  const { claim, submit, abandonClaim } = useBountyMutations();

  const [isClaiming, setIsClaiming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');

  if (isLoading || loadingClaim) {
    return (
      <PageWrapper>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageWrapper>
    );
  }

  if (!bounty) {
    return (
      <PageWrapper>
        <div className="page">
          <div className="page-content">
            <Section>
              <div className="flex w-full flex-col items-center justify-center py-20 text-center">
                <h1 className="text-2xl font-bold">Bounty no encontrado</h1>
                <p className="mt-2 text-muted-foreground">
                  Este bounty no existe o fue eliminado.
                </p>
                <Button asChild className="mt-6">
                  <Link href="/bounties">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Bounties
                  </Link>
                </Button>
              </div>
            </Section>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const handleClaim = async () => {
    if (!convexUser) {
      toast.error('Debes iniciar sesión para reclamar bounties');
      return;
    }

    setIsClaiming(true);
    try {
      await claim({ bountyId, userId: convexUser._id });
      toast.success('¡Bounty reclamado! Tienes ' + (bounty.deadlineDays || 7) + ' días para completarlo.');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Error al reclamar bounty');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleSubmit = async () => {
    if (!existingClaim || !submissionUrl.trim()) {
      toast.error('URL de entrega requerida');
      return;
    }

    setIsSubmitting(true);
    try {
      await submit({
        claimId: existingClaim._id,
        submissionUrl: submissionUrl.trim(),
        notes: submissionNotes.trim() || undefined,
      });
      toast.success('¡Entrega enviada! Te notificaremos cuando sea revisada.');
      setShowSubmitDialog(false);
      setSubmissionUrl('');
      setSubmissionNotes('');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Error al enviar entrega');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAbandon = async () => {
    if (!existingClaim) return;
    if (!confirm('¿Estás seguro de abandonar este bounty?')) return;

    try {
      await abandonClaim({ claimId: existingClaim._id });
      toast.success('Bounty abandonado');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Error al abandonar bounty');
    }
  };

  const canClaim = bounty.status === 'open' && !existingClaim && isAuthenticated;
  const hasClaimed = existingClaim?.status === 'active';
  const hasSubmitted = existingClaim?.status === 'submitted';
  const isApproved = existingClaim?.status === 'approved';

  return (
    <PageWrapper>
      <div className="page">
        <div className="page-content space-y-6">
          {/* Back button */}
          <Section>
            <Button variant="ghost" asChild>
              <Link href="/bounties">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Bounties
              </Link>
            </Button>
          </Section>

          {/* Header */}
          <Section>
            <Card className="w-full">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{bounty.title}</CardTitle>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge className={getDifficultyColor(bounty.difficulty)}>
                        {getDifficultyDisplayName(bounty.difficulty)}
                      </Badge>
                      <Badge className={getStatusColor(bounty.status)}>
                        {getStatusDisplayName(bounty.status)}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {formatReward(bounty.rewardAmount, bounty.rewardCurrency)}
                    </div>
                    {bounty.deadlineDays && (
                      <div className="mt-1 flex items-center justify-end gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {bounty.deadlineDays} días para completar
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="font-semibold">Descripción</h3>
                  <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                    {bounty.description}
                  </p>
                </div>

                {/* Requirements */}
                {bounty.requirements && (
                  <div>
                    <h3 className="font-semibold">Requisitos</h3>
                    <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                      {bounty.requirements}
                    </p>
                  </div>
                )}

                {/* Tech Stack */}
                {bounty.techStack.length > 0 && (
                  <div>
                    <h3 className="font-semibold">Tech Stack</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {bounty.techStack.map((tech, i) => (
                        <Badge key={i} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resource Link */}
                {bounty.resourceUrl && (
                  <div>
                    <h3 className="font-semibold">Recursos</h3>
                    <Button variant="outline" className="mt-2" asChild>
                      <a href={bounty.resourceUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver Recursos
                      </a>
                    </Button>
                  </div>
                )}

                {/* Claim Status */}
                {existingClaim && (
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <div className="flex items-center gap-2">
                      {isApproved ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : hasSubmitted ? (
                        <Clock className="h-5 w-5 text-purple-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                      <span className="font-medium">
                        {isApproved
                          ? '¡Completado! Recompensa aprobada.'
                          : hasSubmitted
                            ? 'Entrega en revisión'
                            : 'Bounty reclamado'}
                      </span>
                    </div>
                    {hasClaimed && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Tienes hasta{' '}
                        {new Date(existingClaim.expiresAt).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}{' '}
                        para completarlo.
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {canClaim && (
                    <Button onClick={handleClaim} disabled={isClaiming} size="lg">
                      {isClaiming ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Reclamando...
                        </>
                      ) : (
                        'Reclamar Bounty'
                      )}
                    </Button>
                  )}

                  {hasClaimed && (
                    <>
                      <Button onClick={() => setShowSubmitDialog(true)} size="lg">
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Entrega
                      </Button>
                      <Button variant="outline" onClick={handleAbandon}>
                        Abandonar
                      </Button>
                    </>
                  )}

                  {!isAuthenticated && bounty.status === 'open' && (
                    <Button asChild size="lg">
                      <Link href="/onboarding">Únete para reclamar</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </Section>
        </div>
      </div>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Entrega</DialogTitle>
            <DialogDescription>
              Comparte el link a tu trabajo completado (GitHub PR, deploy, etc.)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="submissionUrl">URL de entrega *</Label>
              <Input
                id="submissionUrl"
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea
                id="notes"
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder="Describe brevemente lo que hiciste..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !submissionUrl.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
