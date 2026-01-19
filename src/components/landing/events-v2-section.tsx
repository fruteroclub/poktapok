import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import Link from 'next/link'

export default function EventsV2Section() {
  const events = [
    {
      date: 'FEB 15',
      title: 'VIBE CODING BOOTCAMP',
      duration: '2 semanas',
      mode: 'Híbrido',
      location: 'CDMX',
      description: 'Tu primera app con IA. Sin saber programar.',
      spots: '30 lugares',
      price: '$99 USD early bird',
      bgColor: 'bg-primary',
      dateColor: 'bg-primary',
    },
    {
      date: 'MAR 15',
      title: 'AGENTCAMP 2.0',
      duration: '4 semanas',
      mode: 'Virtual',
      location: 'Demo Day',
      description: 'Agentes de IA que trabajan para ti. El programa que produjo 6 ganadores en ETHDenver.',
      spots: '50 lugares',
      price: '$149 USD early bird',
      bgColor: 'bg-secondary',
      dateColor: 'bg-secondary',
    },
  ]

  return (
    <section id="events-section" className="page bg-card/50 py-20 md:py-28">
      <div className="page-content">
        <div className="mx-auto max-w-4xl space-y-16">
          {/* Headline */}
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-black text-foreground md:text-4xl lg:text-5xl">
              Construye algo{' '}
              <span className="inline-block rotate-2 transform rounded-lg bg-muted px-3 py-1 text-background shadow-lg">
                real
              </span>
            </h2>
            <p className="text-lg font-bold text-foreground md:text-xl">
              Programas con fecha de inicio.{' '}
              <span className="text-secondary">Lugares limitados.</span>
            </p>
          </div>

          {/* Events Timeline */}
          <div className="space-y-10">
            {events.map((event, index) => (
              <div key={index} className="space-y-4">
                {/* Date Divider */}
                <div className="flex items-center gap-4">
                  <div className={`rounded-full ${event.dateColor} px-4 py-2 shadow`}>
                    <span className="text-base font-black text-white">{event.date}</span>
                  </div>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {/* Event Card */}
                <div className={`group relative overflow-hidden rounded-2xl ${event.bgColor} p-8 shadow-lg transition-all hover:scale-[1.02]`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative space-y-4">
                    <h3 className="text-2xl font-black text-white md:text-3xl">
                      {event.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-sm text-white/90">
                      <span className="rounded bg-white/20 px-3 py-1 font-semibold">{event.duration}</span>
                      <span className="rounded bg-white/20 px-3 py-1 font-semibold">{event.mode}</span>
                      <span className="rounded bg-white/20 px-3 py-1 font-semibold">{event.location}</span>
                    </div>
                    <p className="text-base leading-relaxed text-white md:text-lg">
                      {event.description}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-white/30 pt-4">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white/90">{event.spots}</p>
                        <p className="text-lg font-black text-white">{event.price}</p>
                      </div>
                      <Button size="lg" className="bg-white text-foreground hover:bg-white/90 font-bold shadow" asChild>
                        <Link href="/programs">Inscríbete →</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Coworking - Always Available */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-accent px-4 py-2 shadow">
                  <span className="text-base font-black text-white">CADA SEMANA</span>
                </div>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-accent p-8 shadow-lg transition-all hover:scale-[1.02]">
                <div className="absolute inset-0 bg-black/5"></div>
                <div className="relative space-y-4">
                  <h3 className="text-2xl font-black text-white md:text-3xl">
                    COWORKING FRUTAL
                  </h3>
                  <div className="text-base text-white/90 font-bold">
                    Miércoles · CDMX
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow">
                    <p className="text-lg font-black text-accent">
                      GRATIS · SOLO LLEGA
                    </p>
                  </div>
                  <div className="flex justify-start">
                    <Button size="lg" className="bg-muted text-background hover:bg-muted/90 font-bold shadow" asChild>
                      <Link href="#hub-section">Ver ubicación →</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
