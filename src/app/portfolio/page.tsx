'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { 
  Loader2, Plus, Pencil, Trash2, ExternalLink, Github, 
  Play, Eye, EyeOff, Check, X 
} from 'lucide-react'
import PageWrapper from '@/components/layout/page-wrapper'
import { ProtectedRoute } from '@/components/layout/protected-route-wrapper'
import { Section } from '@/components/layout/section'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { SkillsEditor } from '@/components/skills/skills-editor'
import { useAuth } from '@/hooks'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

interface ProjectForm {
  name: string
  description: string
  githubUrl: string
  demoUrl: string
  videoUrl: string
  techStack: string
  status: 'draft' | 'active' | 'completed' | 'archived'
  isPublic: boolean
}

const emptyForm: ProjectForm = {
  name: '',
  description: '',
  githubUrl: '',
  demoUrl: '',
  videoUrl: '',
  techStack: '',
  status: 'active',
  isPublic: true,
}

export default function ProjectsPage() {
  const router = useRouter()
  const { user: privyUser } = usePrivy()
  const { user } = useAuth()
  const privyDid = privyUser?.id

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProjectForm>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const projectsData = useQuery(
    api.projects.getMyProjects,
    privyDid ? { privyDid } : 'skip'
  )
  const createProject = useMutation(api.projects.create)
  const updateProject = useMutation(api.projects.update)
  const deleteProject = useMutation(api.projects.remove)

  const projects = projectsData?.projects || []

  const handleOpenCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (project: { _id: string; name: string; description?: string; githubUrl?: string; demoUrl?: string; videoUrl?: string; techStack?: string[]; status: 'draft' | 'active' | 'completed' | 'archived'; isPublic: boolean }) => {
    setForm({
      name: project.name,
      description: project.description || '',
      githubUrl: project.githubUrl || '',
      demoUrl: project.demoUrl || '',
      videoUrl: project.videoUrl || '',
      techStack: (project.techStack || []).join(', '),
      status: project.status,
      isPublic: project.isPublic,
    })
    setEditingId(project._id)
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!privyDid || !form.name.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    setIsSubmitting(true)
    try {
      const techStackArray = form.techStack
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)

      if (editingId) {
        await updateProject({
          projectId: editingId as Id<"projects">,
          privyDid,
          name: form.name,
          description: form.description || undefined,
          githubUrl: form.githubUrl || undefined,
          demoUrl: form.demoUrl || undefined,
          videoUrl: form.videoUrl || undefined,
          techStack: techStackArray,
          status: form.status,
          isPublic: form.isPublic,
        })
        toast.success('Proyecto actualizado')
      } else {
        await createProject({
          privyDid,
          name: form.name,
          description: form.description || undefined,
          githubUrl: form.githubUrl || undefined,
          demoUrl: form.demoUrl || undefined,
          videoUrl: form.videoUrl || undefined,
          techStack: techStackArray,
          status: form.status,
          isPublic: form.isPublic,
        })
        toast.success('Proyecto creado')
      }
      setIsDialogOpen(false)
      setForm(emptyForm)
      setEditingId(null)
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (projectId: string) => {
    if (!privyDid) return
    if (!confirm('¿Eliminar este proyecto?')) return

    try {
      await deleteProject({ projectId: projectId as Id<"projects">, privyDid })
      toast.success('Proyecto eliminado')
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar')
    }
  }

  if (projectsData === undefined) {
    return (
      <ProtectedRoute>
        <PageWrapper>
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </PageWrapper>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <PageWrapper>
        <div className="page">
          <div className="page-content space-y-6">
            {/* Header */}
            <Section>
              <div className="flex w-full items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Mi Portfolio</h1>
                  <p className="text-muted-foreground">
                    Gestiona tu portfolio
                  </p>
                </div>
                <Button onClick={handleOpenCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Proyecto
                </Button>
              </div>
            </Section>

            {/* Skills Editor */}
            {user && (
              <Section>
                <Card className="w-full">
                  <CardContent className="pt-6">
                    <SkillsEditor userId={user.id as Id<'users'>} />
                  </CardContent>
                </Card>
              </Section>
            )}

            {/* Projects Grid */}
            <Section>
              {projects.length > 0 ? (
                <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                    <Card key={project._id} className="flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                                {project.status === 'completed' ? 'Completado' : 
                                 project.status === 'active' ? 'Activo' : 'Borrador'}
                              </Badge>
                              {project.isPublic ? (
                                <Eye className="h-3 w-3 text-muted-foreground" />
                              ) : (
                                <EyeOff className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col">
                        {project.description && (
                          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                            {project.description}
                          </p>
                        )}

                        {/* Tech Stack */}
                        {project.techStack && project.techStack.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-1">
                            {project.techStack.slice(0, 4).map((tech, i) => (
                              <Badge key={i} variant="outline" className="text-xs border-primary/20 bg-primary/5 text-foreground">
                                {tech}
                              </Badge>
                            ))}
                            {project.techStack.length > 4 && (
                              <Badge variant="outline" className="text-xs border-primary/20 bg-primary/5 text-foreground">
                                +{project.techStack.length - 4}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Links */}
                        <div className="mt-auto flex flex-wrap gap-2">
                          {project.githubUrl && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                <Github className="mr-1 h-3 w-3" />
                                Code
                              </a>
                            </Button>
                          )}
                          {project.demoUrl && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-1 h-3 w-3" />
                                Demo
                              </a>
                            </Button>
                          )}
                          {project.videoUrl && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={project.videoUrl} target="_blank" rel="noopener noreferrer">
                                <Play className="mr-1 h-3 w-3" />
                                Video
                              </a>
                            </Button>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-3 flex justify-end gap-2 border-t pt-3">
                          <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(project)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(project._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="w-full">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No tienes proyectos aún. ¡Crea tu primer proyecto!
                    </p>
                    <Button className="mt-4" onClick={handleOpenCreate}>
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Proyecto
                    </Button>
                  </CardContent>
                </Card>
              )}
            </Section>
          </div>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Editar Proyecto' : 'Nuevo Proyecto'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Mi proyecto increíble"
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe tu proyecto..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="techStack">Tech Stack</Label>
                <Input
                  id="techStack"
                  value={form.techStack}
                  onChange={(e) => setForm({ ...form, techStack: e.target.value })}
                  placeholder="React, TypeScript, Convex (separado por comas)"
                />
              </div>

              <div>
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <Input
                  id="githubUrl"
                  value={form.githubUrl}
                  onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>

              <div>
                <Label htmlFor="demoUrl">Demo URL</Label>
                <Input
                  id="demoUrl"
                  value={form.demoUrl}
                  onChange={(e) => setForm({ ...form, demoUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="videoUrl">Video URL (YouTube)</Label>
                <Input
                  id="videoUrl"
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div>
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as 'draft' | 'active' | 'completed' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isPublic">Visible en perfil público</Label>
                  <p className="text-xs text-muted-foreground">
                    Los proyectos públicos aparecen en tu perfil
                  </p>
                </div>
                <Switch
                  id="isPublic"
                  checked={form.isPublic}
                  onCheckedChange={(checked) => setForm({ ...form, isPublic: checked })}
                />
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
    </ProtectedRoute>
  )
}
