'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useAuth } from '@/hooks/use-auth'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Loader2, Check, X, ArrowLeft } from 'lucide-react'
import PageWrapper from '@/components/layout/page-wrapper'
import { Section } from '@/components/layout/section'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import Link from 'next/link'
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

export default function AdminApplicationsPage() {
  const router = useRouter()
  const { user: privyUser } = usePrivy()
  const { user, isLoading: authLoading } = useAuth()
  const [selectedApp, setSelectedApp] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)

  const applications = useQuery(api.applications.listPending)
  const approveMutation = useMutation(api.applications.approve)
  const rejectMutation = useMutation(api.applications.reject)
  
  const privyDid = privyUser?.id

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/')
    }
  }, [user, authLoading, router])

  const handleApprove = async (applicationId: string) => {
    if (!privyDid) return
    try {
      await approveMutation({ 
        applicationId: applicationId as any,
        reviewerPrivyDid: privyDid,
      })
      toast.success('Usuario aprobado')
      setSelectedApp(null)
      setActionType(null)
    } catch (error) {
      console.error('Error approving:', error)
      toast.error('Error al aprobar')
    }
  }

  const handleReject = async (applicationId: string) => {
    if (!privyDid) return
    try {
      await rejectMutation({ 
        applicationId: applicationId as any,
        reviewerPrivyDid: privyDid,
      })
      toast.success('Solicitud rechazada')
      setSelectedApp(null)
      setActionType(null)
    } catch (error) {
      console.error('Error rejecting:', error)
      toast.error('Error al rechazar')
    }
  }

  if (authLoading || applications === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  const pendingApps = applications?.pendingUsers || []

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
                    Aplicaciones Pendientes
                  </h1>
                  <p className="text-muted-foreground">
                    {pendingApps.length} solicitud{pendingApps.length !== 1 ? 'es' : ''} por revisar
                  </p>
                </div>
              </div>
            </div>
          </Section>

          <Section>
            {pendingApps.length > 0 ? (
              <div className="w-full space-y-4">
                {pendingApps.map((app) => (
                  <Card key={app._id} className="w-full">
                    <CardContent className="pt-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={app.user?.avatarUrl || undefined} />
                            <AvatarFallback>
                              {app.user?.displayName?.[0] || app.user?.username?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {app.user?.displayName || app.user?.username}
                              </h3>
                              <Badge variant="secondary">
                                @{app.user?.username}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {app.user?.email}
                            </p>
                            {app.goal && (
                              <div className="mt-2">
                                <p className="text-sm font-medium">Meta:</p>
                                <p className="text-sm text-muted-foreground">
                                  {app.goal}
                                </p>
                              </div>
                            )}
                            {app.motivationText && (
                              <div className="mt-2">
                                <p className="text-sm font-medium">Motivación:</p>
                                <p className="text-sm text-muted-foreground">
                                  {app.motivationText}
                                </p>
                              </div>
                            )}
                            <div className="mt-2 flex flex-wrap gap-2">
                              {app.githubUsername && (
                                <Badge variant="outline">
                                  GitHub: {app.githubUsername}
                                </Badge>
                              )}
                              {app.twitterUsername && (
                                <Badge variant="outline">
                                  Twitter: {app.twitterUsername}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Aplicó: {new Date(app._creationTime).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 sm:flex-col">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedApp(app._id)
                              setActionType('approve')
                            }}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedApp(app._id)
                              setActionType('reject')
                            }}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Rechazar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="w-full">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No hay aplicaciones pendientes 🎉
                  </p>
                </CardContent>
              </Card>
            )}
          </Section>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedApp && !!actionType} onOpenChange={() => {
        setSelectedApp(null)
        setActionType(null)
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? '¿Aprobar usuario?' : '¿Rechazar solicitud?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve'
                ? 'El usuario podrá acceder a la plataforma y aparecerá en el directorio.'
                : 'La solicitud será rechazada y el usuario no podrá acceder.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedApp && actionType === 'approve') {
                  handleApprove(selectedApp)
                } else if (selectedApp && actionType === 'reject') {
                  handleReject(selectedApp)
                }
              }}
              className={actionType === 'reject' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {actionType === 'approve' ? 'Aprobar' : 'Rechazar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  )
}
