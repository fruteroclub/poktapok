'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ExternalLink, MapPin, Calendar, Clock } from 'lucide-react'
import Image from 'next/image'
import { useFetchLumaMetadata } from '@/hooks/use-events'
import { formatEventDateLong } from '@/lib/utils/date-format'
import { getEventTypeLabel } from '@/lib/utils/event-labels'
import type { LumaEventMetadata } from '@/services/events'

interface LumaEventInputProps {
  onMetadataLoaded: (metadata: LumaEventMetadata) => void
  disabled?: boolean
}

export function LumaEventInput({
  onMetadataLoaded,
  disabled,
}: LumaEventInputProps) {
  const [url, setUrl] = useState('')
  const [preview, setPreview] = useState<LumaEventMetadata | null>(null)

  const fetchMetadata = useFetchLumaMetadata()

  const handleFetch = () => {
    if (!url.trim()) return

    fetchMetadata.mutate(url, {
      onSuccess: (data) => {
        setPreview(data)
        onMetadataLoaded(data)
      },
    })
  }

  const error = fetchMetadata.error?.message

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="luma-url">URL de lu.ma</Label>
        <div className="flex gap-2">
          <Input
            id="luma-url"
            type="url"
            placeholder="https://lu.ma/xyz o https://luma.com/xyz"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={disabled || fetchMetadata.isPending}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleFetch}
            disabled={disabled || fetchMetadata.isPending || !url.trim()}
          >
            {fetchMetadata.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando...
              </>
            ) : (
              'Cargar'
            )}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {preview && (
        <Card className="overflow-hidden">
          {preview.coverImage && (
            <div className="relative h-48 w-full">
              <Image
                src={preview.coverImage}
                alt={preview.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          <CardContent className="space-y-3 pt-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-bold text-foreground">
                {preview.title}
              </h3>
              <Badge
                variant={preview.eventType === 'virtual' ? 'secondary' : 'default'}
              >
                {getEventTypeLabel(preview.eventType)}
              </Badge>
            </div>

            {preview.description && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {preview.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatEventDateLong(preview.startDate)}
              </div>

              {preview.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">{preview.location}</span>
                </div>
              )}

              {preview.timezone && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {preview.timezone}
                </div>
              )}
            </div>

            {preview.hosts && preview.hosts.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Organizado por:
                </span>
                <div className="flex gap-1">
                  {preview.hosts.map((host, idx) => (
                    <Badge key={idx} variant="outline">
                      {host.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <a
              href={preview.lumaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Ver en lu.ma <ExternalLink className="h-3 w-3" />
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
