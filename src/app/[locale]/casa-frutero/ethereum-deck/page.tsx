import { setRequestLocale } from 'next-intl/server'
import { DeckPlaceholder } from '@/components/decks/DeckPlaceholder'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  return {
    title:
      locale === 'es'
        ? 'Casa Frutero — Ethereum Deck | Frutero'
        : 'Casa Frutero — Ethereum Deck | Frutero',
    description:
      locale === 'es'
        ? 'El primer hub permanente de comunidad Ethereum en México'
        : 'The first permanent Ethereum community hub in Mexico',
    openGraph: {
      title: 'Casa Frutero — Ethereum Foundation Partnership',
      description:
        locale === 'es'
          ? 'El primer hub permanente de comunidad Ethereum en México'
          : 'The first permanent Ethereum community hub in Mexico',
      type: 'website',
    },
  }
}

export default async function EthereumDeckPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <DeckPlaceholder
      titleKey="decks.ethereumDeck.title"
      subtitleKey="decks.ethereumDeck.subtitle"
    />
  )
}
