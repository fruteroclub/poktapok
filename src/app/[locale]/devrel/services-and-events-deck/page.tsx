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
        ? 'DevRel Services & Events | Frutero'
        : 'DevRel Services & Events | Frutero',
    description:
      locale === 'es'
        ? 'DevRel-as-a-Service para protocolos Web3'
        : 'DevRel-as-a-Service for Web3 protocols',
    openGraph: {
      title: 'Frutero DevRel Services',
      description:
        locale === 'es'
          ? 'DevRel-as-a-Service para protocolos Web3'
          : 'DevRel-as-a-Service for Web3 protocols',
      type: 'website',
    },
  }
}

export default async function DevRelServicesDeckPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <DeckPlaceholder
      titleKey="decks.devrelDeck.title"
      subtitleKey="decks.devrelDeck.subtitle"
    />
  )
}
