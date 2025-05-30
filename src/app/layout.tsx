import type { Metadata } from 'next'
import { cn } from '@/lib/utils'

import { Raleway, Space_Grotesk as SpaceGrotesk } from 'next/font/google'
import OnchainProvider from '@/providers/onchain-provider'

import '@/styles/globals.css'
import { Toaster } from '@/components/ui/sonner'

const fontSans = Raleway({
  subsets: ['latin'],
  variable: '--font-sans',
})

const fontGrotesk = SpaceGrotesk({
  subsets: ['latin'],
  variable: '--font-grotesk',
})

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
          fontSans.variable,
          fontGrotesk.variable,
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
