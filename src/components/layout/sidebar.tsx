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
  category?: string
}

const MENU_ITEMS: MenuItemType[] = [
  // Regular user items
  { displayText: 'dashboard', href: '/dashboard', isMobileOnly: false },
  { displayText: 'profile', href: '/profile', isMobileOnly: false },

  // Admin - Overview
  {
    displayText: 'dashboard',
    href: '/admin',
    isMobileOnly: false,
    adminOnly: true,
    category: 'overview',
  },

  // Admin - User Management
  {
    displayText: 'users',
    href: '/admin/users',
    isMobileOnly: false,
    adminOnly: true,
    category: 'user management',
  },
  {
    displayText: 'pending users',
    href: '/admin/pending-users',
    isMobileOnly: false,
    adminOnly: true,
    category: 'user management',
  },
  {
    displayText: 'applications',
    href: '/admin/applications',
    isMobileOnly: false,
    adminOnly: true,
    category: 'user management',
  },

  // Admin - Program Management
  {
    displayText: 'programs',
    href: '/admin/programs',
    isMobileOnly: false,
    adminOnly: true,
    category: 'program management',
  },
  {
    displayText: 'sessions',
    href: '/admin/sessions',
    isMobileOnly: false,
    adminOnly: true,
    category: 'program management',
  },

  // Admin - Content Management
  {
    displayText: 'activities',
    href: '/admin/activities',
    isMobileOnly: false,
    adminOnly: true,
    category: 'content management',
  },
  {
    displayText: 'submissions',
    href: '/admin/submissions',
    isMobileOnly: false,
    adminOnly: true,
    category: 'content management',
  },
  {
    displayText: 'events',
    href: '/admin/events',
    isMobileOnly: false,
    adminOnly: true,
    category: 'content management',
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

  // Group items by category for admin users
  const groupedItems: { category: string; items: MenuItemType[] }[] = []
  let currentCategory = ''
  let currentGroup: MenuItemType[] = []

  visibleItems.forEach((item) => {
    if (item.category && item.category !== currentCategory) {
      if (currentGroup.length > 0) {
        groupedItems.push({ category: currentCategory, items: currentGroup })
      }
      currentCategory = item.category
      currentGroup = [item]
    } else if (item.category) {
      currentGroup.push(item)
    } else {
      // Non-categorized items (regular user items)
      if (currentGroup.length > 0) {
        groupedItems.push({ category: currentCategory, items: currentGroup })
        currentGroup = []
        currentCategory = ''
      }
      groupedItems.push({ category: '', items: [item] })
    }
  })

  // Add the last group if it exists
  if (currentGroup.length > 0) {
    groupedItems.push({ category: currentCategory, items: currentGroup })
  }

  return (
    <aside className="hidden w-64 shrink-0 pl-4 sm:pl-6 lg:block lg:pl-8">
      <div className="sticky">
        <Card>
          <CardContent className="space-y-1">
            {groupedItems.map((group, groupIndex) => (
              <div key={`group-${groupIndex}`}>
                {group.category && (
                  <div className="px-3 pt-4 pb-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground/70">
                      {group.category}
                    </p>
                  </div>
                )}
                {group.items.map((sidebarItem, index) => (
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
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}
