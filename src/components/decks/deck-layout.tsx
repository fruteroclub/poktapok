import { cn } from '@/lib/utils'

interface DeckLayoutProps {
  children: React.ReactNode
  className?: string
}

export function DeckLayout({ children, className }: DeckLayoutProps) {
  return (
    <div
      className={cn(
        'deck-layout',
        'relative min-h-screen w-full',
        'bg-gradient-to-b from-background via-background to-primary/5',
        'print:bg-white print:text-black',
        className
      )}
    >
      <div className="mx-auto max-w-5xl space-y-16 px-6 py-12 sm:px-8 md:py-16 lg:px-10 print:space-y-8 print:py-4">
        {children}
      </div>
    </div>
  )
}
