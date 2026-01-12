'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUsers } from '@/hooks/use-user-management'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Loader2,
  MoreVertical,
  Users as UsersIcon,
  Filter,
  X,
  Eye,
} from 'lucide-react'
import { AdminRoute } from '@/components/layout/admin-route-wrapper'
import type { User } from '@/services/user-management'

/**
 * Helper function to get Badge variant for user role
 */
function getRoleVariant(
  role: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (role) {
    case 'admin':
      return 'default'
    case 'moderator':
      return 'secondary'
    default:
      return 'outline'
  }
}

/**
 * Helper function to get Badge variant for account status
 */
function getStatusVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active':
      return 'default'
    case 'pending':
      return 'secondary'
    case 'suspended':
    case 'banned':
      return 'destructive'
    default:
      return 'outline'
  }
}

/**
 * User Details Modal Component
 */
interface UserDetailsModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onViewFullProfile: (userId: string) => void
}

function UserDetailsModal({
  user,
  isOpen,
  onClose,
  onViewFullProfile,
}: UserDetailsModalProps) {
  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View detailed information about this user
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback>
                {user.displayName?.charAt(0)?.toUpperCase() ||
                  user.username?.charAt(0)?.toUpperCase() ||
                  '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-lg font-semibold">
                {user.displayName || user.username || 'Anonymous'}
              </div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>

          {/* Role & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Role</Label>
              <div>
                <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <div>
                <Badge variant={getStatusVariant(user.accountStatus)}>
                  {user.accountStatus}
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div>
            <Label className="text-xs text-muted-foreground">Statistics</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-3">
                <div className="text-2xl font-bold">
                  {user.stats.totalEarnings}
                </div>
                <div className="text-xs text-muted-foreground">$PULPA</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-2xl font-bold">
                  {user.stats.submissionsCount}
                </div>
                <div className="text-xs text-muted-foreground">Submissions</div>
              </div>
            </div>
          </div>

          {/* Date Joined */}
          <div>
            <Label className="text-xs text-muted-foreground">Joined</Label>
            <div className="text-sm">
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => onViewFullProfile(user.id)}
              className="flex-1"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Full Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Filter Controls Component
 * Extracted as separate component to avoid React hooks warnings
 */
interface FilterControlsProps {
  search: string
  setSearch: (value: string) => void
  role: string
  setRole: (value: string) => void
  accountStatus: string
  setAccountStatus: (value: string) => void
  setPage: (value: number) => void
  activeFiltersCount: number
}

function FilterControls({
  search,
  setSearch,
  role,
  setRole,
  accountStatus,
  setAccountStatus,
  setPage,
  activeFiltersCount,
}: FilterControlsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Username, email, or name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="w-full space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={role}
            onValueChange={(value) => {
              setRole(value)
              setPage(1)
            }}
          >
            <SelectTrigger id="role" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={accountStatus}
            onValueChange={(value) => {
              setAccountStatus(value)
              setPage(1)
            }}
          >
            <SelectTrigger id="status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            setSearch('')
            setRole('all')
            setAccountStatus('all')
            setPage(1)
          }}
        >
          <X className="mr-2 h-4 w-4" />
          Clear Filters ({activeFiltersCount})
        </Button>
      )}
    </div>
  )
}

/**
 * Admin Users Management Page
 *
 * Lists all users with filters, stats, and actions
 */
