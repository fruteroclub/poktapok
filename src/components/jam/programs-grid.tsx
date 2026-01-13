/**
 * ProgramsGrid component - Grid layout for displaying programs
 * Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop
 */

import { ProgramCard } from './program-card'
import type { Program } from '@/types/api-v1'

interface ProgramsGridProps {
  programs: Program[]
  title?: string
  emptyMessage?: string
}

export function ProgramsGrid({
  programs,
  title = 'Programas activos',
  emptyMessage = 'No hay programas disponibles en este momento.',
}: ProgramsGridProps) {
  if (programs.length === 0) {
    return (
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold">{title}</h2>
          <p className="mt-4 text-muted-foreground">{emptyMessage}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold">{title}</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      </div>
    </section>
  )
}
