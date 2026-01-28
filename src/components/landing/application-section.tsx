export default function ApplicationSection() {
  const eligibilityRequirements = [
    {
      title: 'Perfil técnico o interés genuino en tech',
      icon: '⚡',
    },
    {
      title: 'Mentalidad de builder, no de consumidor',
      icon: '🛠️',
    },
    {
      title: 'Compromiso con crecimiento y comunidad',
      icon: '🌱',
    },
    {
      title: 'Disposición para contribuir y colaborar',
      icon: '🤝',
    },
  ]

  const applicationSteps = [
    {
      title: 'Completa el formulario',
      description: '(5 minutos)',
      icon: '📝',
      color: 'orange',
    },
    {
      title: 'Review de perfil y portfolio',
      description: '',
      icon: '👀',
      color: 'green',
    },
    {
      title: 'Entrevista técnica/cultural',
      description: '(30 min)',
      icon: '💬',
      color: 'pink',
    },
    {
      title: 'Onboarding y bienvenida',
      description: '',
      icon: '🎉',
      color: 'orange',
    },
    {
      title: 'Proceso completo: 1-2 semanas',
      description: '',
      icon: '⏰',
      color: 'green',
    },
  ]

  return (
    <section className="bg-background/30 py-20">
      <div className="page-content mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            ¿Listo para <span className="text-primary">unirte</span> a la elite?
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-muted">
            El proceso de selección garantiza la calidad de nuestra comunidad
          </p>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Eligibility Requirements */}
            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <h3 className="mb-6 text-center text-2xl font-bold text-foreground">
                ¿Quién puede aplicar?
              </h3>

              <div className="space-y-6">
                {eligibilityRequirements.map((requirement, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
                      <span className="text-lg">{requirement.icon}</span>
                    </div>
                    <div>
                      <p className="leading-relaxed font-medium text-foreground">
                        {requirement.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-accent/10 p-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💡</span>
                  <h4 className="font-bold text-accent">Tip importante</h4>
                </div>
                <p className="text-sm text-muted">
                  No necesitas ser un experto, pero sí tener ganas reales de
                  aprender, contribuir y hacer crecer la comunidad tech.
                </p>
              </div>
            </div>

            {/* Application Process */}
            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <h3 className="mb-6 text-center text-2xl font-bold text-foreground">
                Proceso de aplicación
              </h3>

              <div className="space-y-6">
                {applicationSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                        step.color === 'orange'
                          ? 'bg-primary/20'
                          : step.color === 'green'
                            ? 'bg-accent/20'
                            : 'bg-secondary/20'
                      }`}
                    >
                      <span className="text-lg">{step.icon}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {step.title}
                      </p>
                      {step.description && (
                        <p className="text-sm font-medium text-primary">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-primary/10 p-6">
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <h4 className="font-bold text-primary">Proceso rápido</h4>
                </div>
                <p className="text-sm text-muted">
                  Nuestro proceso está optimizado para ser eficiente. La mayoría
                  de aplicaciones se procesan en menos de una semana.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="mx-auto max-w-4xl rounded-2xl bg-linear-to-r from-primary via-secondary to-secondary p-8 text-white md:p-12">
            <h3 className="mb-4 text-2xl font-bold md:text-3xl">
              ¿Cumples con el perfil? ¡Aplica ahora!
            </h3>
            <p className="mx-auto mb-6 max-w-2xl text-white/90">
              Únete a la comunidad más exclusiva de builders y founders en LATAM
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button className="transform rounded-full bg-white px-8 py-4 font-bold text-foreground shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-100">
                Comenzar aplicación 🚀
              </button>
              <button className="rounded-full border-2 border-white px-8 py-4 font-bold text-white transition-all duration-200 hover:bg-white/10">
                Hablar con un miembro 💬
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="mb-2 text-2xl font-bold text-accent">85%</h4>
              <p className="text-sm text-muted">Tasa de aceptación</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="mb-2 text-2xl font-bold text-primary">3 días</h4>
              <p className="text-sm text-muted">Tiempo promedio</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <span className="text-2xl">⭐</span>
              </div>
              <h4 className="mb-2 text-2xl font-bold text-secondary">4.9/5</h4>
              <p className="text-sm text-muted">Satisfacción del proceso</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
