/**
 * JamHero component - Hero section for Jam landing page
 * Displays headline, stats, and CTA button
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar, Users, Coins } from 'lucide-react'

interface JamHeroProps {
  stats: {
    activePrograms: number
    upcomingSessions: number
    totalRewardsDistributed: number
  }
}

export function JamHero({ stats }: JamHeroProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Aprende, construye y gana <span className="text-primary">$PULPA</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Únete a programas de aprendizaje, participa en sesiones en vivo, y
          completa actividades para ganar recompensas mientras construyes tu
          carrera en Web3.
        </p>
        <div>
          <Button asChild size="lg">
            <Link href="/jam/programs">Explora programas</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid w-full gap-4 sm:grid-cols-3">
        <Card className="flex flex-col items-center gap-2 px-4 py-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Users className="size-6 text-primary" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.activePrograms}</div>
            <div className="text-sm text-muted-foreground">
              Programas activos
            </div>
          </div>
        </Card>

        <Card className="flex flex-col items-center gap-2 px-4 py-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Calendar className="size-6 text-primary" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.upcomingSessions}</div>
            <div className="text-sm text-muted-foreground">
              Sesiones próximas
            </div>
          </div>
        </Card>

        <Card className="flex flex-col items-center gap-2 px-4 py-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Coins className="size-6 text-primary" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">
              {stats.totalRewardsDistributed.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              $PULPA distribuidos
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
