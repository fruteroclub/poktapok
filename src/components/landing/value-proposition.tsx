import React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '../ui/button'
import { SparkleIcon } from 'lucide-react'

export default function ValueProposition() {
  return (
    <section className="page container w-full gap-y-6 lg:grid lg:grid-cols-12 lg:px-20 xl:max-w-screen-lg py-12">
      <div className="py-4 md:flex md:flex-col md:items-center lg:col-span-7">
        <Card className='bg-transparent border-none shadow-none gap-y-2 py-2 md:pb-4 md:max-w-md'>
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl font-funnel font-semibold">
              Hackear:
            </CardTitle>
            <CardDescription className="ml-6">
              (Verbo) Del inglés <span className="mr-0.5 italic">to hack</span> y -ear.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex-col text-left">
              <p className="text-xl px-2">
                Rechazar las limitaciones impuestas y crear nuestras propias reglas
              </p>
            </div>
          </CardContent>
          <CardFooter className='flex justify-center pt-6 pb-4'>
            <Button variant='secondary' size='lg'>El Manifiesto Frutero</Button>
          </CardFooter>
        </Card>
        <div className='px-4 md:text-justify md:max-w-md md:px-0 lg:px-6'>
          <p className="text-xl">
            Somos una comunidad unida por una convicción poderosa: transformar el talento excepcional en profesionales de élite que darán forma al futuro
          </p>
        </div>
      </div>
      <div className='w-full px-4 md:flex md:flex-col md:items-center lg:col-span-5 lg:px-0'>
        <Card className=' text-background md:max-w-md md:w-full py-8'>
          <CardHeader className='text-center'>
            <CardTitle className="font-funnel text-2xl font-normal">
              ¿Quieres dar el<br /><span className='underline underline-offset-8 decoration-primary'>siguiente</span> paso?
            </CardTitle>
          </CardHeader>
          <CardContent className="w-full flex justify-center md:py-2">
            <ul className="list-disc list-inside marker:text-muted space-y-2 text-lg">
              <li className="px-2 flex items-center">
                <SparkleIcon className='text-secondary mr-2 h-4 w-4' /> Conseguir trabajo
              </li>
              <li className="px-2 flex items-center">
                <SparkleIcon className='text-secondary mr-2 h-4 w-4' /> Lanzar tu startup
              </li>
              <li className="px-2 flex items-center">
                <SparkleIcon className='text-secondary mr-2 h-4 w-4' /> Crear tu propio negocio
              </li>
            </ul>
          </CardContent>
          <CardFooter className='flex justify-center text-center'>
            <h4 className='text-2xl md:text-3xl'>
              <span className='text-primary font-bold'>Frutero Club</span><br />es lo que buscas
            </h4>
          </CardFooter>
        </Card>
      </div>
    </section>
  )
}