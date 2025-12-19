import { JSX, SVGProps } from 'react'
import StatCard from '@/components/stats/stat-card'
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
      <div className="container gap-y-8">
        <div className="flex flex-col gap-y-4 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            Nuestro <span className="text-primary">impacto</span> en números
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-muted">
            No son promesas, son{' '}
            <span className="font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-2">
              resultados
            </span>{' '}
            de nuestra comunidad
          </p>
        </div>

        <div className="mx-auto grid grid-cols-2 gap-4 md:max-w-xl md:grid-cols-3 lg:max-w-screen-md lg:gap-6">
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
      <CoinsIcon {...props} />
    ),
    number: '$100k+',
    description: 'USD en premios y grants',
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
