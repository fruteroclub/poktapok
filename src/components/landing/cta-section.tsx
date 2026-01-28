import { Button } from '@/components/ui/button'

export default function CTASection() {
  return (
    <section className="bg-linear-to-r from-primary via-secondary to-accent py-20">
      <div className="page-content mx-auto px-4">
        <div className="text-center text-white">
          <div className="mb-8">
            <div className="mb-6 flex justify-center space-x-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <span className="text-2xl">🥑</span>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <span className="text-2xl">🚀</span>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <span className="text-2xl">💡</span>
              </div>
            </div>
          </div>

          <h2 className="mb-6 text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
            ¡Tu journey comienza{' '}
            <span className="underline decoration-white/50">ahora</span>!
          </h2>

          <p className="mx-auto mb-8 max-w-3xl text-xl opacity-90 md:text-2xl">
            Únete a los 200+ builders que ya están transformando sus ideas en
            startups exitosas
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="transform rounded-full bg-white px-8 py-4 text-lg font-bold text-foreground shadow-lg transition-all duration-200 hover:scale-105 hover:bg-white/90"
            >
              Unirme al Club 🎯
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="transform rounded-full border-white px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-white/10"
            >
              Saber más 📚
            </Button>
          </div>

          <div className="mt-12 opacity-80">
            <p className="text-sm">
              ✨ Proceso de aplicación simple • 🎁 Primeros 30 días gratis • 🔒
              Comunidad exclusiva
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
