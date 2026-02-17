import { cn } from '@/lib/utils'

interface DeckSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  variant?: 'default' | 'highlight'
  className?: string
}

export function DeckSection({
  title,
  description,
  children,
  variant = 'default',
  className,
}: DeckSectionProps) {
  return (
    <section
      className={cn(
        'space-y-6 print:break-before-page',
        variant === 'highlight' && 'rounded-xl bg-primary/5 p-6 sm:p-8',
        className,
      )}
    >
      <div className="space-y-2">
        <h2 className="font-funnel text-2xl font-semibold tracking-tight text-foreground sm:text-3xl print:text-xl">
          {title}
        </h2>
        {description && (
          <p className="max-w-3xl text-foreground/70 print:text-gray-600">
            {description}
          </p>
        )}
      </div>
      <div>{children}</div>
    </section>
  )
}
