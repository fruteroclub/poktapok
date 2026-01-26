/**
 * ActivityCard - Reusable card component for displaying activities
 * Used across Club section pages
 */

import Link from 'next/link'
import { Trophy, Users, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Activity } from '@/services/activities'

interface ActivityCardProps {
  activity: Activity
  showStats?: boolean
}

export function ActivityCard({ activity, showStats = true }: ActivityCardProps) {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  }

  const difficultyLabels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  }

  const difficulty = activity.difficulty as 'beginner' | 'intermediate' | 'advanced'

  return (
    <Link href={`/club/activities/${activity.id}`}>
      <Card className="h-full p-6 transition-colors hover:bg-accent">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="flex-1 font-semibold line-clamp-2">{activity.title}</h3>
            <Badge className={difficultyColors[difficulty]}>{difficultyLabels[difficulty]}</Badge>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-3">{activity.description}</p>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Trophy className="size-4 text-amber-500" />
              <span className="font-medium">{Math.floor(Number(activity.rewardPulpaAmount))} $PULPA</span>
            </div>

            {showStats && (
              <>
                {activity.totalAvailableSlots && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="size-4" />
                    <span>
                      {activity.currentSubmissionsCount}/{activity.totalAvailableSlots}
                    </span>
                  </div>
                )}

                {activity.status === 'active' && (
                  <Badge variant="outline" className="border-green-500 text-green-700">
                    Activa
                  </Badge>
                )}
              </>
            )}
          </div>

          {/* Type Badge */}
          <div>
            <Badge variant="secondary">{activity.activityType}</Badge>
          </div>
        </div>
      </Card>
    </Link>
  )
}
