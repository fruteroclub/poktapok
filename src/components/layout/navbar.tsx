'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import MobileMenu from './mobile-menu'
import AuthButton from '../buttons/auth-button-dynamic'

export type MenuItemType = {
  displayText: string
  href: string
  isMobileOnly: boolean
  isExternal?: boolean
}

const MENU_ITEMS: MenuItemType[] = [
  {
    displayText: 'club',
    href: '/club',
    isExternal: false,
    isMobileOnly: false,
  },
  {
    displayText: 'ecosistema',
    href: '/ecosistema',
    isExternal: true,
    isMobileOnly: false,
  },
  { displayText: 'recursos', href: '/recursos', isMobileOnly: false },
  { displayText: 'nosotros', href: '/nosotros', isMobileOnly: false },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="top-0 h-20 w-full bg-background">
      <div className="mx-auto flex h-full w-full max-w-3xl items-center justify-between p-4 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-5 lg:px-8">
        <Link className="flex w-24 items-center" href="/">
          <Image
            src="/images/logos/kukulcan-logo-color.png"
            alt="Kukulcan logo"
            width={128}
            height={128}
            className="w-12 transition duration-500 ease-in-out hover:rotate-[-25deg]"
          />
          <span className="sr-only">Dabl Club</span>
        </Link>
        <div className="z-10 col-span-3 flex items-center justify-center">
          <nav className="hidden gap-6 lg:flex">
            {MENU_ITEMS.filter((menuItem) => !menuItem.isMobileOnly).map(
              (menuItem, index) => (
                <Link
                  key={`${menuItem.displayText}-menuItem-${index}`}
                  className={`font-grotesk inline-flex items-center justify-center px-4 py-2 text-lg font-medium text-foreground transition-colors hover:text-primary focus:text-primary focus:outline-none ${
                    pathname === menuItem.href &&
                    'pointer-events-none underline decoration-primary decoration-[1.5px] underline-offset-[6px] hover:!text-foreground'
                  }`}
                  href={menuItem.href}
                  target={menuItem.isExternal ? '_blank' : ''}
                >
                  {menuItem.displayText}
                </Link>
              ),
            )}
          </nav>
        </div>
        <div className="hidden lg:flex lg:justify-end">
          <AuthButton />
        </div>
        <MobileMenu menuItems={MENU_ITEMS} pathname={pathname} />
      </div>
    </header>
  )
}
