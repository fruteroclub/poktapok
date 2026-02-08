'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useBounties,
  useBountyMutations,
  useBountyStats,
  getDifficultyDisplayName,
  getDifficultyColor,
  getStatusDisplayName,
  getStatusColor,
  formatReward,
  type BountyStatus,
  type BountyDifficulty,
} from '@/hooks/use-bounties';
import { useAuthWithConvex } from '@/hooks/use-auth-with-convex';
import PageWrapper from '@/components/layout/page-wrapper';
import { AdminRoute } from '@/components/layout/admin-route-wrapper';
import { Section } from '@/components/layout/section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Loader2, Plus, Pencil, Eye, ArrowLeft, 
  FileCheck, DollarSign, Users, Clock,
} from 'lucide-react';
import { toast } from 'sonner';

interface BountyForm {
  title: string;
  description: string;
  requirements: string;
  difficulty: BountyDifficulty;
  techStack: string;
  category: string;
  rewardAmount: number;
  rewardCurrency: string;
  deadlineDays: number;
  resourceUrl: string;
  status: 'draft' | 'open';
}

const emptyForm: BountyForm = {
  title: '',
  description: '',
  requirements: '',
  difficulty: 'beginner',
  techStack: '',
  category: '',
  rewardAmount: 50,
  rewardCurrency: 'USD',
  deadlineDays: 7,
  resourceUrl: '',
  status: 'draft',
};

