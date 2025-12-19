import Image from 'next/image'
import { SparkleIcon } from 'lucide-react'

const phases = [
  {
    phase: '1. Metas',
    title: 'Te ayudamos a definir lo que lograrás en 30 días',
    duration: '4 días',
    description:
      'Conoce a tu mentor y recibe una ruta de crecimiento personalizada',
    mascot: '/images/fruits/avocado.svg',
  },
  {
    phase: '2. Fundamentos',
    title: 'Encuentra un problema y descubre tus herramientas',
    duration: '10 días',
    description: 'Aprende a construir soluciones tecnológicas con IA',
    mascot: '/images/fruits/cherries.svg',
  },
  {
    phase: '3. Retos',
    title: 'Prueba tu aprendizaje y gana tu primer recompensa',
    duration: '7 días',
    description: 'Resuelve retos y demuestra tu capacidad de ejecución',
    mascot: '/images/fruits/platano.svg',
  },
  {
    phase: '4. Prácticas',
    title: 'Trabaja en proyectos prácticos y gana dinero',
    duration: '7 días',
    description: 'Aplica tus conocimientos para contribuir a proyectos activos',
    mascot: '/images/fruits/manzana.svg',
  },
]

export default function JourneyPage() {
  return (
    <section className="page py-12">
      <div className="container items-center gap-y-12">
        <div className="space-y-4 text-center">
          <h2 className="text-4xl font-bold md:text-5xl">
            Tu camino al <span className="text-primary">Éxito</span>
            <br />
            en cuatro simples <span className="text-secondary">Etapas</span>
          </h2>
          <p className="text-2xl text-muted">
            Una metodología probada que transforma talento en impacto
            <br />
            en solo{' '}
            <span className="font-semibold underline decoration-secondary decoration-2 underline-offset-4">
              1 mes
            </span>
          </p>
        </div>
        <div className="flex w-full justify-start px-4 md:max-w-lg lg:-ml-12 lg:max-w-xl">
          <div className="relative">
            {/* Línea vertical */}
            <div className="absolute top-0 left-1/3 h-full w-[2px] -translate-x-1/3 bg-foreground" />

            {/* Fases */}
            <div className="space-y-8">
              {phases.map((phase, index) => (
                <div
                  key={index}
                  className="relative flex items-center gap-8 md:gap-12"
                >
                  {/* Línea y punto */}
                  <div className="absolute top-1/2 left-1/3 flex -translate-x-1/3 -translate-y-1/2 items-center justify-center">
                    <SparkleIcon className="mr-2 h-5 w-5 fill-foreground text-foreground" />
                  </div>

                  {/* Mascota */}
                  <div className="flex w-1/3 justify-end">
                    <div className="relative h-24 w-24">
                      <Image
                        src={phase.mascot}
                        alt=""
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="w-2/3 pl-2">
                    <div className="flex items-center justify-between gap-x-2">
                      <div className="text-2xl font-medium text-primary">
                        {phase.phase}
                      </div>
                      <div className="text-base text-muted">
                        {phase.duration}
                      </div>
                    </div>
                    <div className="font-funnel text-xl font-medium">
                      {phase.title}
                    </div>
                    <div className="text-base text-muted">
                      {phase.description}
                    </div>
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
