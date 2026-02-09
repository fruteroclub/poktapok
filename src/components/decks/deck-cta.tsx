import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface DeckCTAProps {
  title: string
  description?: string
  primaryAction: {
    label: string
    href: string
  }
  secondaryAction?: {
    label: string
    href: string
  }
  contactEmail?: string
  className?: string
}

export function DeckCTA({
  title,
  description,
  primaryAction,
  secondaryAction,
  contactEmail,
  className,
}: DeckCTAProps) {
  return (
    <section
      className={cn(
        'flex flex-col items-center gap-6 rounded-2xl p-8 text-center sm:p-12',
        'bg-gradient-to-br from-secondary/10 via-primary/5 to-accent/10',
        'print:bg-gray-50 print:p-6',
        className,
      )}
    >
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl print:text-xl">
        {title}
      </h2>

      {description && (
        <p className="max-w-xl text-foreground/70 print:text-gray-600">
          {description}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button asChild size="lg" className="print:hidden">
          <Link href={primaryAction.href}>{primaryAction.label}</Link>
        </Button>

        {secondaryAction && (
          <Button asChild variant="outline" size="lg" className="print:hidden">
            <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
          </Button>
        )}
      </div>

      {contactEmail && (
        <p className="text-sm text-foreground/60">
          O escríbenos a{' '}
          <a
            href={`mailto:${contactEmail}`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {contactEmail}
          </a>
        </p>
      )}

      {/* Print-only contact info */}
      <div className="hidden print:block print:text-sm print:text-gray-600">
        <p>
          <strong>Contacto:</strong>{' '}
          {contactEmail || primaryAction.href}
        </p>
      </div>
    </section>
  )
}
