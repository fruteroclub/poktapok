import React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '../ui/button'
import { SparkleIcon } from 'lucide-react'

export default function ValueProposition() {
  return (
    <section className="page container w-full gap-y-6 py-12 lg:grid lg:grid-cols-12 lg:px-20 xl:max-w-screen-lg">
      <div className="py-4 md:flex md:flex-col md:items-center lg:col-span-7">
        <Card className="gap-y-2 border-none bg-transparent py-2 shadow-none md:max-w-md md:pb-4">
          <CardHeader>
            <CardTitle className="font-funnel text-3xl font-semibold md:text-4xl">
              Hackear:
            </CardTitle>
            <CardDescription className="ml-6">
              (Verbo) Del inglés <span className="mr-0.5 italic">to hack</span>{' '}
              y -ear.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex-col text-left">
              <p className="px-2 text-xl">
                Rechazar las limitaciones impuestas y crear nuestras propias
                reglas
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pt-6 pb-4">
            <Button variant="secondary" size="lg">
              El Manifiesto Frutero
            </Button>
          </CardFooter>
        </Card>
        <div className="px-4 md:max-w-md md:px-0 md:text-justify lg:px-6">
          <p className="text-xl">
            Somos una comunidad unida por una convicción poderosa: transformar
            el talento excepcional en profesionales de élite que darán forma al
            futuro
          </p>
        </div>
      </div>
      <div className="w-full px-4 md:flex md:flex-col md:items-center lg:col-span-5 lg:px-0">
        <Card className="py-8 text-background md:w-full md:max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-funnel text-2xl font-normal">
              ¿Quieres dar el
              <br />
              <span className="underline decoration-primary underline-offset-8">
                siguiente
              </span>{' '}
              paso?
            </CardTitle>
          </CardHeader>
          <CardContent className="flex w-full justify-center md:py-2">
            <ul className="list-inside list-disc space-y-2 text-lg marker:text-muted">
              <li className="flex items-center px-2">
                <SparkleIcon className="mr-2 h-4 w-4 text-secondary" />{' '}
                Conseguir trabajo
              </li>
              <li className="flex items-center px-2">
                <SparkleIcon className="mr-2 h-4 w-4 text-secondary" /> Lanzar
                tu startup
              </li>
              <li className="flex items-center px-2">
                <SparkleIcon className="mr-2 h-4 w-4 text-secondary" /> Crear tu
                propio negocio
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex justify-center text-center">
            <h4 className="text-2xl md:text-3xl">
              <span className="font-bold text-primary">Frutero Club</span>
              <br />
              es lo que buscas
            </h4>
          </CardFooter>
        </Card>
      </div>
    </section>
  )
}
