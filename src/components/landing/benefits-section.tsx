export default function BenefitsSection() {
  const benefits = [
    {
      title: 'Acceso prioritario',
      description: 'Eventos, grants y oportunidades antes que nadie',
      icon: '👑',
      color: 'orange',
    },
    {
      title: 'Monetización directa',
      description: 'Herramientas y conexiones para generar ingresos',
      icon: '💰',
      color: 'green',
    },
    {
      title: 'Fast track',
      description: 'Acelera tu carrera 3x más rápido',
      icon: '📈',
      color: 'pink',
    },
    {
      title: 'Red global',
      description: 'Conexiones internacionales en 15+ países',
      icon: '🌍',
      color: 'orange',
    },
    {
      title: 'Recursos premium',
      description: 'Cursos, templates y herramientas exclusivas',
      icon: '🛠️',
      color: 'green',
    },
    {
      title: 'Reputación elite',
      description: 'Credibilidad instant en el ecosistema tech',
      icon: '💎',
      color: 'pink',
    },
  ]

  return (
    <section className="py-20">
      <div className="page-content mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Beneficios <span className="text-primary">exclusivos</span> para
            miembros
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-muted">
            Acceso a oportunidades que no encontrarás en ningún otro lugar
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="rounded-2xl border-2 border-gray-100 bg-white p-8 text-center shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div
                className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
                  benefit.color === 'orange'
                    ? 'bg-primary/20'
                    : benefit.color === 'green'
                      ? 'bg-accent/20'
                      : 'bg-secondary/20'
                }`}
              >
                <span className="text-3xl">{benefit.icon}</span>
              </div>

              <h3
                className={`mb-3 text-xl font-bold ${
                  benefit.color === 'orange'
                    ? 'text-primary'
                    : benefit.color === 'green'
                      ? 'text-accent'
                      : 'text-secondary'
                }`}
              >
                {benefit.title}
              </h3>

              <p className="leading-relaxed text-muted">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA adicional */}
        <div className="text-center">
          <div className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 p-8">
            <h3 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
              ¿Listo para acceder a todos estos beneficios?
            </h3>
            <p className="mx-auto mb-6 max-w-2xl text-muted">
              Únete a la comunidad más exclusiva de builders y founders en LATAM
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button className="transform rounded-full bg-primary px-8 py-4 font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-primary/90">
                Aplicar ahora 🚀
              </button>
              <button className="rounded-full border-2 border-primary px-8 py-4 font-bold text-primary transition-all duration-200 hover:bg-primary/10">
                Ver más detalles 📋
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
