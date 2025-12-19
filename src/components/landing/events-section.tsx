export default function EventsSection() {
  const upcomingEvents = [
    {
      title: 'Web3 Builders Bootcamp',
      subtitle: 'BOOTCAMP INTENSIVO DE SOLIDITY',
      description: 'Séptima sesión Stablecoins y oráculos',
      date: '15-20 Enero 2025',
      duration: '5 días intensivos',
      availability: 'Cupo limitado',
      color: 'dark',
      icon: '🌟',
    },
    {
      title: 'AI Hackathon México',
      subtitle: 'Open Call FRUTERO CLUB',
      description:
        'Crea una Prueba de Concepto con IA que resuelva un problema real',
      date: '1-3 Febrero 2025',
      prize: '$10K en premios',
      availability: 'Registro abierto',
      color: 'blue',
      icon: '🧠',
    },
    {
      title: 'AgentCamp Demo Day',
      subtitle: 'Founder Masterclass',
      description: 'Aprende los secretos del fundraising',
      date: '15 Febrero 2025',
      topic: 'Fundraising secrets',
      availability: 'Solo para miembros',
      color: 'purple',
      icon: '💼',
    },
  ]

  return (
    <section className="bg-background/50 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Eventos que <span className="text-primary">transforman</span>{' '}
            carreras
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-muted">
            Donde nacen las ideas y se forjan las conexiones
          </p>
        </div>

        {/* Featured Event */}
        <div className="mb-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-purple-900 to-teal-800 p-8 text-white md:p-12">
            <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              {/* Título y co-hosts */}
              <div className="flex flex-1 flex-col justify-center">
                <h3 className="mb-4 font-funnel text-6xl font-bold md:text-7xl">
                  FRUTERO
                  <br />
                  <span className="text-4xl md:text-5xl">CLUB</span>
                </h3>
                {/* Co-hosts y mascotas mejorados */}
                <div className="mt-8 flex items-center gap-4">
                  {/* Co-host badge */}
                  <div className="flex items-center gap-2 rounded-full bg-white/30 px-4 py-2 backdrop-blur-sm">
                    <span className="font-bold text-white">Co-host</span>
                    <span className="text-2xl">🍓</span>
                    <span className="text-2xl">🍉</span>
                  </div>
                  {/* CR badge */}
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-black text-lg font-bold text-white">
                    CR
                    <span className="ml-2 text-2xl">🍇</span>
                  </div>
                  {/* Banana */}
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/30 backdrop-blur-sm">
                    <span className="text-2xl">🍌</span>
                  </div>
                </div>
              </div>
              {/* Título del evento y fecha */}
              <div className="flex flex-1 flex-col items-end justify-center">
                <h4 className="mb-4 text-2xl font-bold md:text-3xl">
                  Coworking Frutal
                </h4>
                <div className="flex items-center gap-2 rounded-2xl bg-white/30 px-6 py-3">
                  <span className="text-2xl">📅</span>
                  <span className="text-lg font-bold text-primary">
                    1-3 Febrero 2025
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div>
          <h3 className="mb-8 text-center text-2xl font-bold text-foreground md:text-3xl">
            Próximos <span className="text-primary">eventos</span>
          </h3>

          <div className="grid gap-6 md:grid-cols-3">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="rounded-2xl border-2 border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="mb-6 text-center">
                  <div
                    className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${event.color === 'dark'
                      ? 'bg-foreground'
                      : event.color === 'blue'
                        ? 'bg-blue-500'
                        : 'bg-purple-500'
                      }`}
                  >
                    <span className="text-2xl">{event.icon}</span>
                  </div>
                  <h4 className="mb-2 text-xl font-bold text-foreground">
                    {event.title}
                  </h4>
                  <p className="mb-3 text-sm font-bold tracking-wide text-primary uppercase">
                    {event.subtitle}
                  </p>
                  <p className="mb-4 text-sm text-muted">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">📅</span>
                    <span className="text-sm font-medium text-foreground">
                      {event.date}
                    </span>
                  </div>

                  {event.duration && (
                    <div className="flex items-center gap-2">
                      <span className="text-primary">⏱️</span>
                      <span className="text-sm font-medium text-foreground">
                        {event.duration}
                      </span>
                    </div>
                  )}

                  {event.prize && (
                    <div className="flex items-center gap-2">
                      <span className="text-primary">💰</span>
                      <span className="text-sm font-medium text-foreground">
                        {event.prize}
                      </span>
                    </div>
                  )}

                  {event.topic && (
                    <div className="flex items-center gap-2">
                      <span className="text-primary">🎯</span>
                      <span className="text-sm font-medium text-foreground">
                        {event.topic}
                      </span>
                    </div>
                  )}

                  <div
                    className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${event.availability === 'Cupo limitado'
                      ? 'bg-primary/20 text-primary'
                      : event.availability === 'Registro abierto'
                        ? 'bg-accent/20 text-accent'
                        : 'bg-secondary/20 text-secondary'
                      }`}
                  >
                    {event.availability}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
            <h3 className="mb-4 text-2xl font-bold text-foreground">
              ¿Listo para tu próximo evento?
            </h3>
            <p className="mb-6 text-muted">
              Regístrate y no te pierdas las mejores oportunidades
            </p>
            <button className="transform rounded-full bg-primary px-8 py-4 font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-primary/90">
              Ver todos los eventos 🎪
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