function UsersPageContent() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const [accountStatus, setAccountStatus] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const { data, isLoading, error } = useUsers({
    search: search || undefined,
    role: role !== 'all' ? role : undefined,
    accountStatus: accountStatus !== 'all' ? accountStatus : undefined,
    page,
    limit: 24,
  })

  const users = data?.users || []
  const pagination = data?.pagination

  // Calculate stats from filtered data
  const stats = {
    total: pagination?.total || 0,
    active: users.filter((u) => u.accountStatus === 'active').length,
    suspended: users.filter((u) => u.accountStatus === 'suspended').length,
    banned: users.filter((u) => u.accountStatus === 'banned').length,
  }

  // Count active filters
  const activeFiltersCount = [
    search,
    role !== 'all' ? role : null,
    accountStatus !== 'all' ? accountStatus : null,
  ].filter(Boolean).length

  return (
    <div className="page-content">
      {/* Header */}
      <div className="admin-header-section">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Users Management
          </h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
      </div>

      <div className="w-full space-y-2">
        {/* Mobile: Filter Button + Inline Stats */}
        <div className="w-full space-y-2 md:hidden">
          <div className="flex items-center justify-center gap-2">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filter Users</SheetTitle>
                  <SheetDescription>
                    Refine the user list by search, role, and status
                  </SheetDescription>
                </SheetHeader>
                <div className="px-4">
                  <FilterControls
                    search={search}
                    setSearch={setSearch}
                    role={role}
                    setRole={setRole}
                    accountStatus={accountStatus}
                    setAccountStatus={setAccountStatus}
                    setPage={setPage}
                    activeFiltersCount={activeFiltersCount}
                  />
                </div>
              </SheetContent>
            </Sheet>
            <div className="text-sm text-muted-foreground">
              {stats.total} users
            </div>
          </div>

          {/* Mobile: Inline Stats (2 cards) */}
          <div className="grid w-full grid-cols-2 gap-2">
            <Card className="gap-0 py-2">
              <CardHeader className="py-0!">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active}</div>
              </CardContent>
            </Card>
            <Card className="gap-0 py-2">
              <CardHeader className="py-0!">
                <CardTitle className="text-sm font-medium">Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.suspended + stats.banned}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Desktop: Filters + Full Stats */}
        <div className="hidden w-full md:block">
          <div className="grid w-full grid-cols-1 gap-2">
            {/* Desktop Filters Card */}
            <Card className="gap-2 py-4">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <FilterControls
                  search={search}
                  setSearch={setSearch}
                  role={role}
                  setRole={setRole}
                  accountStatus={accountStatus}
                  setAccountStatus={setAccountStatus}
                  setPage={setPage}
                  activeFiltersCount={activeFiltersCount}
                />
              </CardContent>
            </Card>

            {/* Desktop Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="gap-0 py-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <UsersIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card className="gap-0 py-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium">Active</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.active}</div>
                </CardContent>
              </Card>
              <Card className="gap-0 py-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Suspended
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.suspended}</div>
                </CardContent>
              </Card>
              <Card className="gap-0 py-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium">Banned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.banned}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* User Details Modal */}
        <UserDetailsModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedUser(null)
          }}
          onViewFullProfile={(userId) => {
            router.push(`/admin/users/${userId}`)
            setIsModalOpen(false)
          }}
        />

        {/* Loading/Error States */}
        {error ? (
          <Card>
            <CardContent>
              <div className="py-8 text-center text-destructive">
                Failed to load users. Please try again.
              </div>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading users...</span>
              </div>
            </CardContent>
          </Card>
        ) : users.length === 0 ? (
          <Card>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground">
                No users found matching your filters.
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile: Card List */}
            <div className="w-full space-y-2 md:hidden">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      {/* User Info */}
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <Avatar className="h-12 w-12 shrink-0">
                          <AvatarImage src={user.avatarUrl || undefined} />
                          <AvatarFallback>
                            {user.displayName?.charAt(0)?.toUpperCase() ||
                              user.username?.charAt(0)?.toUpperCase() ||
                              '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">
                            {user.displayName || user.username || 'Anonymous'}
                          </div>
                          <div className="truncate text-sm text-muted-foreground">
                            {user.email}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant={getRoleVariant(user.role)}>
                              {user.role}
                            </Badge>
                            <Badge
                              variant={getStatusVariant(user.accountStatus)}
                            >
                              {user.accountStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* View Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setIsModalOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Stats Row */}
                    <div className="flex gap-4 border-t text-sm">
                      <div className="flex-1">
                        <div className="text-muted-foreground">Earnings</div>
                        <div className="font-medium">
                          {user.stats.totalEarnings} $PULPA
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-muted-foreground">Submissions</div>
                        <div className="font-medium">
                          {user.stats.submissionsCount}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop: Table */}
            <Card className="hidden w-full md:block">
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stats</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatarUrl || undefined} />
                              <AvatarFallback>
                                {user.displayName?.charAt(0)?.toUpperCase() ||
                                  user.username?.charAt(0)?.toUpperCase() ||
                                  '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {user.displayName ||
                                  user.username ||
                                  'Anonymous'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(user.accountStatus)}>
                            {user.accountStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{user.stats.totalEarnings} $PULPA</div>
                            <div className="text-muted-foreground">
                              {user.stats.submissionsCount} submissions
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/admin/users/${user.id}`)
                                }
                              >
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pagination */}
            {pagination && pagination.total > pagination.limit && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.page} of{' '}
                  {Math.ceil(pagination.total / pagination.limit)}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={!pagination.hasMore}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function UsersPage() {
  return (
    <AdminRoute>
      <UsersPageContent />
    </AdminRoute>
  )
}
