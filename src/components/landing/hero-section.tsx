import HeroCTAButtons from './cta-buttons'

export default function HeroSection() {
  return (
    <div className="min-h-[65svh] w-full pt-12 pb-8 md:pt-20 lg:pt-16">
      <div className="page-content mx-auto space-y-8 px-4 text-center">
        {/* Título Principal */}
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl leading-tight font-semibold text-foreground md:text-5xl">
            El colectivo donde{" "}
            <span className="inline-block -rotate-2 transform rounded-lg bg-accent px-4 py-2 text-foreground">
              Aceleras
            </span>
            <br />
            tu carrera con{' '}
            <span className="inline-block rotate-2 transform rounded-lg bg-secondary px-4 py-2 text-white">
              IA y Cripto
            </span>
          </h1>
        </div>
        <div className="mx-auto max-w-4xl space-y-4">
          <h3 className="text-foreground font-medium">
            Aprende, construye y <span className="subrayado underline-offset-8">gana</span><br /> con la mejor comunidad tech de LATAM:
          </h3>
          <p className="text-foreground font-medium text-3xl">
            Hackers, builders, founders y creadores
          </p>
        </div>

        {/* CTA Button */}
        <HeroCTAButtons />
      </div>
    </div>
  )
}