/**
 * ActivitiesPreview component - Preview of featured activities for landing page
 * Shows limited number of activities with "Ver todas" CTA
 * Reuses existing activity card styles
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Coins, Section } from 'lucide-react'
import type { Activity } from '@/services/activities'

interface ActivitiesPreviewProps {
  activities: Activity[]
  limit?: number
}

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

const difficultyLabels: Record<DifficultyLevel, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

const difficultyColors: Record<DifficultyLevel, string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
}

export function ActivitiesPreview({
  activities,
  limit = 6,
}: ActivitiesPreviewProps) {
  const displayedActivities = activities.slice(0, limit)

  if (displayedActivities.length === 0) {
    return null
  }

  return (
    <Section className="gap-y-4">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-3xl font-bold">Actividades destacadas</h2>
        <Button variant="ghost" asChild>
          <Link href="/activities" className="flex items-center gap-2">
            Ver todas
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayedActivities.map((activity) => (
          <Card
            key={activity.id}
            className="flex flex-col overflow-hidden transition-all hover:shadow-lg"
          >
            <div className="px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{activity.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                </div>
                <Badge
                  className={
                    difficultyColors[activity.difficulty as DifficultyLevel]
                  }
                >
                  {difficultyLabels[activity.difficulty as DifficultyLevel]}
                </Badge>
              </div>

              {/* Reward */}
              <div className="mt-4 flex items-center gap-2 text-lg font-semibold text-primary">
                <Coins className="size-5" />
                <span>{activity.rewardPulpaAmount} $PULPA</span>
              </div>

              {/* Type */}
              <div className="mt-2">
                <Badge variant="secondary">{activity.activityType}</Badge>
              </div>
            </div>

            <div className="border-t p-4">
              <Button className="w-full" variant="outline" asChild>
                <Link href={`/activities/${activity.id}`}>Ver detalles</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  )
}
