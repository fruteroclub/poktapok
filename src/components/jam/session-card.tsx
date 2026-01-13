/**
 * SessionCard component - Card for displaying session information
 * Used in session listings and previews
 */

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Zap } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface SessionCardProps {
  session: {
    id: string
    title: string
    description: string | null
    scheduledAt: string
    programId: string | null
    programName: string | null
    activityCount: number
  }
}

export function SessionCard({ session }: SessionCardProps) {
  const sessionDate = new Date(session.scheduledAt)
  const formattedDate = format(sessionDate, "d 'de' MMMM, yyyy", { locale: es })
  const formattedTime = format(sessionDate, 'HH:mm', { locale: es })

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{session.title}</h3>
            {session.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {session.description}
              </p>
            )}
          </div>
          {session.programName && (
            <Badge variant="secondary">{session.programName}</Badge>
          )}
        </div>

        {/* Session info */}
        <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="size-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4" />
            <span>{formattedTime}</span>
          </div>
          {session.activityCount > 0 && (
            <div className="flex items-center gap-2">
              <Zap className="size-4" />
              <span>{session.activityCount} actividades</span>
            </div>
          )}
        </div>
      </div>

      <div className="border-t p-4">
        <Button className="w-full" variant="outline" asChild>
          <Link href={`/jam/sessions/${session.id}`}>Ver detalles</Link>
        </Button>
      </div>
    </Card>
  )
}
