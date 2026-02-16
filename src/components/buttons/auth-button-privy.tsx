'use client'

import { type Dispatch, type SetStateAction } from 'react'
import { useLogin, useLogout, usePrivy } from '@privy-io/react-auth'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth-store'

type AuthButtonProps = {
  children?: React.ReactNode
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon' | null | undefined
  setIsMenuOpen?: Dispatch<SetStateAction<boolean>>
}

export default function AuthButton({
  children,
  className,
  size = 'default',
  setIsMenuOpen,
}: AuthButtonProps) {
  const { ready: isPrivyReady, authenticated } = usePrivy()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { clearAuth } = useAuthStore()

  const { login: loginWithPrivy } = useLogin({
    onComplete: async ({
      user: privyUser,
      isNewUser: _isNewUser,
      wasAlreadyAuthenticated,
      loginMethod,
      loginAccount: _loginAccount,
    }) => {
      // Skip if user was already authenticated (page refresh/navigation)
      if (wasAlreadyAuthenticated) {
        return
      }

      // Check session storage to prevent duplicate calls
      const sessionKey = `privy_login_processed_${privyUser.id}`
      if (sessionStorage.getItem(sessionKey)) {
        return
      }

      try {
        // Mark this login as processed
        sessionStorage.setItem(sessionKey, 'true')
        // Get the Ethereum embedded wallet address (not Solana)
        const embeddedWallet = privyUser.linkedAccounts?.find(
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

        // Get the Ethereum embedded wallet address (not Solana)
        const externalWallet = privyUser.linkedAccounts?.find(
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

        // Try to get email from Privy (optional - will be collected in onboarding if missing)
        const userEmail =
          privyUser.email?.address ||
          privyUser.google?.email ||
          privyUser.github?.email ||
          privyUser.discord?.email ||
          null

        // Map Privy's loginMethod to our auth_method enum
        // Privy returns: email, sms, siwe (wallet), google, github, discord, twitter, etc.
        // Our enum: email, wallet, social
        let authMethod: 'email' | 'wallet' | 'social' = 'social'
        if (loginMethod === 'email' || loginMethod === 'sms') {
          authMethod = 'email'
        } else if (loginMethod === 'siwe' || loginMethod === 'siws') {
          // Sign In With Ethereum/Solana = wallet auth
          authMethod = 'wallet'
        } else {
          // github, google, discord, twitter, etc. → social
          authMethod = 'social'
        }

        // Prepare user data for API
        const userData = {
          privyDid: privyUser.id,
          email: userEmail,
          appWallet: appWallet || null,
          extWallet: extWallet || null,
          primaryAuthMethod: authMethod,
          loginMethod: loginMethod, // Pass original login method (github, google, etc.)
        }

        // Create or fetch user from database
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        })

        const responseData = await response.json()

        if (!response.ok) {
          console.error('API Error:', responseData)
          const errorMessage =
            responseData.error?.message ||
            responseData.error ||
            'Failed to create/fetch user'
          throw new Error(errorMessage)
        }

        // Handle new API response pattern: { success: true, data: { user, profile } }
        const user = responseData.data?.user || responseData.user

        if (!user) {
          console.error('No user data in response:', responseData)
          throw new Error('Failed to get user data from server')
        }

        // Invalidate auth query to trigger refetch with fresh user data
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })

        // Redirect based on account status
        if (!wasAlreadyAuthenticated) {
          if (user.accountStatus === 'incomplete') {
            // User created but needs to complete onboarding
            router.push('/onboarding')
            toast.success('¡Bienvenido! Completa tu perfil para continuar', {
              id: 'auth-welcome', // Deduplicate toasts
            })
          } else if (user.accountStatus === 'pending') {
            // Onboarding complete, waiting for approval
            router.push('/profile')
            toast.success('Perfil completo. Esperando aprobación', {
              id: 'auth-pending', // Deduplicate toasts
            })
          } else if (user.accountStatus === 'active') {
            // Approved and active
            router.push('/dashboard')
            toast.success('Sesión iniciada correctamente', {
              id: 'auth-success', // Deduplicate toasts
            })
          } else {
            // Suspended or banned
            toast.error('Cuenta suspendida. Contacta soporte', {
              id: 'auth-suspended', // Deduplicate toasts
            })
          }
        }

        setIsMenuOpen?.(false)
      } catch (error) {
        console.error('Error creating/fetching user:', error)
        toast.error('Error al iniciar sesión. Por favor, intenta de nuevo.', {
          id: 'auth-error', // Deduplicate toasts across multiple AuthButton instances
        })
      }
    },
    onError: (error) => {
      console.error('Login failed', error)
      toast.error('Inicio de sesión fallido', {
        id: 'login-failed', // Deduplicate toasts across multiple AuthButton instances
      })
    },
  })
  const { logout: logoutWithPrivy } = useLogout()

  // const disableLogin = !isPrivyReady || (isPrivyReady && authenticated);

  function login() {
    if (!authenticated) {
      loginWithPrivy()
    } else {
      toast.warning('ya existe una sesión activa', {
        id: 'auth-already-active', // Deduplicate toasts
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

    // Clear auth state immediately
    clearAuth()

    // Invalidate and remove auth queries from cache
    queryClient.removeQueries({ queryKey: ['auth', 'me'] })

    await logoutWithPrivy()
    router.push('/')
    setIsMenuOpen?.(false)
    toast.success('Sesión cerrada correctamente', {
      id: 'auth-logout', // Deduplicate toasts
    })
  }

  if (!isPrivyReady) {
    return (
      <Button
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
