'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LumaEventInput } from './luma-event-input'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateEvent } from '@/hooks/use-events'
import type { LumaEventMetadata } from '@/services/events'

interface EventFormDialogProps {
  programs?: { id: string; name: string }[]
  onEventCreated?: () => void
}

export function EventFormDialog({
  programs = [],
  onEventCreated,
}: EventFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<{
    title: string
    description: string
    coverImage: string
    lumaUrl: string
    lumaEventId: string
    lumaSlug: string
    eventType: 'in-person' | 'virtual' | 'hybrid'
    startDate: string
    endDate: string
    timezone: string
    location: string
    locationDetails: string
    hosts: { name: string; avatarUrl?: string; handle?: string }[]
    calendar: string
    programId: string
    isPublished: boolean
    isFeatured: boolean
  }>({
    title: '',
    description: '',
    coverImage: '',
    lumaUrl: '',
    lumaEventId: '',
    lumaSlug: '',
    eventType: 'in-person',
    startDate: '',
    endDate: '',
    timezone: 'America/Mexico_City',
    location: '',
    locationDetails: '',
    hosts: [],
    calendar: '',
    programId: '',
    isPublished: true,
    isFeatured: false,
  })

  const createEventMutation = useCreateEvent()

  const handleMetadataLoaded = (metadata: LumaEventMetadata) => {
    setFormData({
      ...formData,
      title: metadata.title,
      description: metadata.description || '',
      coverImage: metadata.coverImage || '',
      lumaUrl: metadata.lumaUrl,
      lumaEventId: metadata.lumaEventId || '',
      lumaSlug: metadata.lumaSlug,
      eventType: metadata.eventType,
      startDate: metadata.startDate
        ? new Date(metadata.startDate).toISOString().slice(0, 16)
        : '',
      endDate: metadata.endDate
        ? new Date(metadata.endDate).toISOString().slice(0, 16)
        : '',
      timezone: metadata.timezone,
      location: metadata.location || '',
      locationDetails: metadata.locationDetails || '',
      hosts: metadata.hosts || [],
      calendar: metadata.calendar || '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.lumaUrl || !formData.startDate) {
      toast.error('Por favor completa los campos requeridos')
      return
    }

    createEventMutation.mutate(
      {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : null,
        programId: formData.programId || null,
      },
      {
        onSuccess: () => {
          toast.success('Evento creado exitosamente')
          setOpen(false)
          resetForm()
          onEventCreated?.()
        },
        onError: (error) => {
          toast.error(error.message || 'Error al crear el evento')
        },
      }
    )
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      coverImage: '',
      lumaUrl: '',
      lumaEventId: '',
      lumaSlug: '',
      eventType: 'in-person',
      startDate: '',
      endDate: '',
      timezone: 'America/Mexico_City',
      location: '',
      locationDetails: '',
      hosts: [],
      calendar: '',
      programId: '',
      isPublished: false,
      isFeatured: false,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Crear Evento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Evento</DialogTitle>
          <DialogDescription>
            Ingresa la URL de lu.ma para cargar automáticamente los datos del
            evento
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lu.ma URL Input */}
          <LumaEventInput
            onMetadataLoaded={handleMetadataLoaded}
            disabled={createEventMutation.isPending}
          />

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Nombre del evento"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Descripción del evento"
              rows={3}
            />
          </div>

          {/* Date/Time Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de inicio *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de fin</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </div>
          </div>

          {/* Event Type & Program Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="eventType">Tipo de evento</Label>
              <Select
                value={formData.eventType}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    eventType: value as 'in-person' | 'virtual' | 'hybrid',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-person">Presencial</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                  <SelectItem value="hybrid">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {programs.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="programId">Programa (opcional)</Label>
                <Select
                  value={formData.programId || 'none'}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      programId: value === 'none' ? '' : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un programa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin programa</SelectItem>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="Dirección o link de la reunión"
            />
          </div>

          {/* Switches */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPublished: checked })
                }
              />
              <Label htmlFor="isPublished">Publicado</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isFeatured: checked })
                }
              />
              <Label htmlFor="isFeatured">Destacado</Label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createEventMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createEventMutation.isPending}>
              {createEventMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Evento'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
