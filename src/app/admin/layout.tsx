import type { Metadata } from 'next'
import PageWrapper from '@/components/layout/page-wrapper'
import Sidebar from '@/components/layout/sidebar'

export const metadata: Metadata = {
  title: 'Admin Dashboard | Frutero Club',
  description:
    'Admin panel for managing users, applications, and platform content',
}

/**
 * Admin Layout
 *
 * Wraps all admin pages with:
 * - PageWrapper (Navbar + Footer)
 * - Sidebar (left column)
 * - Content area (right column)
 *
 * All admin pages should return only their content without PageWrapper or Sidebar.
 *
 * Used for: All pages in src/app/admin/*
 */
export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <PageWrapper>
      <div className="page">
        <div className="flex w-full">
          <Sidebar />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </PageWrapper>
  )
}
