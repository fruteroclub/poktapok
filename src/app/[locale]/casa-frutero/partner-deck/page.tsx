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
        ? 'Casa Frutero — Partner Deck | Frutero'
        : 'Casa Frutero — Partner Deck | Frutero',
    description:
      locale === 'es'
        ? 'Únete como socio fundador de Casa Frutero'
        : 'Join as a founding partner of Casa Frutero',
    openGraph: {
      title: 'Casa Frutero — Founding Partner Opportunity',
      description:
        locale === 'es'
          ? 'Únete como socio fundador de Casa Frutero'
          : 'Join as a founding partner of Casa Frutero',
      type: 'website',
    },
  }
}

export default async function PartnerDeckPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <DeckPlaceholder
      titleKey="decks.partnerDeck.title"
      subtitleKey="decks.partnerDeck.subtitle"
    />
  )
}