export default function AdminBountiesPage() {
  const { convexUser } = useAuthWithConvex();
  const { bounties, isLoading } = useBounties({});
  const { stats } = useBountyStats();
  const { create, update } = useBountyMutations();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BountyForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<BountyStatus | 'all'>('all');

  const filteredBounties = statusFilter === 'all'
    ? bounties
    : bounties.filter((b) => b.status === statusFilter);

  const handleOpenCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (bounty: any) => {
    setForm({
      title: bounty.title,
      description: bounty.description,
      requirements: bounty.requirements || '',
      difficulty: bounty.difficulty,
      techStack: (bounty.techStack || []).join(', '),
      category: bounty.category || '',
      rewardAmount: bounty.rewardAmount,
      rewardCurrency: bounty.rewardCurrency,
      deadlineDays: bounty.deadlineDays || 7,
      resourceUrl: bounty.resourceUrl || '',
      status: bounty.status === 'open' ? 'open' : 'draft',
    });
    setEditingId(bounty._id);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!convexUser || !form.title.trim() || !form.description.trim()) {
      toast.error('Título y descripción son requeridos');
      return;
    }

    setIsSubmitting(true);
    try {
      const techStackArray = form.techStack
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      if (editingId) {
        await update({
          bountyId: editingId as any,
          title: form.title,
          description: form.description,
          requirements: form.requirements || undefined,
          difficulty: form.difficulty,
          techStack: techStackArray,
          category: form.category || undefined,
          rewardAmount: form.rewardAmount,
          rewardCurrency: form.rewardCurrency,
          deadlineDays: form.deadlineDays,
          resourceUrl: form.resourceUrl || undefined,
          status: form.status,
        });
        toast.success('Bounty actualizado');
      } else {
        await create({
          title: form.title,
          description: form.description,
          requirements: form.requirements || undefined,
          difficulty: form.difficulty,
          techStack: techStackArray,
          category: form.category || undefined,
          rewardAmount: form.rewardAmount,
          rewardCurrency: form.rewardCurrency,
          deadlineDays: form.deadlineDays,
          resourceUrl: form.resourceUrl || undefined,
          status: form.status,
          createdByUserId: convexUser._id,
        });
        toast.success('Bounty creado');
      }
      setIsDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminRoute>
      <PageWrapper>
        <div className="page">
          <div className="page-content space-y-6">
            {/* Back + Header */}
            <Section>
              <div className="flex w-full items-center justify-between">
                <div>
                  <Button variant="ghost" asChild className="mb-2">
                    <Link href="/admin">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Admin
                    </Link>
                  </Button>
                  <h1 className="text-3xl font-bold tracking-tight">Gestión de Bounties</h1>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/admin/bounties/submissions">
                      <FileCheck className="mr-2 h-4 w-4" />
                      Revisiones ({stats?.pendingReviews || 0})
                    </Link>
                  </Button>
                  <Button onClick={handleOpenCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Bounty
                  </Button>
                </div>
              </div>
            </Section>

            {/* Stats */}
            {stats && (
              <Section>
                <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardContent className="flex items-center gap-3 pt-6">
                      <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                        <Eye className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.openBounties}</p>
                        <p className="text-sm text-muted-foreground">Abiertos</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="flex items-center gap-3 pt-6">
                      <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900">
                        <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.pendingReviews}</p>
                        <p className="text-sm text-muted-foreground">Por revisar</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="flex items-center gap-3 pt-6">
                      <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
                        <Users className="h-5 w-5 text-green-600 dark:text-green-300" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.completedBounties}</p>
                        <p className="text-sm text-muted-foreground">Completados</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="flex items-center gap-3 pt-6">
                      <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900">
                        <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">${stats.totalPaidOut.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Pagado total</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </Section>
            )}

            {/* Filter */}
            <Section>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as BountyStatus | 'all')}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="open">Abierto</SelectItem>
                  <SelectItem value="claimed">Reclamado</SelectItem>
                  <SelectItem value="in_review">En Revisión</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </Section>

            {/* Table */}
            <Section>
              <Card className="w-full">
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Título</TableHead>
                          <TableHead>Dificultad</TableHead>
                          <TableHead>Recompensa</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Claims</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBounties.map((bounty) => (
                          <TableRow key={bounty._id}>
                            <TableCell className="font-medium">
                              {bounty.title}
                            </TableCell>
                            <TableCell>
                              <Badge className={getDifficultyColor(bounty.difficulty)}>
                                {getDifficultyDisplayName(bounty.difficulty)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatReward(bounty.rewardAmount, bounty.rewardCurrency)}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(bounty.status)}>
                                {getStatusDisplayName(bounty.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {bounty.currentClaimsCount}/{bounty.maxClaims || 1}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(bounty)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/bounties/${bounty._id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredBounties.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                              No hay bounties
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </Section>
          </div>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Editar Bounty' : 'Nuevo Bounty'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Crear landing page..."
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe el bounty..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="requirements">Requisitos de entrega</Label>
                <Textarea
                  id="requirements"
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  placeholder="Criterios de aceptación..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Dificultad</Label>
                  <Select
                    value={form.difficulty}
                    onValueChange={(v) => setForm({ ...form, difficulty: v as BountyDifficulty })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Principiante</SelectItem>
                      <SelectItem value="intermediate">Intermedio</SelectItem>
                      <SelectItem value="advanced">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="deadlineDays">Días para completar</Label>
                  <Input
                    id="deadlineDays"
                    type="number"
                    value={form.deadlineDays}
                    onChange={(e) => setForm({ ...form, deadlineDays: parseInt(e.target.value) || 7 })}
                    min={1}
                    max={90}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="techStack">Tech Stack</Label>
                <Input
                  id="techStack"
                  value={form.techStack}
                  onChange={(e) => setForm({ ...form, techStack: e.target.value })}
                  placeholder="React, TypeScript, Tailwind (separado por comas)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rewardAmount">Recompensa</Label>
                  <Input
                    id="rewardAmount"
                    type="number"
                    value={form.rewardAmount}
                    onChange={(e) => setForm({ ...form, rewardAmount: parseFloat(e.target.value) || 0 })}
                    min={0}
                  />
                </div>

                <div>
                  <Label htmlFor="rewardCurrency">Moneda</Label>
                  <Select
                    value={form.rewardCurrency}
                    onValueChange={(v) => setForm({ ...form, rewardCurrency: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="resourceUrl">URL de recursos (opcional)</Label>
                <Input
                  id="resourceUrl"
                  value={form.resourceUrl}
                  onChange={(e) => setForm({ ...form, resourceUrl: e.target.value })}
                  placeholder="https://figma.com/..."
                />
              </div>

              <div>
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as 'draft' | 'open' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador (no visible)</SelectItem>
                    <SelectItem value="open">Abierto (visible)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? 'Guardar' : 'Crear'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageWrapper>
    </AdminRoute>
  );
}
