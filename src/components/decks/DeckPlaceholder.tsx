'use client'

import { useTranslations } from 'next-intl'
import { LocaleSwitcher } from './LocaleSwitcher'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type Props = {
  titleKey: string
  subtitleKey: string
}

export function DeckPlaceholder({ titleKey, subtitleKey }: Props) {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-border/50">
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">{t('common.backToHome')}</span>
        </Link>
        <LocaleSwitcher />
      </header>

      {/* Content */}
      <main className="flex flex-col items-center justify-center px-6 py-24">
        <div className="max-w-2xl text-center space-y-8">
          {/* Logo placeholder */}
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-4xl">🍊</span>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              {t(titleKey)}
            </h1>
            <p className="text-xl text-muted-foreground">{t(subtitleKey)}</p>
          </div>

          {/* Coming soon badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium">
              {t('decks.placeholder.comingSoon')}
            </span>
          </div>

          {/* Description */}
          <p className="text-muted-foreground">
            {t('decks.placeholder.contentInProgress')}
            <br />
            {t('decks.placeholder.checkBack')}
          </p>

          {/* Contact CTA */}
          <div className="pt-8">
            <a
              href="mailto:hello@frutero.club"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              {t('cta.contactUs')}
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 p-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Frutero Club
      </footer>
    </div>
  )
}
