'use client'

import { Suspense, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  DynamicContextProvider,
  DynamicEventsCallbacks,
  DynamicHandlers,
} from '@dynamic-labs/sdk-react-core'
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector'
import { createConfig, WagmiProvider } from 'wagmi'
import { http } from 'viem'
import { arbitrum, base, mainnet, optimism, polygon } from 'viem/chains'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getDynamicCredentials } from '@/helpers/dynamic'
import { fetchOrCreateUser } from '@/services/auth-services'

const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? undefined

const config = createConfig({
  chains: [arbitrum, base, mainnet, optimism, polygon],
  multiInjectedProviderDiscovery: false,
  transports: {
    [arbitrum.id]: http(`https://arb-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
    [base.id]: http(`https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
    [optimism.id]: http(
      `https://opt-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
    ),
    [polygon.id]: http(`https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
  },
})

const queryClient = new QueryClient()

function OnchainProviderComponent({ children }: { children: ReactNode }) {
  const router = useRouter()

  // Dynamic async callback for logs + logout
  const events: DynamicEventsCallbacks = {
    onLogout: (args) => {
      console.log('onLogout was called', args)
      toast.info('cerrando sesión, ¡vuelve pronto!')
      router.push('/')
    },
  }

  // Dynamic sync callbacks for successful auth
  const handlers: DynamicHandlers = {
    handleAuthenticatedUser: async ({ user: dynamicUser }) => {
      const { id, email, appWallet, extWallet } =
        getDynamicCredentials(dynamicUser)
      try {
        const { user } = await fetchOrCreateUser({
          id,
          email,
          appWallet,
          extWallet,
        })

        if (user) {
          toast.success('¡hola! 🥑 a construir')
          router.push('/cuenta')
        } else {
          toast.warning('no se pudo cargar tu cuenta')
          router.push('/')
        }
      } catch (error) {
        console.error(error)
        toast.warning('no se pudo cargar tu cuenta')
        router.push('/')
      }
    },
  }

  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID ?? 'ENV_ID',
        events,
        handlers,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  )
}

// Main export with Suspense
export default function OnchainProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          Loading...
        </div>
      }
    >
      <OnchainProviderComponent>{children}</OnchainProviderComponent>
    </Suspense>
  )
}
