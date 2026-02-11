'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { SparkleIcon, SparklesIcon } from 'lucide-react'
import AuthButtonPrivy from '../buttons/auth-button-convex'

export default function FooterSection() {
  return (
    <div className="page-content">
      <div className="page">
        <div className="w-full space-y-4 rounded-xl bg-primary px-8 py-12 text-center text-white md:max-w-lg lg:max-w-2xl md:py-16">
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
            <AuthButtonPrivy
              size="lg"
              className="text-2xl font-medium flex w-full items-center gap-x-1 rounded-full bg-white px-8 py-4 text-foreground hover:bg-muted hover:text-background md:w-1/2"
            >
              Únete
              <SparklesIcon className="h-5 w-5 fill-primary text-primary" />
            </AuthButtonPrivy>
          </div>
        </div>
      </div>
    </div>
  )
}
