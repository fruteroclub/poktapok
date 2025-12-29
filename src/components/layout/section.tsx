'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  className?: string
}

export function Section({ children, className }: SectionProps) {
  return (
    <section
      className={cn(
        'flex w-full flex-col items-center',
        'md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl',
        className,
      )}
    >
      {children}
    </section>
  )
}
