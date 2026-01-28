'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePendingUsers } from '@/hooks/use-admin'

/**
 * Admin Dashboard Home Page
 *
 * Overview page with:
 * - Quick stats (pending users, active users, etc.)
 * - Quick action links
 * - Recent activity feed (future)
 */
export default function AdminHomePage() {
  const router = useRouter()
  const { data: authData, isLoading: authLoading } = useAuth()
  const { data: pendingData, isLoading: pendingLoading } = usePendingUsers()

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && authData) {
      if (authData.user?.role !== 'admin') {
        router.push('/dashboard')
      }
    }
  }, [authData, authLoading, router])

  // Loading state
  if (authLoading || pendingLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Not authenticated or not admin - will redirect
  if (!authData || authData.user?.role !== 'admin') {
    return null
  }

  const pendingCount = pendingData?.pendingUsers?.length || 0

  return (
    <div className="page-content">
      {/* Header */}
      <div className="admin-header-section">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, activities, and platform content
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145</div>
            <p className="text-xs text-muted-foreground">
              Total active members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Active activities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Pending review</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => router.push('/admin/pending-users')}
          >
            Review Pending Users
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => router.push('/admin/submissions')}
          >
            Review Submissions
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => router.push('/admin/activities')}
          >
            Manage Activities
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
