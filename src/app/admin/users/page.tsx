'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useAuth } from '@/hooks/use-auth'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Loader2, ArrowLeft, Shield, ShieldOff, UserX, UserCheck } from 'lucide-react'
import PageWrapper from '@/components/layout/page-wrapper'
import { Section } from '@/components/layout/section'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type UserAction = {
  userId: string
  action: 'makeAdmin' | 'removeAdmin' | 'suspend' | 'activate'
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { user: privyUser } = usePrivy()
  const { user, isLoading: authLoading } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [pendingAction, setPendingAction] = useState<UserAction | null>(null)

  const users = useQuery(api.users.list)
  const updateRoleMutation = useMutation(api.users.updateRole)
  const updateStatusMutation = useMutation(api.users.updateStatus)

  const privyDid = privyUser?.id

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/')
    }
  }, [user, authLoading, router])

  const handleAction = async () => {
    if (!pendingAction || !privyDid) return

    try {
      const { userId, action } = pendingAction

      switch (action) {
        case 'makeAdmin':
          await updateRoleMutation({ userId: userId as any, role: 'admin' })
          toast.success('Usuario promovido a admin')
          break
        case 'removeAdmin':
          await updateRoleMutation({ userId: userId as any, role: 'member' })
          toast.success('Permisos de admin removidos')
          break
        case 'suspend':
          await updateStatusMutation({ userId: userId as any, accountStatus: 'suspended' })
          toast.success('Usuario suspendido')
          break
        case 'activate':
          await updateStatusMutation({ userId: userId as any, accountStatus: 'active' })
          toast.success('Usuario activado')
          break
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al realizar la acción')
    } finally {
      setPendingAction(null)
    }
  }

  if (authLoading || users === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  // Filter users
  const filteredUsers = (users || []).filter((u) => {
    // Search filter
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      !searchQuery ||
      u.username?.toLowerCase().includes(query) ||
      u.displayName?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query)

    // Status filter
    const matchesStatus =
      statusFilter === 'all' || u.accountStatus === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Activo</Badge>
      case 'pending':
        return <Badge variant="secondary">Pendiente</Badge>
      case 'suspended':
        return <Badge variant="destructive">Suspendido</Badge>
      case 'incomplete':
        return <Badge variant="outline">Incompleto</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'makeAdmin':
        return '¿Hacer admin a este usuario?'
      case 'removeAdmin':
        return '¿Quitar permisos de admin?'
      case 'suspend':
        return '¿Suspender este usuario?'
      case 'activate':
        return '¿Activar este usuario?'
      default:
        return '¿Confirmar acción?'
    }
  }

  return (
    <PageWrapper>
      <div className="page">
        <div className="page-content space-y-6">
          <Section>
            <div className="header-section">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/admin">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Gestión de Usuarios
                  </h1>
                  <p className="text-muted-foreground">
                    {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </Section>

          {/* Filters */}
          <Section>
            <div className="flex w-full flex-col gap-4 sm:flex-row">
              <Input
                placeholder="Buscar por nombre, username o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="suspended">Suspendidos</SelectItem>
                  <SelectItem value="incomplete">Incompletos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Section>

          {/* Users List */}
          <Section>
            {filteredUsers.length > 0 ? (
              <div className="w-full space-y-4">
                {filteredUsers.map((u) => (
                  <Card key={u._id} className="w-full">
                    <CardContent className="pt-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={u.avatarUrl || undefined} />
                            <AvatarFallback>
                              {u.displayName?.[0] || u.username?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold">
                                {u.displayName || u.username}
                              </h3>
                              <Badge variant="outline">@{u.username}</Badge>
                              {u.role === 'admin' && (
                                <Badge className="bg-purple-500">Admin</Badge>
                              )}
                              {getStatusBadge(u.accountStatus)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {u.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Creado: {new Date(u._creationTime).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Actions - don't show for current user */}
                        {u._id !== user.id && (
                          <div className="flex flex-wrap gap-2">
                            {u.role !== 'admin' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setPendingAction({ userId: u._id, action: 'makeAdmin' })
                                }
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Hacer Admin
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setPendingAction({ userId: u._id, action: 'removeAdmin' })
                                }
                              >
                                <ShieldOff className="mr-2 h-4 w-4" />
                                Quitar Admin
                              </Button>
                            )}

                            {u.accountStatus !== 'suspended' ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  setPendingAction({ userId: u._id, action: 'suspend' })
                                }
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Suspender
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() =>
                                  setPendingAction({ userId: u._id, action: 'activate' })
                                }
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activar
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="w-full">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No se encontraron usuarios
                  </p>
                </CardContent>
              </Card>
            )}
          </Section>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!pendingAction} onOpenChange={() => setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction && getActionLabel(pendingAction.action)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción se puede revertir más tarde.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  )
}
