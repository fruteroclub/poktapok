import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface Stat {
  value: string | number
  label: string
  icon?: LucideIcon
  accent?: 'primary' | 'secondary' | 'accent'
}

interface DeckStatsProps {
  stats: Stat[]
  columns?: 2 | 3 | 4
  className?: string
}

export function DeckStats({
  stats,
  columns = 3,
  className,
}: DeckStatsProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  }

  const accentColors = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
  }

  return (
    <div className={cn('grid gap-4 sm:gap-6', gridCols[columns], className)}>
      {stats.map((stat, i) => {
        const Icon = stat.icon
        const accentClass = stat.accent
          ? accentColors[stat.accent]
          : 'text-primary'

        return (
          <div
            key={i}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl p-4 text-center',
              'bg-card/50 border border-border/30',
              'print:border-gray-200 print:bg-white',
            )}
          >
            {Icon && (
              <Icon
                className={cn('h-8 w-8 print:h-6 print:w-6', accentClass)}
              />
            )}
            <span
              className={cn(
                'text-3xl font-bold tracking-tight sm:text-4xl',
                'print:text-2xl',
                accentClass,
              )}
            >
              {stat.value}
            </span>
            <span className="text-sm text-foreground/70 print:text-gray-600">
              {stat.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
