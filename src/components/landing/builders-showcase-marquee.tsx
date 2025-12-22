'use client'

import { useState } from 'react'
import { ChevronsDownIcon, PiggyBank, RocketIcon, Target } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Marquee } from '@/components/ui/marquee'
import { Button } from '../ui/button'

interface Builder {
  id: string
  name: string
  avatar: string
  track: 'Impact Startup' | 'Elite Career' | 'Strategic Freelancer'
  earnings: number
  project: {
    name: string
    stage: 'IDEA' | 'PROTOTYPE' | 'BUILD' | 'PROJECT'
  }
  stats: {
    questsCompleted: number
    projectsBuilt: number
  }
  bio: string
}

const builders: Builder[] = [
  {
    id: '1',
    name: 'María González',
    avatar: '/images/avatars/placeholder-1.jpg',
    track: 'Impact Startup',
    earnings: 95,
    project: {
      name: 'AgriTech Platform',
      stage: 'PROJECT',
    },
    stats: {
      questsCompleted: 12,
      projectsBuilt: 3,
    },
    bio: 'Construyendo soluciones para agricultores locales',
  },
  {
    id: '2',
    name: 'Carlos Mendoza',
    avatar: '/images/avatars/placeholder-2.jpg',
    track: 'Elite Career',
    earnings: 73,
    project: {
      name: 'DeFi Analytics Tool',
      stage: 'BUILD',
    },
    stats: {
      questsCompleted: 8,
      projectsBuilt: 2,
    },
    bio: 'De junior developer a posición senior en 6 meses',
  },
  {
    id: '3',
    name: 'Ana Rodríguez',
    avatar: '/images/avatars/placeholder-3.jpg',
    track: 'Strategic Freelancer',
    earnings: 88,
    project: {
      name: 'Client Portal',
      stage: 'PROJECT',
    },
    stats: {
      questsCompleted: 15,
      projectsBuilt: 5,
    },
    bio: 'Freelancer full-time con clientes de 3 continentes',
  },
  {
    id: '7',
    name: 'Valentina Cruz',
    avatar: '/images/avatars/placeholder-7.jpg',
    track: 'Impact Startup',
    earnings: 100,
    project: {
      name: 'HealthConnect',
      stage: 'PROJECT',
    },
    stats: {
      questsCompleted: 14,
      projectsBuilt: 3,
    },
    bio: 'Conectando pacientes con profesionales de salud',
  },
  {
    id: '6',
    name: 'Luis Ramírez',
    avatar: '/images/avatars/placeholder-6.jpg',
    track: 'Strategic Freelancer',
    earnings: 82,
    project: {
      name: 'E-commerce Suite',
      stage: 'PROJECT',
    },
    stats: {
      questsCompleted: 11,
      projectsBuilt: 4,
    },
    bio: 'Especialista en Shopify y custom solutions',
  },
  {
    id: '4',
    name: 'Diego Silva',
    avatar: '/images/avatars/placeholder-4.jpg',
    track: 'Impact Startup',
    earnings: 67,
    project: {
      name: 'EduChain',
      stage: 'BUILD',
    },
    stats: {
      questsCompleted: 10,
      projectsBuilt: 2,
    },
    bio: 'Democratizando la educación con blockchain',
  },
]

const getTrackColor = (track: Builder['track']) => {
  switch (track) {
    case 'Impact Startup':
      return 'bg-secondary text-white'
    case 'Elite Career':
      return 'bg-primary text-white'
    case 'Strategic Freelancer':
      return 'bg-accent text-foreground'
  }
}

const getStageLabel = (stage: Builder['project']['stage']) => {
  switch (stage) {
    case 'IDEA':
      return '💡 Idea'
    case 'PROTOTYPE':
      return '🔧 Prototipo'
    case 'BUILD':
      return '🏗️ En construcción'
    case 'PROJECT':
      return '🚀 Lanzado'
  }
}

