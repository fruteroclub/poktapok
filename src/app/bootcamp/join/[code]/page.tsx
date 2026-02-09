'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import { useAuthWithConvex } from '@/hooks/use-auth-with-convex'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle, Rocket, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function JoinBootcampPage() {
  const params = useParams()
  const router = useRouter()
  const code = (params.code as string)?.toUpperCase()
  
  const { user, convexUser, isLoading: authLoading, handleLogin } = useAuthWithConvex()
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
      const result = await joinWithCode({
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

  // Debug
  console.log('🔍 Join page debug:', {
    code,
    authLoading,
    enrollmentData,
    user: user?.username,
    convexUser: convexUser?._id,
  })

  // No code provided
  if (!code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
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
      </div>
    )
  }

  // Loading state - only show if actually loading
  if (enrollmentData === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Verificando código...</p>
              <p className="text-xs text-muted-foreground">Código: {code}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Invalid code
  if (!enrollmentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <CardTitle>Código inválido</CardTitle>
            <CardDescription>
              El código <code className="bg-muted px-2 py-1 rounded">{code}</code> no existe o ya expiró.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild variant="outline">
              <Link href="/">Volver al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { enrollment, program } = enrollmentData

  // Code already used
  if (enrollment.userId && !success) {
    // Check if it's the current user
    if (convexUser && enrollment.userId === convexUser._id) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle>¡Ya estás inscrito!</CardTitle>
              <CardDescription>
                Ya tienes acceso a {program?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link href="/bootcamp/vibecoding">Ir al Bootcamp</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <CardTitle>Código ya utilizado</CardTitle>
            <CardDescription>
              Este código ya fue usado por otra persona.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild variant="outline">
              <Link href="/">Volver al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle>¡Bienvenido al bootcamp!</CardTitle>
            <CardDescription>
              Te has inscrito exitosamente a {program?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Redirigiendo al dashboard...
            </p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Not logged in - show login prompt
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Rocket className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle>{program?.name}</CardTitle>
            <CardDescription>
              {program?.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
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
              onClick={() => handleLogin()}
            >
              Iniciar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Logged in, ready to join
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Rocket className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle>{program?.name}</CardTitle>
          <CardDescription>
            {program?.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Código de inscripción</p>
            <code className="text-2xl font-mono font-bold text-primary">{code}</code>
          </div>

          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Conectado como</p>
            <p className="font-semibold">{user.username || user.email || 'Usuario'}</p>
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
    </div>
  )
}
