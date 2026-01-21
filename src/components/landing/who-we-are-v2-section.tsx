import { Section } from '../layout/section'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { SparkleIcon } from 'lucide-react'

export default function WhoWeAreV2Section() {
  const stats = [
    { value: '70%+', label: 'completan programas', bgColor: 'bg-card' },
    { value: '150k', label: 'vistas en redes', bgColor: 'bg-card' },
    { value: '25+', label: 'victorias en\nhackathons', bgColor: 'bg-card' },
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
    <section id="who-we-are-section" className="page py-8 md:pt-12 md:pb-16">
      <div className="page-content">
        <Section className="space-y-8">
          <h2 className="text-foreground text-center font-medium">
            Un colectivo de{' '}
            <span className="inline-block -rotate-1 transform rounded-lg bg-primary px-4 py-2 text-white shadow-lg font-semibold">
              Builders
            </span>
          </h2>
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="font-medium text-foreground text-xl text-center">
              No somos una escuela.<br />
              No somos una agencia.
            </p>
            <Card className="w-full md:max-w-none">
              <CardContent className="px-6 md:px-12">
                <CardHeader className="text-center px-0">
                  <CardTitle className="font-bold text-2xl text-accent">Somos infraestructura:</CardTitle>
                </CardHeader>
                <ul className="list-none text-lg leading-loose text-foreground md:text-xl">
                  <li className="flex items-center gap-2">
                    <SparkleIcon className="w-4 h-4 text-accent fill-accent" />
                    Una red de mentores elite
                  </li>
                  <li className="flex items-center gap-2">
                    <SparkleIcon className="w-4 h-4 text-accent fill-accent" />
                    Programas que producen resultados
                  </li>
                  <li className="flex items-center gap-2">
                    <SparkleIcon className="w-4 h-4 text-accent fill-accent" />
                    Comunidad que ejecuta junta.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Stats - Bold and Colorful */}
          <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-3 w-full md:max-w-screen-sm mx-auto">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className={`group flex flex-col items-center justify-center rounded-2xl ${stat.bgColor} p-8 text-center`}
              >
                <CardContent>
                  <h4 className={`text-5xl font-semibold text-primary`}>
                    {stat.value}
                  </h4>
                  <div className={`mt-3 whitespace-pre-line text-lg font-semibold text-foreground`}>
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>
      </div>
    </section>
  )
}
