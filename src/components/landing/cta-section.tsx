import { Button } from '@/components/ui/button'

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary via-secondary to-accent">
      <div className="container mx-auto px-4">
        <div className="text-center text-white">
          <div className="mb-8">
            <div className="flex justify-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🥑</span>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">💡</span>
              </div>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            ¡Tu journey comienza{' '}
            <span className="underline decoration-white/50">ahora</span>!
          </h2>

          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            Únete a los 200+ builders que ya están transformando sus ideas en startups exitosas
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-white text-foreground hover:bg-white/90 px-8 py-4 text-lg font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Unirme al Club 🎯
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Saber más 📚
            </Button>
          </div>

          <div className="mt-12 opacity-80">
            <p className="text-sm">
              ✨ Proceso de aplicación simple • 🎁 Primeros 30 días gratis • 🔒 Comunidad exclusiva
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 