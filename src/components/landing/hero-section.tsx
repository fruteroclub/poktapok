import HeroCTAButtons from './cta-buttons'
import HeroCarousel from './hero-carousel'

export default function HeroSection() {
  return (
    <div className="min-h-[65svh] w-full pt-12 pb-8 md:pt-20 lg:pt-16">
      <div className="page-content mx-auto px-4">
        {/* Mobile: Single column layout */}
        <div className="flex flex-col gap-6 md:hidden">
          {/* Content */}
          <div className="space-y-4 text-center">
            {/* Título Principal */}
            <div className="mx-auto max-w-4xl">
              <h1 className="text-4xl leading-tight font-semibold text-foreground">
                <span className="inline-block -rotate-2 transform rounded-lg bg-accent px-4 py-2 text-foreground">
                  Acelera
                </span>{' '}
                tu carrera <br /> con{' '}
                <span className="inline-block rotate-2 transform rounded-lg bg-secondary px-4 py-2 text-white">
                  IA y Cripto
                </span>
              </h1>
            </div>
            <div className="mx-auto max-w-4xl">
              <h3 className="text-2xl text-foreground font-medium">
                Aprende, construye y <span className="subrayado underline-offset-8">gana</span><br /> con la mejor comunidad tech de LATAM:
              </h3>
              <p className="text-2xl text-foreground font-medium">
                Hackers, builders, founders y creadores
              </p>
            </div>

            {/* CTA Button */}
            <HeroCTAButtons />
          </div>

          {/* Carousel below CTAs on mobile */}
          <HeroCarousel className="h-64" />
        </div>

        {/* Desktop: Two column layout */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-8 md:items-center">
          {/* Left: Content */}
          <div className="space-y-6 text-center">
            {/* Título Principal */}
            <div>
              <h1 className="text-5xl leading-tight font-semibold text-foreground">
                <span className="inline-block -rotate-2 transform rounded-lg bg-accent px-4 py-2 text-foreground">
                  Acelera
                </span>{' '}
                tu carrera con{' '}
                <span className="inline-block rotate-2 transform rounded-lg bg-secondary px-4 py-2 text-white">
                  IA y Cripto
                </span>
              </h1>
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl text-foreground font-medium">
                Aprende, construye y <span className="subrayado underline-offset-8">gana</span><br /> con la mejor comunidad tech de LATAM:
              </h3>
              <p className="text-3xl text-foreground font-medium">
                Hackers, builders, founders y creadores
              </p>
            </div>

            {/* CTA Button */}
            <HeroCTAButtons />
          </div>

          {/* Right: Carousel */}
          <HeroCarousel className="h-[500px]" />
        </div>
      </div>
    </div>
  )
}