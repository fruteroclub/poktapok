/**
 * ClubHero - Hero section for Club landing page
 * Displays community headline and key stats
 */

import { Users, Trophy, Briefcase } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface ClubHeroProps {
  stats: {
    totalMembers: number
    totalProjects: number
    totalActivities: number
  }
}

export function ClubHero({ stats }: ClubHeroProps) {
  return (
    <div className="space-y-4">
      {/* Headline */}
      <div className="space-y-2 text-center">
        <h1 className="font-bold">Construye tu carrera en Web3</h1>
        <p className="text-xl text-muted-foreground">
          Únete a una comunidad de desarrolladores construyendo el futuro
          descentralizado
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="gap-2 text-center">
          <Users className="mx-auto size-12 text-primary" />
          <p className="text-4xl font-bold">{stats.totalMembers}</p>
          <p className="text-sm text-muted-foreground">Miembros activos</p>
        </Card>

        <Card className="gap-2 text-center">
          <Briefcase className="mx-auto size-12 text-primary" />
          <p className="text-4xl font-bold">{stats.totalProjects}</p>
          <p className="text-sm text-muted-foreground">Proyectos creados</p>
        </Card>

        <Card className="gap-2 text-center">
          <Trophy className="mx-auto size-12 text-primary" />
          <p className="text-4xl font-bold">{stats.totalActivities}</p>
          <p className="text-sm text-muted-foreground">
            Actividades completadas
          </p>
        </Card>
      </div>
    </div>
  )
}
