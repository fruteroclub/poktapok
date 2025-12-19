import { SparkleIcon } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function PulpaSection() {
  return (
    <div className="page py-12">
      <div className="container gap-y-6 lg:gap-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-3xl text-foreground md:text-4xl font-normal">
            <span className="text-primary font-bold">$PULPA</span><br />
            Tu reputación tiene{' '}
            <span className="underline underline-offset-4 decoration-secondary decoration-4">valor</span>
          </h2>
          <p className="max-w-2xl text-xl text-muted">
            El token que convierte tus contribuciones en oportunidades
          </p>
        </div>

        {/* Mobile (sm) viewport */}
        <div className="flex md:hidden w-full flex-col items-center">
          <div className="w-full flex justify-center">
            <Image
              src="/images/fruits/pulpa.svg"
              alt="PULPA"
              width={100}
              height={100}
              className="w-full max-w-xs"
            />
          </div>
          <div className="flex flex-col items-start gap-2">
            <div className="text-left">
              <h3 className="text-2xl font-bold text-primary flex items-center gap-2">
                <SparkleIcon className="fill-primary h-5 w-5" />
                Gana $PULPA
              </h3>
              <p className="text-muted text-lg">
                Por contribuir, enseñar y <br />
                ayudar a la comunidad
              </p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-2xl font-bold text-primary flex items-center gap-2">
                <SparkleIcon className="fill-primary h-5 w-5" />
                Crea reputación
              </h3>
              <div>
                <p className="text-muted text-lg text-left">
                  + $PULPA <br />
                  + Beneficios <br />
                  + Reconocimiento <br />
                </p>
              </div>
            </div>
            <div className="flex flex-col">
              <h3 className="text-2xl font-bold text-primary flex items-center gap-2">
                <SparkleIcon className="fill-primary h-5 w-5" />
                Cuentas Premium
              </h3>
              <p className="text-muted text-lg">
                Acceso gratuito a Cursor, Claude<br /> y otras herramientas
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary flex items-center gap-2">
                <SparkleIcon className="fill-primary h-5 w-5" />
                Recompensas
              </h3>
              <p className="text-muted text-lg">
                Prioridad para eventos,<br /> hacker houses y
                oportunidades
              </p>
            </div>
          </div>
        </div>

        {/* md+ viewport */}
        <div className="hidden md:flex w-full max-w-6xl lg:max-w-screen-lg flex-col gap-2">
          <div className="-mb-4 lg:-mb-6 flex w-full items-center justify-center">
            <div className="w-1/4">
              <h3 className="text-xl font-bold text-primary">
                Gana $PULPA
              </h3>
              <p className="text-muted">
                Por contribuir, enseñar y <br />
                ayudar a la comunidad
              </p>
            </div>
          </div>
          <div className="flex w-full flex-row gap-2">
            <div className="flex w-[28.75%] lg:w-[33%] xl:w-[35%] items-center justify-end">
              <div className="lg:w-3/5">
                <h3 className="text-xl font-bold text-primary">
                  Crea reputación
                </h3>
                <p className="text-muted">
                  + $PULPA <br />
                  + Beneficios <br />
                  + Reconocimiento <br />
                </p>
              </div>
            </div>
            <div className="w-[42.5%] lg:w-[34%] xl:w-[30%]">
              <Image
                src="/images/fruits/pulpa.svg"
                alt="PULPA"
                width={100}
                height={100}
                className="w-full"
              />
            </div>
            <div className="flex w-[28.75%] lg:w-[33%] xl:w-[35%] items-center justify-start">
              <div className="lg:w-3/5">
                <h3 className="text-xl font-bold text-primary">
                  Cuentas Premium
                </h3>
                <p className="text-muted">
                  Acceso gratuito a Cursor, Claude y otras herramientas
                </p>
              </div>
            </div>
          </div>
          <div className="-mt-4 lg:-mt-6 col-span-3 flex items-center justify-center">
            <div className="w-1/4">
              <h3 className="text-xl font-bold text-primary">
                Recompensas
              </h3>
              <p className="text-muted">
                Prioridad para eventos, hacker houses y
                oportunidades
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-6 lg:pt-8">
          <Button size="lg" variant="secondary">
            ¡Quiero $PULPA!
          </Button>
        </div>

        {/* CTA */}
        {/* <div className="mt-20 ">
          <div className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-r from-primary to-secondary p-8 text-white md:p-12">
            <h3 className="mb-4 text-2xl font-bold md:text-3xl">
              ¿Listo para empezar a ganar $PULPA?
            </h3>
            <p className="mx-auto mb-6 max-w-2xl text-white/90">
              Únete a la comunidad y comienza a construir tu reputación mientras
              ayudas a otros
            </p>
            <button className="transform rounded-full bg-white px-8 py-4 font-bold text-foreground shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-100">
              Comenzar a ganar $PULPA 🚀
            </button>
          </div>
        </div> */}

        {/* Info adicional */}
        {/* <div className="mx-auto mt-16 max-w-4xl rounded-2xl bg-background/50 p-8">
          <div className="grid gap-6  md:grid-cols-3">
            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                <span className="text-2xl">🏆</span>
              </div>
              <h4 className="mb-2 font-bold text-foreground">
                Rangos Exclusivos
              </h4>
              <p className="text-sm text-muted">
                Desbloquea rangos especiales según tu $PULPA
              </p>
            </div>

            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="mb-2 font-bold text-foreground">
                Misiones Semanales
              </h4>
              <p className="text-sm text-muted">
                Completa misiones y gana $PULPA extra
              </p>
            </div>

            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <span className="text-2xl">🌟</span>
              </div>
              <h4 className="mb-2 font-bold text-foreground">Leaderboard</h4>
              <p className="text-sm text-muted">
                Compite con otros miembros por el top
              </p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  )
}
