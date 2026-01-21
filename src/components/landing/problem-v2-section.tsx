import { Button } from '../ui/button'
import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Section } from '../layout/section'
import { Card, CardContent } from '../ui/card'

export default function ProblemV2Section() {
  const needs = [
    'Un programa que te lleve de la idea al producto desplegado',
    'Mentores que ya lo hicieron y te pueden guiar',
    'Una comunidad donde construir junto a otros que van en serio',
    'Un espacio para experimentar sin compromiso',
  ]

  return (

    <section id="problem-section" className="page py-8 md:pt-12">

      <div className="page-content">
        <Section className="space-y-8 text-center">
          <h2 className="text-3xl text-foreground md:text-4xl">
            Ya viste el potencial de la IA<br /> ¿<span className="subrayado underline-offset-8">Y ahora qué</span>?
          </h2>

          {/* Problem Description - Muted card with white text */}
          <Card className="bg-muted w-full md:max-w-md lg:max-w-2xl">
            <CardContent className="space-y-4">
              <p className="text-2xl text-white">
                Sabes que la tecnología puede cambiar todo.
              </p>
              <p className="text-2xl text-white">
                Pero hay una brecha entre
                <br />"esto es increíble" y
              </p>
              <p className="text-3xl text-white leading-snug font-medium">
                estoy <br /><span className='underline decoration-primary decoration-2 underline-offset-10'>ganando dinero</span><br />con esto
              </p>
            </CardContent>
          </Card>
          <p className="text-3xl text-foreground md:text-2xl font-medium">
            El secreto no es la herramienta.  <br />Es el  <br /><span className="inline-block -rotate-2 transform rounded-lg bg-accent px-4 py-2 text-foreground font-semibold text-4xl">contexto</span>
          </p>

          {/* What You Need */}
          <div className="space-y-6 md:max-w-2xl">
            <h3 className="text-center text-foreground">
              Lo que necesitas:
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {needs.map((need, index) => (
                <div key={index} className="group flex items-center gap-3 rounded-xl border-2 border-border bg-background p-4 transition-all hover:bg-muted hover:shadow-xl hover:text-white">
                  <CheckCircle2 className="h-8 w-8 shrink-0 text-primary" />
                  <p className="text-xl font-semibold leading-relaxed text-left">{need}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA - Muted background */}
          <Card className="bg-muted w-full md:max-w-md lg:max-w-2xl">
            <CardContent className="space-y-8">
              <h2 className="font-black text-background">
                Eso es <br />
                <span className="text-primary">Frutero Club</span>
              </h2>
              <div className="flex flex-col items-center justify-center gap-4 lg:flex-row px-4">
                <Button size="lg" variant="secondary" className="w-full" asChild>
                  <Link href="/programs">
                    Explora los programas
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-white w-full" asChild>
                  <Link href="#hub-section">
                    Ven al coworking gratis
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </Section>
      </div>
    </section>
  )
}