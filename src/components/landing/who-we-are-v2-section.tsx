import { Badge } from '../ui/badge'

export default function WhoWeAreV2Section() {
  const stats = [
    { value: '70%+', label: 'success rate\nen hackathons', bgColor: 'bg-primary' },
    { value: '32.7%', label: 'completion rate\n(vs 15% industria)', bgColor: 'bg-muted' },
    { value: '25+', label: 'victorias en\nhackathons', bgColor: 'bg-accent' },
  ]

  const dna = [
    { key: 'Ejecución', value: 'especulación' },
    { key: 'Shipping', value: 'perfección' },
    { key: 'Comunidad', value: 'spotlight' },
    { key: 'Impacto', value: 'reconocimiento' },
    { key: 'Validación', value: 'intuición' },
    { key: 'Métricas', value: 'opiniones' },
  ]

  return (
    <section id="who-we-are-section" className="page bg-card/50 py-20 md:py-28">
      <div className="page-content">
        <div className="mx-auto max-w-5xl space-y-20">
          {/* Headline */}
          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-black text-foreground md:text-4xl lg:text-5xl">
              Un colectivo de{' '}
              <span className="inline-block -rotate-1 transform rounded-lg bg-primary px-4 py-2 text-white shadow-lg">
                Impact Players
              </span>
            </h2>
            <div className="mx-auto max-w-4xl rounded-xl bg-muted p-6 shadow-lg">
              <p className="text-lg font-bold text-background md:text-xl">
                No somos una escuela. No somos una agencia.{' '}
                <span className="text-accent">Somos infraestructura.</span>
              </p>
            </div>
            <p className="mx-auto max-w-4xl text-lg leading-relaxed text-foreground md:text-xl">
              Una red de mentores elite + programas que producen resultados + comunidad que ejecuta junta. El talento que nadie más en LATAM tiene — multiplicado por una comunidad densa de builders que se elevan entre sí.
            </p>
          </div>

          {/* Stats - Bold and Colorful */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`group flex flex-col items-center justify-center rounded-2xl ${stat.bgColor} p-8 text-center shadow-lg transition-all hover:scale-105`}
              >
                <div className={`text-4xl font-black ${stat.bgColor === 'bg-muted' ? 'text-background' : 'text-white'} md:text-5xl`}>
                  {stat.value}
                </div>
                <div className={`mt-3 whitespace-pre-line text-base font-bold ${stat.bgColor === 'bg-muted' ? 'text-background/80' : 'text-white/90'}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* DNA - More Vibrant */}
          <div className="space-y-6 rounded-2xl bg-primary/10 p-8">
            <h3 className="text-center text-2xl font-black text-foreground md:text-3xl">
              El DNA de Frutero
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {dna.map((item, index) => (
                <div
                  key={index}
                  className="group relative transform transition-all hover:scale-105"
                >
                  <div className="absolute -inset-0.5 rounded-xl bg-primary opacity-50 blur"></div>
                  <div className="relative rounded-xl border-2 border-border bg-background px-6 py-3">
                    <span className="text-base font-black text-foreground">
                      {item.key}
                    </span>
                    <span className="mx-2 text-base font-black text-primary">&gt;</span>
                    <span className="text-base font-medium text-foreground/60 line-through">
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