export default function BuildersShowcaseMarquee() {
  const [selectedBuilder, setSelectedBuilder] = useState<Builder | null>(null)

  const scrollToNextSection = () => {
    const nextSection = document.getElementById('pain-points-section')
    if (nextSection) {
      const navbarHeight = 80 // Approximate navbar height in pixels
      const elementPosition = nextSection.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Marquee Showcase */}
        <div className="relative mx-auto w-full">
          {/* Left fade overlay */}
          <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-20 bg-gradient-to-r from-background to-transparent md:w-32" />

          {/* Right fade overlay */}
          <div className="pointer-events-none absolute top-0 right-0 z-10 h-full w-20 bg-gradient-to-l from-background to-transparent md:w-32" />

          <Marquee pauseOnHover className="[--duration:60s] [--gap:1rem]">
            {builders.map((builder) => (
              <div
                key={builder.id}
                onClick={() => setSelectedBuilder(builder)}
                className="group relative w-64 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 border-muted-foreground bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-md"
              >
                {/* Top section: Avatar + Name/Track + Earnings */}
                <div className="flex items-center gap-3 p-4">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full  ring-1 ring-border">
                    <div className="flex h-full items-center justify-center text-xl font-bold text-foreground">
                      {builder.name.charAt(0)}
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden text-left">
                    <div className="truncate text-base font-semibold text-foreground">
                      {builder.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {builder.track}
                    </div>
                  </div>
                </div>

                {/* Bottom section: Stats */}
                <div className="flex items-center justify-around border-border bg-card/50 px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="font-funnel text-base font-semibold text-foreground">
                      {builder.stats.questsCompleted}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RocketIcon className="h-4 w-4 text-primary" />
                    <span className="font-funnel text-base font-semibold text-foreground">
                      {builder.stats.projectsBuilt}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <PiggyBank className="h-4 w-4 text-primary" />
                    <span className="font-funnel text-base font-semibold text-foreground">
                      ${builder.earnings}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </Marquee>
        </div>
        <div className="flex flex-col items-center gap-0">
          <h3 className="text-center text-xl font-medium text-foreground md:text-2xl">
            Gente como tú ya está ganando
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="link"
              size="lg"
              onClick={scrollToNextSection}
              className="text-xl font-medium text-secondary md:text-2xl"
            >
              Descubre cómo
              <ChevronsDownIcon className="h-6 w-6 text-secondary" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog for expanded view */}
      <Dialog
        open={selectedBuilder !== null}
        onOpenChange={(open) => !open && setSelectedBuilder(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="relative h-16 w-16 overflow-hidden rounded-full  ring-2 ring-primary/20">
                <div className="flex h-full items-center justify-center text-2xl font-bold text-foreground">
                  {selectedBuilder?.name.charAt(0)}
                </div>
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  {selectedBuilder?.name}
                </div>
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${selectedBuilder && getTrackColor(selectedBuilder.track)}`}
                >
                  {selectedBuilder?.track}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedBuilder && (
            <div className="space-y-4">
              <p className="text-sm text-foreground/70">
                {selectedBuilder.bio}
              </p>

              <div className="rounded-lg bg-card p-3">
                <div className="text-xs text-muted">Proyecto actual</div>
                <div className="font-medium text-foreground">
                  {selectedBuilder.project.name}
                </div>
                <div className="text-xs text-muted">
                  {getStageLabel(selectedBuilder.project.stage)}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">
                    ${selectedBuilder.earnings}
                  </div>
                  <div className="text-sm text-muted">ganados en total</div>
                </div>
                <div className="flex items-center justify-around rounded-lg bg-card p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-semibold text-foreground">
                        {selectedBuilder.stats.questsCompleted}
                      </div>
                      <div className="text-xs text-muted">Quests</div>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <RocketIcon className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-semibold text-foreground">
                        {selectedBuilder.stats.projectsBuilt}
                      </div>
                      <div className="text-xs text-muted">Proyectos</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
