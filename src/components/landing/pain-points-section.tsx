'use client'

import {
  ChevronsDownIcon,
  CircleSlash,
  Infinity,
  TrendingDown,
} from 'lucide-react'
import { JSX, SVGProps } from 'react'
import { AnimatedList } from '@/components/ui/animated-list'
import { cn, scrollToNextSection } from '@/lib/utils'
import { Button } from '../ui/button'

interface PainPoint {
  icon: (
    props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>,
  ) => JSX.Element
  text: string
  color: string
  bgColor: string
}

const painPoints: PainPoint[] = [
  {
    icon: (props) => <Infinity {...props} />,
    text: 'Saltas de tutorial en tutorial sin resultado claro ni certificación real',
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
  },
  {
    icon: (props) => <TrendingDown {...props} />,
    text: 'Quemas tiempo en proyectos basura que no construyen tu portafolio',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: (props) => <CircleSlash {...props} />,
    text: 'Sientes que el esfuerzo no vale la pena porque nadie valora tu progreso',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
]

function PainPointItem({ icon: Icon, text, color, bgColor }: PainPoint) {
  return (
    <div className="flex w-full max-w-2xl items-start gap-4 rounded-xl border-2 border-border bg-background p-6 shadow-lg">
      <div
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg',
          bgColor,
        )}
      >
        <Icon className={cn('h-6 w-6', color)} />
      </div>
      <p className="flex-1 text-base leading-relaxed text-foreground md:text-lg">
        {text}
      </p>
    </div>
  )
}

function BridgeStatement() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 text-center">
      <div className="relative rounded-2xl border-2 border-primary/30 bg-linear-to-br from-primary/5 to-secondary/5 p-6 shadow-lg md:p-8">
        {/* Decorative corner accent */}
        <div className="absolute top-0 left-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
        <div className="absolute right-0 bottom-0 h-3 w-3 translate-x-1/2 translate-y-1/2 rounded-full bg-secondary" />

        <p className="text-lg leading-relaxed font-medium text-foreground md:text-xl">
          Aunque estas situaciones son comunes, pueden{' '}
          <span className="text-primary">prevenirse</span> con una metodología
          comprobada de crecimiento profesional
        </p>
      </div>

      <div className="flex justify-center gap-2">
        <Button
          variant="link"
          size="lg"
          onClick={() => scrollToNextSection('solution-section')}
          className="text-xl font-medium text-secondary md:text-2xl"
        >
          El modelo Frutero
          <ChevronsDownIcon className="h-6 w-6 text-secondary" />
        </Button>
      </div>
    </div>
  )
}

export default function PainPointsSection() {
  return (
    <section
      id="pain-points-section"
      className="page bg-linear-to-b from-card/30 to-card/50 py-8 md:pt-12"
    >
      <div className="page-content">
        <div className="space-y-4 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            ¿Te suena familiar?
          </h2>
          <p className="text-lg text-muted-foreground">
            Si estos problemas resuenan contigo, no estás solo
          </p>
        </div>

        {/* Fixed height container to prevent layout shift */}
        <div className="relative mx-auto min-h-[70svh] max-w-3xl">
          <AnimatedList delay={1500} className="max-w-3xl">
            {painPoints.map((point, index) => (
              <PainPointItem key={index} {...point} />
            ))}
            <BridgeStatement key="bridge" />
          </AnimatedList>
        </div>
      </div>
    </section>
  )
}
