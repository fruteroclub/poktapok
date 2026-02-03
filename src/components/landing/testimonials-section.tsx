import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Marquee } from '@/components/ui/marquee'
import { Star } from 'lucide-react'

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
      image: 'https://pbs.twimg.com/profile_images/1640924898930438145/-lLXtOuS_400x400.jpg',
    },
    {
      quote:
        'Aparte de las vibras que fueron geniales, la explicación muy clara y el poder mirar en acción levantar código, especialmente el vibecode fue genial. Aprender en comunidad es divertido y genial.',
      name: 'Rocio',
      role: 'Builder @ Frutero Club',
      achievement: 'Miembro activo de la comunidad',
      initials: 'R',
      image: 'https://pbs.twimg.com/profile_images/1846047337845846016/sX2l1jO5_400x400.jpg',
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
      image: 'https://pbs.twimg.com/profile_images/1986348187913719808/GTkYxx1E_400x400.jpg',
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
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Lo que dicen los builders de nuestra comunidad
          </p>
        </div>

        {/* Marquee Carousel */}
        <div className="relative mx-auto w-full">
          {/* Left fade overlay */}
          <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-20 bg-gradient-to-r from-background to-transparent md:w-32" />

          {/* Right fade overlay */}
          <div className="pointer-events-none absolute top-0 right-0 z-10 h-full w-20 bg-gradient-to-l from-background to-transparent md:w-32" />

          <Marquee pauseOnHover className="[--duration:60s] [--gap:1rem]">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="w-80 flex-shrink-0 transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
              >
                <CardContent className="pt-6">
                  {/* Rating stars */}
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-primary text-primary"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <div className="mb-6">
                    <blockquote className="line-clamp-4 text-base leading-relaxed text-foreground">
                      &quot;{testimonial.quote}&quot;
                    </blockquote>
                  </div>

                  {/* Author info */}
                  <div className="mb-4 flex items-center gap-3 border-t border-border pt-4">
                    {testimonial.image ? (
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-xl font-bold text-primary">
                          {testimonial.initials}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-bold text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>

                  {/* Achievement badge */}
                  <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-3">
                    <p className="text-center text-sm font-semibold text-primary">
                      {testimonial.achievement}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </Marquee>
        </div>

        {/* Bottom text */}
        <div className="pt-4 text-center">
          <p className="text-lg font-medium text-foreground">
            Únete a más de <span className="text-primary">100+ builders</span>{' '}
            que ya están transformando su carrera
          </p>
        </div>
      </div>
    </section>
  )
}
