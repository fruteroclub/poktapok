/**
 * ProgramCard component - Card for displaying program information
 * Used in program listings and grids
 */

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Calendar, Zap } from 'lucide-react'
import type { Program } from '@/types/api-v1'

interface ProgramCardProps {
  program: Program & {
    stats?: {
      enrollments: number
      sessions: number
      activities: number
    }
  }
}

export function ProgramCard({ program }: ProgramCardProps) {
  return (
    <Card
      className="flex flex-col overflow-hidden py-4 transition-all hover:shadow-lg"
      role="button"
      tabIndex={0}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{program.name}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {program.description}
            </p>
          </div>
          <Badge
            variant={program.programType === 'cohort' ? 'default' : 'secondary'}
          >
            {program.programType === 'cohort' ? 'Cohort' : 'Abierto'}
          </Badge>
        </div>

        {/* Stats */}
        {program.stats && (
          <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="size-4" />
              <span>{program.stats.enrollments} inscritos</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-4" />
              <span>{program.stats.sessions} sesiones</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="size-4" />
              <span>{program.stats.activities} actividades</span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t p-4">
        <Button className="w-full" variant="outline" asChild>
          <Link href={`/jam/programs/${program.id}`}>Ver detalles</Link>
        </Button>
      </div>
    </Card>
  )
}
