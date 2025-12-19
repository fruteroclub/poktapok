export default function CommunitySection() {
  const benefits = [
    {
      title: 'Networking Exclusivo',
      description:
        'Conecta con founders, inversionistas y expertos de la industria',
      icon: '🤝',
      color: 'green',
    },
    {
      title: 'Mentorías Personalizadas',
      description:
        'Recibe guidance de fundadores exitosos que ya pasaron por tu proceso',
      icon: '🧭',
      color: 'orange',
    },
    {
      title: 'Recursos Premium',
      description:
        'Acceso a herramientas, templates y recursos exclusivos para startups',
      icon: '🛠️',
      color: 'pink',
    },
    {
      title: 'Eventos Privados',
      description:
        'Participa en eventos exclusivos, pitch sessions y demo days',
      icon: '🎪',
      color: 'green',
    },
    {
      title: 'Funding Opportunities',
      description:
        'Acceso directo a inversionistas y oportunidades de financiamiento',
      icon: '💰',
      color: 'orange',
    },
    {
      title: 'Community Support',
      description:
        'Una comunidad activa que te apoya en cada paso de tu journey',
      icon: '💚',
      color: 'pink',
    },
  ]

  return (
    <section className="bg-gradient-to-br from-background to-accent/10 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            ¿Qué hace especial a{' '}
            <span className="text-primary">Frutero Club</span>?
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-muted">
            Más que una comunidad, somos un ecosistema completo para tu
            crecimiento
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div
                className={`mb-6 flex h-16 w-16 items-center justify-center rounded-full ${benefit.color === 'green'
                  ? 'bg-accent/20'
                  : benefit.color === 'orange'
                    ? 'bg-primary/20'
                    : 'bg-secondary/20'
                  }`}
              >
                <span className="text-2xl">{benefit.icon}</span>
              </div>

              <h3 className="mb-3 text-xl font-bold text-foreground">
                {benefit.title}
              </h3>

              <p className="leading-relaxed text-muted">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Testimonio */}
        <div className="mt-20 text-center">
          <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-lg md:p-12">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                <span className="text-2xl">🥑</span>
              </div>
            </div>

            <blockquote className="mb-6 text-xl text-foreground italic md:text-2xl">
              &quot;Frutero Club no solo me conectó con los recursos que
              necesitaba, sino que me dio la comunidad y mentoría que transformó
              mi idea en una startup exitosa&quot;
            </blockquote>

            <div className="flex items-center justify-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                <span className="text-sm font-bold text-white">JP</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground">Juan Pérez</p>
                <p className="text-muted">CEO @ TechStartup</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
