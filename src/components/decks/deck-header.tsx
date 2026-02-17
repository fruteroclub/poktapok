import { cn } from '@/lib/utils'
import Image from 'next/image'

interface DeckHeaderProps {
  title: string
  subtitle?: string
  logo?: {
    src: string
    alt: string
    width?: number
    height?: number
  }
  className?: string
}

export function DeckHeader({
  title,
  subtitle,
  logo,
  className,
}: DeckHeaderProps) {
  return (
    <header
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-gradient-to-br from-primary/90 via-primary/80 to-secondary/70',
        'px-8 py-12 text-center text-primary-foreground sm:px-12 sm:py-16',
        'print:rounded-none print:bg-transparent print:py-6 print:text-black',
        className,
      )}
    >
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 print:hidden" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5 print:hidden" />

      <div className="relative flex flex-col items-center gap-6">
        {logo && (
          <Image
            src={logo.src}
            alt={logo.alt}
            width={logo.width ?? 120}
            height={logo.height ?? 120}
            className="print:h-16 print:w-16"
          />
        )}

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl print:text-3xl">
          {title}
        </h1>

        {subtitle && (
          <p className="max-w-2xl text-lg text-primary-foreground/85 sm:text-xl print:text-base print:text-gray-600">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  )
}
