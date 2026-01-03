'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks'
import { Card, CardContent } from '@/components/ui/card'

export type MenuItemType = {
  displayText: string
  href: string
  isMobileOnly: boolean
  adminOnly?: boolean
}

const MENU_ITEMS: MenuItemType[] = [
  // Regular user items
  { displayText: 'dashboard', href: '/dashboard', isMobileOnly: false },
  { displayText: 'profile', href: '/profile', isMobileOnly: false },

  // Admin items (conditional rendering)
  {
    displayText: 'admin home',
    href: '/admin',
    isMobileOnly: false,
    adminOnly: true,
  },
  {
    displayText: 'pending users',
    href: '/admin/pending-users',
    isMobileOnly: false,
    adminOnly: true,
  },
  {
    displayText: 'users management',
    href: '/admin/users',
    isMobileOnly: false,
    adminOnly: true,
  },
  {
    displayText: 'activities',
    href: '/admin/activities',
    isMobileOnly: false,
    adminOnly: true,
  },
  {
    displayText: 'submissions',
    href: '/admin/submissions',
    isMobileOnly: false,
    adminOnly: true,
  },
]

const visiblePathnames = ['/profile']

export default function Sidebar() {
  const { data: authData } = useAuth()
  const isSignedIn = authData?.isAuthenticated
  const isAdmin = authData?.user?.role === 'admin'
  const pathname = usePathname()

  const isPathVisible =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    visiblePathnames.includes(pathname)

  if (!isSignedIn || !isPathVisible) {
    return null
  }

  // Filter menu items based on admin status
  const visibleItems = MENU_ITEMS.filter((item) => !item.adminOnly || isAdmin)

  return (
    <aside className="hidden w-64 shrink-0 pl-4 sm:pl-6 lg:block lg:pl-8">
      <div className="sticky">
        <Card>
          <CardContent className="space-y-1">
            {visibleItems.map((sidebarItem, index) => (
              <Link
                key={`sidebar-${sidebarItem.displayText}-${index}`}
                href={sidebarItem.href}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                  pathname === sidebarItem.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {sidebarItem.displayText}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}
