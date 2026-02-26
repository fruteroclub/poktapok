import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function HeroV2Section() {
  return (
    <section className="page min-h-[85svh] py-20 md:py-28">
      <div className="page-content">
        {/* Badge - Social Proof */}
        <div className="flex justify-center">
          <Badge className="border-2 border-primary bg-primary/10 px-6 py-3 text-base font-bold text-foreground">
            🏆 25+ victorias en hackathons · 6 ganadores ETHDenver &apos;25
          </Badge>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-5xl space-y-10 text-center">
          {/* Headline - Reasonable size with good contrast */}
          <h1 className="text-4xl leading-tight font-black text-foreground md:text-5xl lg:text-6xl">
            El colectivo donde{' '}
            <span className="inline-block -rotate-2 transform rounded-lg bg-accent px-3 py-1 text-foreground shadow-lg">
              LATAM
            </span>{' '}
            <br className="hidden md:block" />
            construye con{' '}
            <span className="inline-block rotate-2 transform rounded-lg bg-muted px-3 py-1 text-background shadow-lg">
              IA
            </span>
          </h1>

          {/* Subheadline - Appropriate size */}
          <p className="mx-auto max-w-3xl text-xl font-medium text-foreground md:text-2xl">
            Hackers, builders y creadores.
            <br />
            <span className="font-black text-primary">Programas, mentores y comunidad.</span>
          </p>

          {/* Tag line in orange box */}
          <div className="mx-auto max-w-md">
            <div className="rounded-xl bg-primary px-6 py-4">
              <p className="text-lg font-bold text-white md:text-xl">
                Certified Fresh, Organic Quality.
              </p>
            </div>
          </div>

          {/* CTAs - Normal size but still prominent */}
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Button size="xl" asChild className="min-w-[250px] bg-muted text-background hover:bg-muted/90 text-lg font-bold shadow-xl">
              <Link href="/onboarding">
                Únete al colectivo
                <Sparkles className="ml-2 h-6 w-6" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild className="min-w-[250px] border-2 border-foreground text-xl font-bold py-7 px-10">
              <Link href="#events-section">Ver próximos eventos →</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}