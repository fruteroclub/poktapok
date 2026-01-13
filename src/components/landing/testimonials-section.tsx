import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        'La combinación perfecta entre teoría y práctica. Me encantó poder aplicar inmediatamente los conceptos de Web3 en un proyecto real que resuelve un problema genuino. La comunidad de builders y el acceso a mentores fue invaluable para validar mi arquitectura técnica y estrategia de go-to-market.',
      name: 'Moises Cisneros',
      role: 'Builder @ Verano en Cadena',
      achievement: 'Construyó Know the Score en Farcaster',
      initials: 'MC',
    },
    {
      quote:
        'Las herramientas y el espacio de networking que permitieron, es muy necesario este tipo de espacios. Trabajar con Frutero fue una excelente experiencia, el equipo es muy profesional y tienen conocimiento técnico muy avanzado.',
      name: 'Soxavisual',
      role: 'Fundador @ La Blocka',
      achievement: 'Socio de la comunidad Frutero',
      initials: 'SV',
    },
    {
      quote:
        'Aparte de las vibras que fueron geniales, la explicación muy clara y el poder mirar en acción levantar código, especialmente el vibecode fue genial. Aprender en comunidad es divertido y genial.',
      name: 'Rocio',
      role: 'Builder @ Frutero Club',
      achievement: 'Miembro activo de la comunidad',
      initials: 'R',
    },
    {
      quote:
        'Los mensajes de Jazz haha. Soy Juan y participé en verano en cadena con base, llegué a la última fase y la app que construí fue LID, se trata de una app de donaciones, la experiencia fue muy bien gracias.',
      name: 'Juan',
      role: 'Builder @ Verano en Cadena',
      achievement: 'Construyó LID - App de donaciones',
      initials: 'J',
    },
    {
      quote:
        'Claude code, fue un despertar jajja, el onboarding de normies q sacaron app (hermana y primo), y la atención en los últimos momentos del submit top jajaja.',
      name: 'Roman Scarf',
      role: 'Builder @ Frutero Club',
      achievement: 'Onboarding exitoso con Claude Code',
      initials: 'RS',
    },
    {
      quote:
        'La confianza, el acompañamiento, la amabilidad y los conocimientos que generé. Mi proyecto se llama nitedcrypto, mi meta es poder hacer una web o app cryptofriendly para todos y que se puedan comunicar entre todos.',
      name: 'Diego Fernando Mancera Gomez',
      role: 'Builder @ Frutero Club',
      achievement: 'Fundador de nitedcrypto',
      initials: 'DM',
    },
  ]

  return (
    <section className="page py-12">
      <div className="page-content gap-y-6">
        <div className="space-y-2 px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            Historias reales de{' '}
            <span className="text-secondary">transformación</span>
          </h2>
          <p className="max-w-2xl text-xl text-muted">
            De hackers con potencial a profesionales exitosos
          </p>
        </div>

        <div className="section grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent>
                <div className="mb-6">
                  <blockquote className="text-lg leading-relaxed text-foreground">
                    &quot;{testimonial.quote}&quot;
                  </blockquote>
                </div>

                <div className="mb-4 flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-xl font-bold text-primary">
                      {testimonial.initials}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border-2 border-foreground bg-background p-3">
                  <p className="text-center font-semibold text-primary">
                    {testimonial.achievement}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-center pt-6">
          <Button variant="outline" size="lg">
            Leer más testimonios
          </Button>
        </div>
      </div>
    </section>
  )
}
