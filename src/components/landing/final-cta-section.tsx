'use client'

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { SparkleIcon } from "lucide-react"

export default function FooterSection() {
  return (
    <div className="page">
      <div className="page-content space-y-6">
        <div className="w-full md:max-w-screen-sm rounded-xl bg-primary px-8 py-12 md:py-16 text-center text-white space-y-4">
          {/* Mascotas */}
          <div className="flex justify-center space-x-8">
            <Image src="/images/fruits/frutas.svg" alt="Las frutas te invitan, únete a Frutero Club" className="w-full md:w-3/4" width={100} height={100} />
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-bold">
              Hackea tu destino
            </h2>
            <p className="text-2xl font-medium">
              Alcanza tu máximo potencial</p>
          </div>

          <div className="flex justify-center">
            <Button size="lg" className="w-full md:w-1/2 bg-white text-foreground hover:bg-muted hover:text-background px-8 py-4 text-lg font-bold rounded-full flex gap-x-2 items-center">
              <SparkleIcon className="text-primary fill-primary w-5 h-5" />
              ¡Únete ya!
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
