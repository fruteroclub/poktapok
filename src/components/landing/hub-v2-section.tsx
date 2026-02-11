import { Button } from '../ui/button'
import { Calendar, Coffee, MessageSquare, Wrench } from 'lucide-react'
import Link from 'next/link'
import HubCarousel from './hub-carousel'
import { Section } from '../layout/section'

export default function HubV2Section() {
  const activities = [
    { icon: Calendar, label: 'Coworking semanal', color: 'bg-primary' },
    { icon: MessageSquare, label: 'Meetups abiertos', color: 'bg-accent' },
    { icon: Wrench, label: 'Workshops técnicos', color: 'bg-secondary' },
    { icon: Coffee, label: 'Office hours', color: 'bg-zinc-700' },
  ]

  return (
    <section id="hub-section" className="page bg-primary py-20 md:py-28">
      <div className="page-content">
        <div className="mx-auto max-w-5xl space-y-16 md:flex md:flex-col md:items-center">
          {/* Mobile/Tablet: Headline then Carousel */}
          <div className="flex flex-col gap-8 lg:hidden md:max-w-lg">
            {/* Headline */}
            <div id="hub-headline" className="space-y-6 text-center">
              <div className="space-y-2">
                <h2><span className="font-medium inline-block -rotate-2 transform rounded-lg bg-zinc-900 px-4 py-2 text-white shadow-lg">Casa Frutero</span></h2>
                <h3 className="text-3xl font-semibold text-foreground md:text-4xl">
                  Impact Tech Hub
                </h3>
              </div>
              <div className="mx-auto max-w-4xl rounded-2xl bg-white/95 p-6 shadow-lg">
                <p className="text-lg leading-relaxed text-foreground md:text-xl">
                  No existía un lugar en CDMX para incubar ideas. Un espacio donde pudieras llegar con algo roto, trabajar junto a otros hackers, y salir con algo funcionando.
                </p>
                <p className="mt-4 text-xl font-black text-primary md:text-2xl">
                  Lo construimos.
                </p>
              </div>
            </div>

            {/* Carousel */}
            <HubCarousel className="h-64 md:h-96" />
          </div>

          {/* Desktop (lg+): Two column layout - Carousel left, Headline right */}
          <Section className="hidden lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            {/* Left: Carousel */}
            <HubCarousel className="h-[500px]" />

            {/* Right: Headline */}
            <div id="hub-headline" className="space-y-6 text-center">
              <div className="space-y-2">
                <h2 className="lg:text-5xl"><span className="font-medium inline-block -rotate-2 transform rounded-lg bg-zinc-900 px-4 py-2 text-white shadow-lg">Casa Frutero</span></h2>
                <h3 className="text-3xl font-semibold text-foreground lg:text-4xl">
                  Impact Tech Hub
                </h3>
              </div>
              <div className="mx-auto max-w-4xl rounded-2xl bg-white/95 p-6 shadow-lg">
                <p className="text-lg leading-relaxed text-foreground lg:text-xl">
                  No existía un lugar en CDMX para incubar ideas. Un espacio donde pudieras llegar con algo roto, trabajar junto a otros hackers, y salir con algo funcionando.
                </p>
                <p className="mt-4 text-xl font-black text-primary lg:text-2xl">
                  Lo construimos.
                </p>
              </div>
            </div>
          </Section>

          {/* Hub Activities */}
          <Section className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {activities.map((activity, index) => {
              const Icon = activity.icon
              return (
                <div
                  key={index}
                  className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-xl bg-white p-6 text-center h-full"
                >
                  <div className={`absolute inset-0 ${activity.color} opacity-0`}></div>
                  <div className={`rounded-full ${activity.color} p-3`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {activity.label}
                  </p>
                </div>
              )
            })}
          </Section>

          {/* ¿Eres Hacker? Section */}
          <div className="space-y-6 rounded-2xl bg-zinc-900 p-8 md:p-10 shadow-lg">
            <h3 className="text-center text-2xl font-medium text-white md:text-3xl">
              ¿Eres{' '}
              <span className="font-semibold inline-block rotate-1 transform rounded-lg bg-accent px-3 py-1 text-foreground shadow">
                Hacker
              </span> ?
            </h3>
            <p className="text-center text-lg font-medium text-white">
              No hablamos de código. <br />Hablamos de{' '}
              <span className="subrayado">mentalidad.</span>
            </p>
            <div className="mx-auto max-w-3xl space-y-4 text-center">
              <div className="rounded-xl border-2 border-background bg-background p-4 shadow">
                <p className="text-base font-semibold text-foreground">
                  <span className="text-primary">Experimentas.</span> Rompes cosas. Aprendes haciendo.
                </p>
              </div>
              <div className="rounded-xl border-2 border-background bg-background p-4 shadow">
                <p className="text-base font-semibold text-foreground">
                  <span className="text-secondary">Has fallado antes</span> y no te detuviste.
                </p>
              </div>
              <div className="rounded-xl border-2 border-background bg-background p-4 shadow">
                <p className="text-base font-semibold text-foreground">
                  <span className="text-accent">Puedes seguir un tutorial</span> y desplegar algo.
                </p>
              </div>
            </div>
            <p className="text-center text-lg font-semibold text-white">
              Si eso suena a ti, este es tu lugar.
            </p>
            <div className="flex justify-center">
              <Button size="lg" className="bg-accent text-foreground hover:bg-accent/80 font-bold shadow-lg" asChild>
                <Link href="#events-section">Ven al próximo coworking →</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
