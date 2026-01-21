import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import Link from 'next/link'

export default function ProjectsV2Section() {
  const projects = [
    {
      name: 'EVVM',
      description: 'Despliega blockchains virtuales en cualquier red',
      category: 'Infraestructura',
    },
    {
      name: 'ChipiPay',
      description: 'Infraestructura financiera en minutos',
      category: 'Infraestructura',
    },
    {
      name: 'Regen Tips',
      description: 'Reputación onchain',
      category: 'Identidad',
    },
    {
      name: 'Pistachio',
      description: 'Ingresos pasivos hechos fácil',
      category: 'Finanzas',
    },
    {
      name: 'LaDAO',
      description: 'Creadores de $XOC - Moneda Estable Mexicana)',
      category: 'Finanzas',
    },
    {
      name: 'Kairos Research',
      description: 'Investigación en Finanzas Descentralizadas',
      category: 'Consultoría',
    },
  ]

  return (
    <section id="projects-section" className="page bg-muted py-16">
      <div className="page-content">
        <div className="mx-auto max-w-6xl space-y-12">
          {/* Headline */}
          <div className="space-y-4 text-center">
            <h2 className="text-4xl font-medium text-primary md:text-5xl">
              Startups que salieron de aquí
            </h2>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-2 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <Card
                key={index}
              >
                <CardHeader>
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                  <div className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {project.category}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="flex justify-center">
            <Button size="lg" variant="outline" className="text-white" asChild>
              <Link href="/directory">Ver todos los proyectos →</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
