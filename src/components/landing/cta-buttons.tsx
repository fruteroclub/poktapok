"use client"

import { ArrowRight, ArrowRightIcon, SparklesIcon } from 'lucide-react'
import AuthButtonPrivy from '../buttons/auth-button-privy'
import { Button } from '../ui/button'
import { usePrivy } from '@privy-io/react-auth'

export default function HeroCTAButtons() {
  const { ready: isPrivyReady, authenticated } = usePrivy()

  return (
    <div className="flex flex-col gap-y-4 justify-center">
      {
        !isPrivyReady ? (
          <Button
            size="lg"
            className="text-2xl font-medium lg:px-14 lg:py-6">
            Únete
            <SparklesIcon className="ml-2 h-5 w-5 fill-background" />
          </Button>
        ) : !authenticated ? (
          <AuthButtonPrivy
            size="lg"
            className="text-2xl font-medium lg:px-14 lg:py-6"
          >
            Únete
            <SparklesIcon className="ml-2 h-5 w-5 fill-background" />
          </AuthButtonPrivy>) : (

          <Button size="lg"
            className="font-medium lg:px-14 lg:py-6">
            Mi Dashboard
          </Button>
        )}
      <Button variant="outline" size="lg" className="font-medium lg:px-14 lg:py-6">
        Próximos eventos
        <ArrowRightIcon className="ml-2 h-5 w-5" />
      </Button>
    </div>
  )
}