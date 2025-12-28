import { SparklesIcon } from 'lucide-react'
import AuthButtonPrivy from '../buttons/auth-button-privy'
import BuildersShowcaseMarquee from './builders-showcase-marquee'

export default function HeroSection() {
  return (
    <div className="min-h-[70svh] w-full pt-12 pb-8 md:pt-20 lg:pt-16">
      <div className="container mx-auto space-y-8 px-4 text-center">
        {/* Título Principal */}
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl leading-tight font-semibold text-foreground md:text-5xl">
            Acelera tu{' '}
            <span className="inline-block -rotate-2 transform rounded-lg bg-accent px-4 py-2 text-foreground">
              Crecimiento
            </span>{' '}
            <br className="md:hidden" />
            con
            <br />
            oportunidades en{' '}
            <span className="inline-block rotate-2 transform rounded-lg bg-secondary px-4 py-2 text-white">
              IA y Cripto
            </span>
          </h1>
        </div>

        <p className="text-2xl text-foreground md:text-3xl md:font-medium lg:text-2xl lg:font-medium">
          Deja de perder el tiempo en trabajos sin sentido. <br /> Únete y crece
          resolviendo problemas reales con tecnología,
        </p>

        {/* CTA Button */}
        <div className="flex justify-center">
          <AuthButtonPrivy
            size="lg"
            className="text-2xl font-medium transition duration-300 ease-in-out hover:scale-105 lg:px-14 lg:py-6"
          >
            Quiero unirme{' '}
            <SparklesIcon className="ml-2 h-5 w-5 fill-background" />
          </AuthButtonPrivy>
        </div>

        {/* Builders Showcase */}
        <BuildersShowcaseMarquee />
      </div>
    </div>
  )
}
