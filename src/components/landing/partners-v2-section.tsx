export default function PartnersV2Section() {
  const partners = [
    'Base',
    'Monad',
    'Solana',
    'Polygon',
    'Scroll',
    'ETHGlobal',
    'BuidlGuidl',
    'The Graph',
  ]

  return (
    <section id="partners-section" className="page py-12 md:py-16">
      <div className="page-content">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Headline */}
          <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
            Con quiénes construimos
          </h2>

          {/* Partners Grid */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="flex h-16 min-w-[120px] items-center justify-center rounded-lg border-2 border-border bg-background px-6 text-xl font-semibold text-foreground shadow-sm transition-all hover:scale-110 hover:border-primary/50"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
