'use client'

import { type Dispatch, type SetStateAction } from 'react'
import { useLogin, useLogout, usePrivy } from '@privy-io/react-auth'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

type AuthButtonProps = {
  children?: React.ReactNode
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon' | null | undefined
  setIsMenuOpen?: Dispatch<SetStateAction<boolean>>
}

/**
 * Auth Button using Convex
 *
 * Handles login/logout with Privy and syncs user to Convex.
 * Replaces the old AuthButton that used API routes.
 */
export default function AuthButtonConvex({
  children,
  className,
  size = 'default',
  setIsMenuOpen,
}: AuthButtonProps) {
  const { ready: isPrivyReady, authenticated, user: privyUser } = usePrivy()
  const router = useRouter()

  // Convex mutations
  const getOrCreateUser = useMutation(api.auth.getOrCreateUser)
  const updateLastLogin = useMutation(api.auth.updateLastLogin)

  // Query current user from Convex (for routing decisions)
  const currentUser = useQuery(
    api.auth.getCurrentUser,
    privyUser?.id ? { privyDid: privyUser.id } : 'skip'
  )

  const { login: loginWithPrivy } = useLogin({
    onComplete: async ({
      user: privyUserData,
      isNewUser,
      wasAlreadyAuthenticated,
      loginMethod,
    }) => {
      console.log('User logged in successfully', privyUserData)
      console.log('Is new user:', isNewUser)
      console.log('Was already authenticated:', wasAlreadyAuthenticated)
      console.log('Login method:', loginMethod)

      // Skip if user was already authenticated (page refresh/navigation)
      if (wasAlreadyAuthenticated) {
        console.log('User was already authenticated, skipping login')
        return
      }

      // Check session storage to prevent duplicate calls
      const sessionKey = `privy_login_processed_${privyUserData.id}`
      if (sessionStorage.getItem(sessionKey)) {
        console.log('Login already processed this session, skipping')
        return
      }

      try {
        // Mark this login as processed
        sessionStorage.setItem(sessionKey, 'true')

        // Get Ethereum embedded wallet address
        const embeddedWallet = privyUserData.linkedAccounts?.find(
          (account) =>
            account.type === 'wallet' &&
            'walletClientType' in account &&
            account.walletClientType === 'privy' &&
            'chainType' in account &&
            account.chainType === 'ethereum',
        )
        const appWallet =
          embeddedWallet && 'address' in embeddedWallet
            ? embeddedWallet.address
            : undefined

        // Get external wallet if connected
        const externalWallet = privyUserData.linkedAccounts?.find(
          (account) =>
            account.type === 'wallet' &&
            'walletClientType' in account &&
            account.walletClientType !== 'privy' &&
            'chainType' in account &&
            account.chainType === 'ethereum',
        )
        const extWallet =
          externalWallet && 'address' in externalWallet
            ? externalWallet.address
            : undefined

        // Get email from Privy
        const userEmail =
          privyUserData.email?.address ||
          privyUserData.google?.email ||
          privyUserData.github?.email ||
          privyUserData.discord?.email ||
          undefined

        // Map Privy's loginMethod to our auth_method enum
        let authMethod: 'email' | 'wallet' | 'social' = 'social'
        if (loginMethod === 'email' || loginMethod === 'sms') {
          authMethod = 'email'
        } else if (loginMethod === 'siwe' || loginMethod === 'siws') {
          authMethod = 'wallet'
        } else {
          authMethod = 'social'
        }

        console.log('Creating/fetching user in Convex...')

        // Create or fetch user from Convex
        const result = await getOrCreateUser({
          privyDid: privyUserData.id,
          email: userEmail,
          appWallet,
          extWallet,
          primaryAuthMethod: authMethod,
          loginMethod: loginMethod ?? undefined,
        })

        // Update last login
        await updateLastLogin({ privyDid: privyUserData.id })

        const user = result.user

        if (!user) {
          throw new Error('Failed to get user data from Convex')
        }

        // Redirect based on account status
        if (user.accountStatus === 'incomplete') {
          router.push('/onboarding')
          toast.success('¡Bienvenido! Completa tu perfil para continuar', {
            id: 'auth-welcome',
          })
        } else if (user.accountStatus === 'pending') {
          router.push('/profile')
          toast.success('Perfil completo. Esperando aprobación', {
            id: 'auth-pending',
          })
        } else if (user.accountStatus === 'active') {
          router.push('/dashboard')
          toast.success('Sesión iniciada correctamente', {
            id: 'auth-success',
          })
        } else {
          toast.error('Cuenta suspendida. Contacta soporte', {
            id: 'auth-suspended',
          })
        }

        setIsMenuOpen?.(false)
      } catch (error) {
        console.error('Error creating/fetching user:', error)
        toast.error('Error al iniciar sesión. Por favor, intenta de nuevo.', {
          id: 'auth-error',
        })
      }
    },
    onError: (error) => {
      console.log('Login failed', error)
      toast.error('Inicio de sesión fallido', {
        id: 'login-failed',
      })
    },
  })

  const { logout: logoutWithPrivy } = useLogout()

  function login() {
    if (!authenticated) {
      loginWithPrivy()
    } else {
      toast.warning('Ya existe una sesión activa', {
        id: 'auth-already-active',
      })
    }
  }

  async function logout() {
    // Clear session storage on logout
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('privy_login_processed_')) {
        sessionStorage.removeItem(key)
      }
    })

    await logoutWithPrivy()
    router.push('/')
    setIsMenuOpen?.(false)
    toast.success('Sesión cerrada correctamente', {
      id: 'auth-logout',
    })
  }

  if (!isPrivyReady) {
    return (
      <Button
        onClick={() => console.log('Privy not ready')}
        size={size}
        className={cn('font-funnel font-medium', className)}
        disabled
      >
        {authenticated ? 'Salir' : children || 'Entrar'}
      </Button>
    )
  }

  return (
    <Button
      onClick={authenticated ? logout : login}
      size={size}
      className={cn('font-funnel font-medium', className)}
    >
      {authenticated ? 'Salir' : children || 'Entrar'}
    </Button>
  )
}
