import { Button } from '../ui/button'
import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export default function ProblemV2Section() {
  const needs = [
    'Un programa que te lleve de la idea al producto desplegado',
    'Mentores que ya lo hicieron y te pueden guiar',
    'Una comunidad donde construir junto a otros que van en serio',
    'Un espacio para experimentar sin compromiso',
  ]

  return (
    <section id="problem-section" className="page bg-card/50 py-20 md:py-28">
      <div className="page-content">
        <div className="mx-auto max-w-5xl space-y-16">
          {/* Headline */}
          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-black text-foreground md:text-4xl lg:text-5xl">
              Ya viste el potencial. <span className="text-primary">¿Y ahora qué?</span>
            </h2>
          </div>

          {/* Problem Description - Muted card with white text */}
          <div className="space-y-6 rounded-2xl bg-muted p-8 md:p-10 shadow-xl">
            <p className="text-lg text-background md:text-xl">
              Usas ChatGPT. Has visto los videos. Sabes que la IA puede cambiar todo.
            </p>
            <p className="text-lg font-bold text-primary md:text-xl">
              Pero hay un gap entre "esto es increíble" y "estoy ganando dinero con esto."
            </p>
            <p className="text-xl font-black text-background md:text-2xl">
              El problema no es la herramienta. <span className="text-accent">Es el contexto.</span>
            </p>
          </div>

          {/* Pain Points - Orange card */}
          <div className="rounded-2xl bg-primary p-8 md:p-10 shadow-xl">
            <p className="text-lg leading-relaxed text-white md:text-xl">
              Solo no llegas lejos. No sabes qué construir. No tienes quién te diga si vas bien. Te atoras y no hay nadie que te desatore. Empiezas proyectos que nunca terminas.
            </p>
          </div>

          {/* What You Need */}
          <div className="space-y-6">
            <h3 className="text-center text-2xl font-black text-foreground md:text-3xl">
              Lo que necesitas:
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {needs.map((need, index) => (
                <div key={index} className="group flex items-start gap-4 rounded-xl border-2 border-border bg-background p-5 transition-all hover:scale-105 hover:bg-muted hover:shadow-xl">
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-accent" />
                  <p className="text-base font-semibold leading-relaxed text-foreground md:text-lg">{need}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA - Muted background */}
          <div className="space-y-6 rounded-2xl bg-muted p-8 text-center md:p-10">
            <p className="text-2xl font-black text-background md:text-3xl">
              Eso es <span className="text-primary">Frutero.</span>
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="bg-secondary text-white hover:bg-secondary/80 font-bold" asChild>
                <Link href="/programs">
                  Explora los programas
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
              <Button size="lg" className="bg-accent text-foreground hover:bg-accent/80 text-xl font-bold px-10 py-7" asChild>
                <Link href="#hub-section">
                  Ven al coworking gratis
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}