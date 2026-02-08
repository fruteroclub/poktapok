'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import MobileMenu from './mobile-menu'
import AuthButton from '../buttons/auth-button-convex'
import { SparkleIcon, SparklesIcon } from 'lucide-react'
import { useAuth } from '@/hooks'
import MobileMenuDropdown from './mobile-menu-dropdown'
import { usePrivy } from '@privy-io/react-auth'

export type MenuItemType = {
  displayText: string
  href: string
  isMobileOnly: boolean
  isExternal?: boolean
}

const PUBLIC_MENU_ITEMS: MenuItemType[] = [
  {
    displayText: 'club',
    href: '/club',
    isMobileOnly: false,
  },
  {
    displayText: 'eventos',
    href: '/club/eventos',
    isMobileOnly: false,
  },
  {
    displayText: 'bounties',
    href: '/bounties',
    isMobileOnly: false,
  },
  {
    displayText: 'leaderboard',
    href: '/club/leaderboard',
    isMobileOnly: false,
  },
]

const AUTH_MENU_ITEMS: MenuItemType[] = [
  {
    displayText: 'portfolio',
    href: '/portfolio',
    isMobileOnly: false,
  },
]

export default function Navbar() {
  const pathname = usePathname()
  const { ready, authenticated } = usePrivy()
  const { user, isAuthenticated, isLoading: isLoadingAuth } = useAuth()
  const isSignedIn = isAuthenticated && authenticated
  const isLoading = isLoadingAuth

  return (
    <header className="sticky top-0 z-40 h-24 w-full bg-background">
      <div className="mx-auto flex h-full w-full max-w-3xl items-center justify-between p-4 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-5 lg:px-8">
        <div className="col-span-1">
          <Link className="flex w-36 items-center" href="/">
            <Image
              src="/images/logos/frutero.svg"
              alt="Frutero logo"
              width={128}
              height={128}
              className="-mt-1 w-full transition duration-300 ease-in-out hover:scale-105"
            />
            <span className="sr-only">Frutero Club</span>
          </Link>
        </div>

        <div className="z-10 col-span-3 flex items-center justify-center">
          <nav className="hidden gap-4 lg:flex">
            {[...PUBLIC_MENU_ITEMS, ...(isSignedIn ? AUTH_MENU_ITEMS : [])].filter((menuItem) => {
              // Filter out mobile-only items
              if (menuItem.isMobileOnly) return false
              return true
            }).map((menuItem, index) => (
              <Link
                key={`${menuItem.displayText}-menuItem-${index}`}
                className={`inline-flex items-center justify-center px-4 py-2 font-funnel text-xl font-medium text-foreground transition-colors hover:text-primary focus:text-primary focus:outline-none ${pathname === menuItem.href &&
                  'pointer-events-none underline decoration-primary decoration-2 underline-offset-[6px] hover:text-foreground!'
                  }`}
                href={menuItem.href}
                target={menuItem.isExternal ? '_blank' : ''}
              >
                {menuItem.displayText}
              </Link>
            ))}
          </nav>
        </div>

        <div className="col-span-1 flex justify-end">
          {!ready || isLoading ? (
            // Placeholder maintains layout space during initialization
            <div className="h-10 w-32" />
          ) : isSignedIn && user ? (
            <MobileMenuDropdown ready={ready} user={user} />
          ) : (
            <AuthButton size="lg" className="hidden lg:flex">
              Únete
              <SparklesIcon className="ml-2 h-4 w-4 fill-background" />
            </AuthButton>
          )}
          <MobileMenu menuItems={[...PUBLIC_MENU_ITEMS, ...(isSignedIn ? AUTH_MENU_ITEMS : [])]} pathname={pathname} />
        </div>
      </div>
    </header>
  )
}
