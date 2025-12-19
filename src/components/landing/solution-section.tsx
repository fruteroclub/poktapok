import { Users, Rocket, Trophy, ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'

interface Benefit {
  icon: typeof Users
  title: string
  description: string
  color: string
  bgColor: string
  ringColor: string
  cta: string
  url: string
}

const benefits: Benefit[] = [
  {
    icon: Users,
    title: 'Mentorías con profesionales activos',
    description: 'que están construyendo el futuro del Internet',
    color: 'text-primary',
    bgColor: 'bg-primary/5',
    ringColor: 'ring-primary/20',
    cta: 'Conecta con mentores',
    url: '/mentores',
  },
  {
    icon: Rocket,
    title: 'Experiencia en proyectos reales',
    description: 'IA, Cripto y tecnologías emergentes',
    color: 'text-secondary',
    bgColor: 'bg-secondary/5',
    ringColor: 'ring-secondary/20',
    cta: 'Explora proyectos',
    url: '/proyectos',
  },
  {
    icon: Trophy,
    title: 'Comunidad que celebra tu éxito',
    description: 'con recompensas compartidas',
    color: 'text-accent',
    bgColor: 'bg-accent/5',
    ringColor: 'ring-accent/20',
    cta: 'Contribuye y gana',
    url: '/recompensas',
  },
]

export default function SolutionSection() {
  return (
    <section
      id="solution-section"
      className="page relative overflow-hidden py-8 md:pt-12"
    >
      <div className="container">
        {/* Gradient Background Accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

        <div className="section relative space-y-8 md:space-y-12">
          {/* Hero Title Area - Asymmetric Layout */}
          <div className="container">
            <div className="relative max-w-xl">
              {/* Decorative Element */}
              <div className="absolute top-0 -left-4 h-32 w-1 bg-primary md:-left-8 md:h-40 lg:-left-4 lg:h-22" />

              <div className="pl-4 md:pl-12">
                <h2 className="mb-6 text-3xl leading-tight font-bold text-foreground md:text-4xl">
                  Un modelo diferente:
                  <br />
                  Ganas mientras <span className="text-primary">aprendes</span>
                </h2>

                <p className="max-w-2xl text-lg leading-relaxed text-foreground/80 md:text-xl">
                  En Frutero tu crecimiento es recompensado. <br /> Nuestro
                  modelo de éxito compartido significa que cuando tú ganas, toda
                  la comunidad gana.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits Grid - Diagonal Composition */}
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div
                    key={index}
                    className={`group relative overflow-hidden rounded-2xl border-2 border-border bg-background px-6 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-${benefit.color.replace('text-', '')}/30 hover:shadow-2xl`}
                  >
                    {/* Gradient Background on Hover */}
                    <div
                      className={`absolute inset-0 ${benefit.bgColor} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                    />

                    <div className="relative space-y-4">
                      {/* Icon with Ring */}
                      <div
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${benefit.bgColor} ring-4 ${benefit.ringColor} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                      >
                        <Icon className={`h-6 w-6 ${benefit.color}`} />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl leading-tight font-bold text-foreground">
                        {benefit.title}
                      </h3>

                      {/* Description */}
                      <p className="text-lg leading-relaxed text-muted-foreground">
                        {benefit.description}
                      </p>

                      {/* Checkmark Accent */}
                      <div className="pt-2">
                        <Link
                          href={benefit.url}
                          className={`flex items-center gap-2 hover:underline ${benefit.color}`}
                        >
                          {benefit.cta} <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>

                    {/* Corner Accent */}
                    <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mx-auto max-w-4xl text-center">
            <h3 className="leading-tight font-semibold text-foreground">
              Mas que educación, es
              <span className="inline-block rotate-2 transform rounded-lg bg-accent px-4 py-2 text-foreground">
                experiencia
              </span>
              <br />
              traducida en{' '}
              <span className="inline-block -rotate-2 transform rounded-lg bg-secondary px-4 py-2 text-white">
                oportunidades
              </span>
            </h3>
          </div>

          {/* Bottom Accent Line */}
          <div className="mx-auto mt-12 h-1 w-24 rounded-full bg-primary md:mt-16" />
        </div>
      </div>
    </section>
  )
}
