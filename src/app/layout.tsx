import type { Metadata } from 'next'
import { cn } from '@/lib/utils'

import OnchainProvider from '@/providers/onchain-provider'

import '@/styles/globals.css'
import { Toaster } from '@/components/ui/sonner'
import { fonts } from '@/lib/fonts'

export const metadata: Metadata = {
  title: 'frutero club',
  description: 'crea tu app en 6 semanas',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fonts.funnelDisplay.variable,
          fonts.ledger.variable,
          fonts.raleway.variable,
          fonts.spaceGrotesk.variable,
        )}
      >
        <OnchainProvider>
          {children}
          <Toaster richColors />
        </OnchainProvider>
      </body>
    </html>
  )
}
