import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import Link from 'next/link'

export default function ProjectsV2Section() {
  const projects = [
    {
      name: 'EVVM / ROLL-A-MATE',
      description: 'ETHGlobal Waterloo Finalist → Top Sponsor',
      category: 'Hackathon Winner',
    },
    {
      name: 'CHIPIPAY',
      description: 'Pagos crypto simplificados',
      category: 'Fintech',
    },
    {
      name: 'REGEN TIPS',
      description: 'Reputación onchain',
      category: 'Web3 Identity',
    },
    {
      name: 'TROOPS',
      description: 'Community infra',
      category: 'DAO Tooling',
    },
    {
      name: 'LaDAO',
      description: 'Creadores de $XOC (stablecoin mexicana)',
      category: 'DeFi',
    },
    {
      name: 'KAIROS RESEARCH',
      description: 'Crypto research',
      category: 'Analytics',
    },
  ]

  return (
    <section id="projects-section" className="page bg-gradient-to-b from-card/30 to-card/50 py-16 md:py-24">
      <div className="page-content">
        <div className="mx-auto max-w-6xl space-y-12">
          {/* Headline */}
          <div className="space-y-4 text-center">
            <h2 className="text-4xl font-bold text-foreground md:text-5xl">
              Startups que salieron de aquí
            </h2>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <Card
                key={index}
                className="border-2 border-border transition-all hover:scale-105 hover:border-primary/50 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {project.category}
                  </div>
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                  <CardDescription className="text-base">
                    {project.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="flex justify-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/directory">Ver todos los proyectos →</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
