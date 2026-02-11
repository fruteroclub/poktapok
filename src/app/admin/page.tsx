'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Loader2, Users, FileCheck, Settings, Coins, GraduationCap } from 'lucide-react'
import PageWrapper from '@/components/layout/page-wrapper'
import { Section } from '@/components/layout/section'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'

export default function AdminPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <PageWrapper>
      <div className="page">
        <div className="page-content space-y-6">
          <Section>
            <div className="header-section">
              <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
              <p className="text-muted-foreground">
                Gestiona usuarios y aplicaciones
              </p>
            </div>
          </Section>

          <Section>
            <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link href="/admin/applications">
                <Card className="cursor-pointer transition-colors hover:bg-accent">
                  <CardHeader>
                    <FileCheck className="h-8 w-8 text-primary" />
                    <CardTitle className="mt-4">Aplicaciones</CardTitle>
                    <CardDescription>
                      Revisar y aprobar solicitudes de nuevos miembros
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/users">
                <Card className="cursor-pointer transition-colors hover:bg-accent">
                  <CardHeader>
                    <Users className="h-8 w-8 text-primary" />
                    <CardTitle className="mt-4">Usuarios</CardTitle>
                    <CardDescription>
                      Gestionar miembros existentes
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/bounties">
                <Card className="cursor-pointer transition-colors hover:bg-accent">
                  <CardHeader>
                    <Coins className="h-8 w-8 text-primary" />
                    <CardTitle className="mt-4">Bounties</CardTitle>
                    <CardDescription>
                      Crear y gestionar bounties, revisar entregas
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/bootcamp">
                <Card className="cursor-pointer transition-colors hover:bg-accent">
                  <CardHeader>
                    <GraduationCap className="h-8 w-8 text-primary" />
                    <CardTitle className="mt-4">Bootcamp</CardTitle>
                    <CardDescription>
                      Gestionar inscripciones y revisar entregables
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/settings">
                <Card className="cursor-pointer transition-colors hover:bg-accent">
                  <CardHeader>
                    <Settings className="h-8 w-8 text-primary" />
                    <CardTitle className="mt-4">Configuración</CardTitle>
                    <CardDescription>
                      Ajustes de la plataforma
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </Section>
        </div>
      </div>
    </PageWrapper>
  )
}
