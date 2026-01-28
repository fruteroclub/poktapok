'use client'

import { useState } from 'react'
import { useApplications, useApplicationStats } from '@/hooks/use-admin'
import { ApplicationsTable } from '@/components/admin/applications-table'
import { ApplicationDetailDrawer } from '@/components/admin/application-detail-drawer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, CheckCircle, XCircle, FileText } from 'lucide-react'

export default function ApplicationsQueuePage() {
  const [statusFilter, setStatusFilter] = useState<
    'pending' | 'approved' | 'rejected' | 'all'
  >('pending')
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null)

  const { data, isLoading } = useApplications({
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  const { data: stats, isLoading: statsLoading } = useApplicationStats()

  return (
    <div className="page-content">
      {/* Header */}
      <div className="admin-header-section">
        <div>
          <h1 className="text-3xl font-bold">Applications Queue</h1>
          <p className="text-muted-foreground">
            Review and process program applications
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.byStatus.pending || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.byStatus.approved || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.byStatus.rejected || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="w-full">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Applications</CardTitle>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(
                    value as 'pending' | 'approved' | 'rejected' | 'all',
                  )
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Applications</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ApplicationsTable
              applications={data?.applications || []}
              isLoading={isLoading}
              onSelectApplication={setSelectedApplicationId}
            />
          </CardContent>
        </Card>
      </div>

      {/* Application Detail Drawer */}
      {selectedApplicationId && (
        <ApplicationDetailDrawer
          applicationId={selectedApplicationId}
          open={!!selectedApplicationId}
          onClose={() => setSelectedApplicationId(null)}
        />
      )}
    </div>
  )
}
