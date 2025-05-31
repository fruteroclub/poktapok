'use client'

import { type Dispatch, type SetStateAction } from 'react'
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core'
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
  const { handleLogOut, setShowAuthFlow, sdkHasLoaded } = useDynamicContext()
  const isLoggedIn = useIsLoggedIn()
  const router = useRouter()

  function login() {
    if (!isLoggedIn) {
      setShowAuthFlow(true)
    } else {
      toast.warning('ya existe una sesión activa')
    }
  }
  async function logout() {
    await handleLogOut()
    router.push('/')
    setIsMenuOpen?.(false)
  }

  if (!sdkHasLoaded) {
    return null
  }

  return (
    <Button
      onClick={isLoggedIn ? logout : login}
      size={size}
      className={cn('font-funnel font-medium', className)}
    >
      {isLoggedIn ? 'salir' : children || 'entrar'}
    </Button>
  )
}
