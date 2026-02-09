'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import { useAuthWithConvex } from '@/hooks/use-auth-with-convex'
import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle, Rocket, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import PageWrapper from '@/components/layout/page-wrapper'
import { Section } from '@/components/layout/section'

export default function JoinBootcampPage() {
  const params = useParams()
  const router = useRouter()
  const code = (params.code as string)?.toUpperCase()
  
  const { user, convexUser, isLoading: authLoading } = useAuthWithConvex()
  const { login, ready: privyReady, authenticated } = usePrivy()
  const enrollmentData = useQuery(
    api.bootcamp.getEnrollmentByCode,
    code ? { code } : 'skip'
  )
  const joinWithCode = useMutation(api.bootcamp.joinWithCode)
  
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Auto-join when user is logged in and enrollment is valid
  useEffect(() => {
    if (convexUser && enrollmentData?.enrollment && !enrollmentData.enrollment.userId && !joining && !success) {
      handleJoin()
    }
  }, [convexUser, enrollmentData])

  const handleJoin = async () => {
    if (!convexUser?._id) return
    
    setJoining(true)
    setError(null)
    
    try {
      await joinWithCode({
        code,
        userId: convexUser._id,
      })
      
      setSuccess(true)
      
      // Redirect to bootcamp dashboard after 2 seconds
      setTimeout(() => {
        router.push('/bootcamp/vibecoding')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Error al unirse al bootcamp')
    } finally {
      setJoining(false)
    }
  }

  // No code provided
  if (!code) {
    return (
      <PageWrapper>
        <div className="page">
          <div className="page-content">
            <Section className="flex justify-center py-20">
              <Card className="w-full max-w-md text-center">
                <CardHeader>
                  <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                  <CardTitle>Código no proporcionado</CardTitle>
                  <CardDescription>
                    Necesitas un código de inscripción para acceder.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline">
                    <Link href="/">Volver al inicio</Link>
                  </Button>
                </CardContent>
              </Card>
            </Section>
          </div>
        </div>
      </PageWrapper>
    )
  }

  // Loading state
  if (enrollmentData === undefined) {
    return (
      <PageWrapper>
        <div className="page">
          <div className="page-content">
            <Section className="flex justify-center py-20">
              <Card className="w-full max-w-md">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Verificando código...</p>
                    <code className="text-xs text-muted-foreground">{code}</code>
                  </div>
                </CardContent>
              </Card>
            </Section>
          </div>
        </div>
      </PageWrapper>
    )
  }

  // Invalid code
  if (!enrollmentData) {
    return (
      <PageWrapper>
        <div className="page">
          <div className="page-content">
            <Section className="flex justify-center py-20">
              <Card className="w-full max-w-md text-center">
                <CardHeader>
                  <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                  <CardTitle>Código inválido</CardTitle>
                  <CardDescription>
                    El código <code className="bg-muted px-2 py-1 rounded">{code}</code> no existe o ya expiró.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline">
                    <Link href="/">Volver al inicio</Link>
                  </Button>
                </CardContent>
              </Card>
            </Section>
          </div>
        </div>
      </PageWrapper>
    )
  }

  const { enrollment, program } = enrollmentData

  // Code already used by someone else
  if (enrollment.userId && !success) {
    // Check if it's the current user
    if (convexUser && enrollment.userId === convexUser._id) {
      return (
        <PageWrapper>
          <div className="page">
            <div className="page-content">
              <Section className="flex justify-center py-20">
                <Card className="w-full max-w-md text-center">
                  <CardHeader>
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <CardTitle>¡Ya estás inscrito!</CardTitle>
                    <CardDescription>
                      Ya tienes acceso a {program?.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild>
                      <Link href="/bootcamp/vibecoding">Ir al Bootcamp</Link>
                    </Button>
                  </CardContent>
                </Card>
              </Section>
            </div>
          </div>
        </PageWrapper>
      )
    }

    return (
      <PageWrapper>
        <div className="page">
          <div className="page-content">
            <Section className="flex justify-center py-20">
              <Card className="w-full max-w-md text-center">
                <CardHeader>
                  <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                  <CardTitle>Código ya utilizado</CardTitle>
                  <CardDescription>
                    Este código ya fue usado por otra persona.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline">
                    <Link href="/">Volver al inicio</Link>
                  </Button>
                </CardContent>
              </Card>
            </Section>
          </div>
        </div>
      </PageWrapper>
    )
  }

  // Success state
  if (success) {
    return (
      <PageWrapper>
        <div className="page">
          <div className="page-content">
            <Section className="flex justify-center py-20">
              <Card className="w-full max-w-md text-center">
                <CardHeader>
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <CardTitle>¡Bienvenido al bootcamp!</CardTitle>
                  <CardDescription>
                    Te has inscrito exitosamente a {program?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Redirigiendo al dashboard...
                  </p>
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </CardContent>
              </Card>
            </Section>
          </div>
        </div>
      </PageWrapper>
    )
  }

  // Not logged in - show login prompt
  if (!authenticated || !convexUser) {
    return (
      <PageWrapper>
        <div className="page">
          <div className="page-content">
            <Section className="flex justify-center py-20">
              <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                  <Rocket className="h-16 w-16 text-primary mx-auto mb-4" />
                  <CardTitle>{program?.name}</CardTitle>
                  <CardDescription>
                    {program?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Código de inscripción</p>
                    <code className="text-2xl font-mono font-bold text-primary">{code}</code>
                  </div>
                  
                  <p className="text-center text-sm text-muted-foreground">
                    Inicia sesión para activar tu lugar en el bootcamp
                  </p>

                  {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center">
                      {error}
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => login()}
                    disabled={!privyReady}
                  >
                    {!privyReady ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Iniciar sesión
                  </Button>
                </CardContent>
              </Card>
            </Section>
          </div>
        </div>
      </PageWrapper>
    )
  }

  // Logged in, ready to join (auto-join should trigger)
  return (
    <PageWrapper>
      <div className="page">
        <div className="page-content">
          <Section className="flex justify-center py-20">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <Rocket className="h-16 w-16 text-primary mx-auto mb-4" />
                <CardTitle>{program?.name}</CardTitle>
                <CardDescription>
                  {program?.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Código de inscripción</p>
                  <code className="text-2xl font-mono font-bold text-primary">{code}</code>
                </div>

                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Conectado como</p>
                  <p className="font-semibold">{user?.username || user?.email || 'Usuario'}</p>
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center">
                    {error}
                  </div>
                )}

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleJoin}
                  disabled={joining}
                >
                  {joining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Activando...
                    </>
                  ) : (
                    '🚀 Activar mi lugar'
                  )}
                </Button>
              </CardContent>
            </Card>
          </Section>
        </div>
      </div>
    </PageWrapper>
  )
}
