'use client'

/**
 * MentorshipContent - Client component for mentorship hub placeholder
 * Coming soon page with feature highlights
 */

import { Users, Target, Rocket, Calendar, MessageCircle, TrendingUp } from 'lucide-react'
import PageWrapper from '@/components/layout/page-wrapper'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function MentorshipContent() {
  return (
    <PageWrapper>
      <div className="space-y-16">
        {/* Hero Section */}
        <div className="text-center">
          <Badge variant="secondary" className="mb-4">
            Próximamente
          </Badge>
          <h1 className="text-5xl font-bold">Programa de Mentoría</h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-muted-foreground">
            Acelera tu carrera en Web3 con mentoría personalizada de profesionales experimentados
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <Users className="size-12 text-primary" />
            <h3 className="mt-4 text-xl font-semibold">Mentores Expertos</h3>
            <p className="mt-2 text-muted-foreground">
              Conéctate con desarrolladores Web3 senior y líderes de la industria
            </p>
          </Card>

          <Card className="p-6">
            <Target className="size-12 text-primary" />
            <h3 className="mt-4 text-xl font-semibold">Planes Personalizados</h3>
            <p className="mt-2 text-muted-foreground">
              Recibe un roadmap adaptado a tus metas y nivel de experiencia
            </p>
          </Card>

          <Card className="p-6">
            <Rocket className="size-12 text-primary" />
            <h3 className="mt-4 text-xl font-semibold">Proyectos Reales</h3>
            <p className="mt-2 text-muted-foreground">
              Trabaja en proyectos del mundo real con feedback constante
            </p>
          </Card>

          <Card className="p-6">
            <Calendar className="size-12 text-primary" />
            <h3 className="mt-4 text-xl font-semibold">Sesiones 1-on-1</h3>
            <p className="mt-2 text-muted-foreground">
              Reuniones regulares para revisar progreso y resolver dudas
            </p>
          </Card>

          <Card className="p-6">
            <MessageCircle className="size-12 text-primary" />
            <h3 className="mt-4 text-xl font-semibold">Soporte Continuo</h3>
            <p className="mt-2 text-muted-foreground">
              Acceso a canal privado de Slack con tu mentor
            </p>
          </Card>

          <Card className="p-6">
            <TrendingUp className="size-12 text-primary" />
            <h3 className="mt-4 text-xl font-semibold">Desarrollo de Carrera</h3>
            <p className="mt-2 text-muted-foreground">
              Estrategias para conseguir tu primer trabajo en Web3
            </p>
          </Card>
        </div>

        {/* How It Works */}
        <div>
          <h2 className="text-center text-3xl font-bold">¿Cómo funciona?</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="mt-4 text-xl font-semibold">Aplica al Programa</h3>
              <p className="mt-2 text-muted-foreground">
                Completa tu perfil y cuéntanos sobre tus metas en Web3
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="mt-4 text-xl font-semibold">Match con Mentor</h3>
              <p className="mt-2 text-muted-foreground">
                Te conectamos con el mentor perfecto para tu perfil
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="mt-4 text-xl font-semibold">Comienza a Aprender</h3>
              <p className="mt-2 text-muted-foreground">
                Inicia tu viaje con sesiones semanales y proyectos guiados
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Lanzamiento en Q2 2026</h2>
            <p className="mt-2 text-muted-foreground">
              Estamos preparando el programa de mentoría más completo para desarrolladores Web3 en
              Latinoamérica
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" disabled>
                Notificarme cuando esté disponible
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="mailto:contact@fruteroclub.com">Contáctanos</a>
              </Button>
            </div>
          </div>
        </Card>

        {/* FAQ Placeholder */}
        <div>
          <h2 className="text-center text-3xl font-bold">Preguntas Frecuentes</h2>
          <div className="mx-auto mt-8 max-w-3xl space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold">¿Cuánto cuesta el programa de mentoría?</h3>
              <p className="mt-2 text-muted-foreground">
                Los detalles de pricing se anunciarán al momento del lanzamiento. Habrá opciones
                gratuitas para miembros activos de la comunidad.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold">¿Cuánto dura el programa?</h3>
              <p className="mt-2 text-muted-foreground">
                El programa estándar es de 3 meses, con opción de extender según tus necesidades y progreso.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold">¿Qué requisitos necesito?</h3>
              <p className="mt-2 text-muted-foreground">
                Conocimientos básicos de programación. El programa se adapta a tu nivel, desde
                principiante hasta avanzado.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
