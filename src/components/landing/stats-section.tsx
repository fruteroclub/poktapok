import { JSX, SVGProps } from 'react'
import StatCard from '@/components/stats/stat-card'
import { Card, CardContent } from '@/components/ui/card'
import {
  CoinsIcon,
  GlobeIcon,
  HandshakeIcon,
  RocketIcon,
  TestTubeDiagonalIcon,
  TrophyIcon,
} from 'lucide-react'

export default function StatsSection() {
  return (
    <section className="page py-12">
      <div className="page-content gap-y-8">
        <div className="flex flex-col gap-y-4 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            Nuestro <span className="text-primary">impacto</span> en números
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            No son promesas, son{' '}
            <span className="font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-2">
              resultados
            </span>{' '}
            de nuestra comunidad
          </p>
        </div>

        {/* Featured Stat - $100k+ */}
        <div className="mx-auto max-w-md">
          <Card className="border-2 border-primary transition-shadow hover:shadow-lg">
            <CardContent className="space-y-2 pt-6 text-center">
              <CoinsIcon className="mx-auto h-12 w-12 text-primary" />
              <div className="text-6xl font-bold text-primary">$100k+</div>
              <p className="text-xl text-foreground">
                USD distribuidos a la comunidad
              </p>
              <p className="text-sm text-muted-foreground">
                En los últimos 12 meses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid - Remaining 5 stats */}
        <div className="mx-auto grid grid-cols-2 gap-4 md:max-w-xl md:grid-cols-2 lg:max-w-screen-md lg:grid-cols-3 lg:gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              number={stat.number}
              description={stat.description}
            />
          ))}
        </div>
        {/* <div className="flex justify-center w-full pt-6 lg:pt-4">
          <Button variant='secondary' size='xl'
            className={cn(
              'lg:px-14 lg:py-6 text-2xl font-medium transition duration-300 ease-in-out hover:scale-105',
              'w-2/3 md:w-auto')}
          >¡Quiero unirme!</Button>
        </div> */}
      </div>
    </section>
  )
}

const stats = [
  {
    icon: (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
      <HandshakeIcon {...props} />
    ),
    number: '100+',
    description: 'Profesionales conectados',
  },
  {
    icon: (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
      <RocketIcon {...props} />
    ),
    number: '30+',
    description: 'Startups lanzadas',
  },
  {
    icon: (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
      <GlobeIcon {...props} />
    ),
    number: '15+',
    description: 'Países alcanzados',
  },
  {
    icon: (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
      <TrophyIcon {...props} />
    ),
    number: '25+',
    description: 'Finalistas de Hackatones',
  },
  {
    icon: (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
      <TestTubeDiagonalIcon {...props} />
    ),
    number: '150+',
    description: 'Proyectos construidos',
  },
]
