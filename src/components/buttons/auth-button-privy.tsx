'use client'

import { type Dispatch, type SetStateAction } from 'react'
import { useLogin, useLogout, usePrivy } from '@privy-io/react-auth'
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

export default function AuthButton({
  children,
  className,
  size = 'default',
  setIsMenuOpen,
}: AuthButtonProps) {
  const { ready: isPrivyReady, authenticated } = usePrivy()
  const router = useRouter()

  const { login: loginWithPrivy } = useLogin({
    onComplete: async ({
      user,
      isNewUser,
      wasAlreadyAuthenticated,
      loginMethod,
      loginAccount,
    }) => {
      console.log('User logged in successfully', user)
      console.log('Is new user:', isNewUser)
      console.log('Was already authenticated:', wasAlreadyAuthenticated)
      console.log('Login method:', loginMethod)
      console.log('Login account:', loginAccount)

      try {
        // Get the Ethereum embedded wallet address (not Solana)
        const ethereumWallet = user.linkedAccounts?.find(
          (account) =>
            account.type === 'wallet' &&
            'walletClientType' in account &&
            account.walletClientType === 'privy' &&
            'chainType' in account &&
            account.chainType === 'ethereum',
        )
        const appWallet =
          ethereumWallet && 'address' in ethereumWallet
            ? ethereumWallet.address
            : undefined

        console.log('All linked accounts:', user.linkedAccounts)
        console.log('Ethereum wallet found:', appWallet)

        // Prepare user data for API
        const userData: {
          id: string
          username: string
          displayName: string
          appWallet?: string
          email?: string
        } = {
          id: user.id,
          username: user.email?.address || user.phone?.number || user.id,
          displayName: user.email?.address || user.phone?.number || user.id,
        }

        // Only add optional fields if they exist and are valid
        if (appWallet && appWallet.startsWith('0x')) {
          userData.appWallet = appWallet
        }
        if (user.email?.address) {
          userData.email = user.email.address
        }

        // Create or fetch user from database
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        })

        if (!response.ok) {
          throw new Error('Failed to create/fetch user')
        }

        const { user: fruteroUser } = await response.json()


        // Only redirect if this is a fresh login (not already authenticated)
        if (!wasAlreadyAuthenticated) {
          // Redirect to profile page for new logins
          router.push('/profile')
        }

        if (!isNewUser) {
          toast.success('Sesión iniciada correctamente')
        } else {
          toast.success('Cuenta creada correctamente')
        }

        setIsMenuOpen?.(false)
      } catch (error) {
        console.error('Error creating/fetching user:', error)
        toast.error('Error al iniciar sesión. Por favor, intenta de nuevo.')
      }
    },
    onError: (error) => {
      console.log('Login failed', error)
      toast.error('Inicio de sesión fallido')
    },
  })
  const { logout: logoutWithPrivy } = useLogout()

  // const disableLogin = !isPrivyReady || (isPrivyReady && authenticated);

  function login() {
    if (!authenticated) {
      loginWithPrivy()
    } else {
      toast.warning('ya existe una sesión activa')
    }
  }
  async function logout() {
    await logoutWithPrivy()
    router.push('/')
    setIsMenuOpen?.(false)
    toast.success('Sesión cerrada correctamente')
  }

  if (!isPrivyReady) {
    return <Button
      onClick={() => console.log('Privy not ready')}
      size={size}
      className={cn('font-funnel font-medium', className)}
      disabled
    >
      {authenticated ? 'Salir' : children || 'Entrar'}
    </Button>
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
