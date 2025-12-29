import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { SparkleIcon, Sparkles, TrendingUp } from 'lucide-react'
import AuthButtonPrivy from '../buttons/auth-button-privy'

export default function DifferentiatorSection() {
  return (
    <section className="page bg-card/30 py-12 md:py-16 lg:py-20">
      <div className="page-content">
        <div className="section">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Left Column - Why Frutero & Why Now */}
            <div className="space-y-8 lg:col-span-7">
              {/* Why Frutero */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-4 ring-primary/20">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground">
                    Único en Latam
                  </h3>
                </div>

                <div className="rounded-2xl border-2 border-border bg-background p-6 shadow-lg md:p-8">
                  <p className="text-lg leading-relaxed text-foreground md:text-xl">
                    Único programa donde tu progreso{' '}
                    <span className="font-semibold text-primary">
                      recompensa a la comunidad
                    </span>
                    . Cuando alcanzas un hito, tu mentor gana. Cuando completas
                    un proyecto, la comunidad celebra.
                  </p>
                </div>
              </div>

              {/* Why Now */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 ring-4 ring-secondary/20">
                    <TrendingUp className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground">
                    El momento es hoy
                  </h3>
                </div>

                <div className="rounded-2xl border-2 border-border bg-background p-6 shadow-lg md:p-8">
                  <p className="text-lg leading-relaxed text-foreground md:text-xl">
                    Democratizamos el acceso a IA y Cripto para preparar al
                    talento LATAM ante la{' '}
                    <span className="font-semibold text-secondary">
                      mayor ola de innovación tecnológica
                    </span>{' '}
                    de nuestra generación. El futuro necesita builders, no
                    espectadores.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Value Proposition Card */}
            <div className="flex h-full flex-col items-start justify-center space-y-4 lg:col-span-5">
              <div className="flex w-full items-center">
                <h3 className="w-full text-center text-2xl font-medium text-foreground">
                  No pierdas más tiempo
                </h3>
              </div>
              <Card className="w-full max-w-md py-8 text-background bg-muted">
                <CardHeader className="text-center">
                  <CardTitle className="font-funnel text-2xl font-normal md:text-3xl">
                    Atrévete a dar el
                    <br />
                    <span className="underline decoration-primary underline-offset-8">
                      siguiente
                    </span>{' '}
                    paso
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex w-full justify-center py-2 md:py-4">
                  <ul className="space-y-2 text-lg">
                    <li className="flex items-center px-2">
                      <SparkleIcon className="mr-2 h-4 w-4 text-secondary" />{' '}
                      Consigue trabajo
                    </li>
                    <li className="flex items-center px-2">
                      <SparkleIcon className="mr-2 h-4 w-4 text-secondary" />{' '}
                      Lanza tu startup
                    </li>
                    <li className="flex items-center px-2">
                      <SparkleIcon className="mr-2 h-4 w-4 text-secondary" />{' '}
                      Genera ingresos
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="flex flex-col items-center justify-center gap-y-4 text-center">
                  <h4 className="text-2xl md:text-3xl">
                    <span className="font-bold text-primary">Frutero Club</span>
                    <br />
                    es lo que buscas
                  </h4>
                  <AuthButtonPrivy
                    size="lg"
                    className="text-2xl font-medium lg:px-12 lg:py-4 lg:text-xl"
                  >
                    Únete ahora
                  </AuthButtonPrivy>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
