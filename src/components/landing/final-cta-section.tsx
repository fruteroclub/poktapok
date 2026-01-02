'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { SparkleIcon } from 'lucide-react'

export default function FooterSection() {
  return (
    <div className="page">
      <div className="page-content space-y-6">
        <div className="w-full space-y-4 rounded-xl bg-primary px-8 py-12 text-center text-white md:max-w-screen-sm md:py-16">
          {/* Mascotas */}
          <div className="flex justify-center space-x-8">
            <Image
              src="/images/fruits/frutas.svg"
              alt="Las frutas te invitan, únete a Frutero Club"
              className="w-full md:w-3/4"
              width={100}
              height={100}
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-bold">Hackea tu destino</h2>
            <p className="text-2xl font-medium">Alcanza tu máximo potencial</p>
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              className="flex w-full items-center gap-x-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-foreground hover:bg-muted hover:text-background md:w-1/2"
            >
              <SparkleIcon className="h-5 w-5 fill-primary text-primary" />
              ¡Únete ya!
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
