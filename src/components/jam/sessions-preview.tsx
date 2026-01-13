/**
 * SessionsPreview component - Preview of upcoming sessions for landing page
 * Shows limited number of sessions with "Ver todas" CTA
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SessionCard } from './session-card'
import { ArrowRight } from 'lucide-react'

interface Session {
  id: string
  title: string
  description: string | null
  scheduledAt: string
  programId: string | null
  programName: string | null
  activityCount: number
}

interface SessionsPreviewProps {
  sessions: Session[]
  limit?: number
}

export function SessionsPreview({ sessions, limit = 6 }: SessionsPreviewProps) {
  const displayedSessions = sessions.slice(0, limit)

  if (displayedSessions.length === 0) {
    return null
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Próximas sesiones</h2>
          <Button variant="ghost" asChild>
            <Link href="/jam/sessions" className="flex items-center gap-2">
              Ver todas
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      </div>
    </section>
  )
}
