'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AuthButtonPrivy from '@/components/buttons/auth-button-privy'
import {
  SparkleIcon,
  Clock,
  UserPlus,
  FileText,
  Rocket,
  Shield,
  Lock,
  Heart,
} from 'lucide-react'

export default function FooterSection() {
  const nextSteps = [
    {
      step: '1',
      title: 'Regístrate',
      desc: 'Crea tu cuenta en 30 segundos',
      icon: UserPlus,
    },
    {
      step: '2',
      title: 'Aplica',
      desc: 'Cuéntanos sobre tus intereses',
      icon: FileText,
    },
    {
      step: '3',
      title: 'Comienza',
      desc: 'Empieza a ganar y aprender',
      icon: Rocket,
    },
  ]

  return (
    <section className="page py-12">
      <div className="page-content gap-y-8">
        {/* Mascotas */}
        <div className="flex justify-center">
          <Image
            src="/images/fruits/frutas.svg"
            alt="Las frutas te invitan, únete a Frutero Club"
            className="w-full md:w-3/4"
            width={100}
            height={100}
            loading="lazy"
          />
        </div>

        {/* Main Heading */}
        <div className="space-y-2 text-center">
          <h2 className="text-4xl font-bold text-foreground md:text-5xl">
            Hackea tu destino
          </h2>
          <p className="text-2xl font-medium text-muted-foreground">
            Alcanza tu máximo potencial
          </p>
        </div>

        {/* CTA Button with Urgency */}
        <div className="flex flex-col items-center gap-4">
          <AuthButtonPrivy
            size="lg"
            className="text-2xl font-medium lg:px-14 lg:py-6"
          >
            Únete a la Comunidad{' '}
            <SparkleIcon className="ml-2 h-5 w-5 fill-background" />
          </AuthButtonPrivy>

          {/* Urgency Message */}
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-secondary" />
            Próxima cohorte inicia el 1 de febrero - Cupos limitados
          </p>
        </div>

        {/* Next Steps */}
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
          {nextSteps.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.step}>
                <CardContent className="space-y-2 pt-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-4">
          <Badge
            variant="secondary"
            className="flex items-center gap-2 text-base"
          >
            <Shield className="h-4 w-4" /> 100% Gratis
          </Badge>
          <Badge
            variant="secondary"
            className="flex items-center gap-2 text-base"
          >
            <Lock className="h-4 w-4" /> Datos seguros
          </Badge>
          <Badge
            variant="secondary"
            className="flex items-center gap-2 text-base"
          >
            <Heart className="h-4 w-4" /> Comunidad inclusiva
          </Badge>
        </div>
      </div>
    </section>
  )
}
