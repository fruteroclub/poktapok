import HeroCTAButtons from './cta-buttons'
import HeroCarousel from './hero-carousel'

export default function HeroSection() {
  return (
    <div className="min-h-[65svh] w-full pt-12 pb-8 md:pt-20 lg:pt-16">
      <div className="page-content mx-auto px-4">
        {/* Mobile/Tablet: Single column layout */}
        <div className="flex flex-col gap-6 lg:hidden">
          {/* Content */}
          <div className="space-y-4 md:space-y-6 text-center">
            {/* Título Principal */}
            <div className="mx-auto max-w-4xl">
              <h1 className="text-4xl md:text-5xl leading-tight font-semibold text-foreground">
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
              <h3 className="text-2xl md:text-3xl text-foreground font-medium">
                Aprende, construye y <span className="subrayado underline-offset-8">gana</span><br /> con la mejor comunidad tech de LATAM:
              </h3>
              <p className="text-2xl md:text-3xl text-foreground font-medium">
                Hackers, builders, founders y creadores
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center">
              <HeroCTAButtons />
            </div>
          </div>

          {/* Carousel below CTAs on mobile/tablet */}
          <HeroCarousel className="h-64 md:h-96" />
        </div>

        {/* Desktop (lg+): Two column layout */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
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
            <div className="flex justify-center">
              <HeroCTAButtons />
            </div>
          </div>

          {/* Right: Carousel */}
          <HeroCarousel className="h-[500px]" />
        </div>
      </div>
    </div>
  )
}