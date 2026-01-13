import { SparklesIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import AuthButtonPrivy from '../buttons/auth-button-privy'
import BuildersShowcaseMarquee from './builders-showcase-marquee'

export default function HeroSection() {
  return (
    <div className="min-h-[70svh] w-full pt-12 pb-8 md:pt-20 lg:pt-16">
      <div className="page-content mx-auto space-y-8 px-4 text-center">
        {/* Título Principal */}
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl leading-tight font-semibold text-foreground md:text-5xl">
            Aprende a{' '}
            <span className="inline-block -rotate-2 transform rounded-lg bg-accent px-4 py-2 text-foreground">
              ganar más
            </span>{' '}
            con IA
          </h1>
        </div>

        <p className="text-2xl text-foreground md:text-3xl md:font-medium lg:text-2xl lg:font-medium">
          La comunidad donde desarrollas habilidades reales, <br />
          conectas con mentores activos, y ganas mientras aprendes.
        </p>

        {/* Proof Metrics using Badge component */}
        <div className="flex flex-wrap justify-center gap-4">
          <Badge variant="secondary" className="bg-accent/10 text-accent">
            32.7% tasa de completación (6x promedio)
          </Badge>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            25+ victorias en hackathones
          </Badge>
          <Badge variant="secondary" className="bg-secondary/10 text-secondary">
            6 ganadores ETHDenver 2025
          </Badge>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <AuthButtonPrivy
            size="lg"
            className="text-2xl font-medium lg:px-14 lg:py-6"
          >
            Únete a la Comunidad{' '}
            <SparklesIcon className="ml-2 h-5 w-5 fill-background" />
          </AuthButtonPrivy>

          <Button
            variant="outline"
            size="lg"
            className="text-2xl font-medium lg:px-14 lg:py-6"
            asChild
          >
            <Link href="#programs-section">Explora Programas</Link>
          </Button>
        </div>

        {/* Builders Showcase */}
        <BuildersShowcaseMarquee />
      </div>
    </div>
  )
}
