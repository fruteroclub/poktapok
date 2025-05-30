'use client'

import { useAccount, useBalance, useEnsAvatar, useEnsName } from 'wagmi'
import { useEffect, useState } from 'react'
import { mainnet } from 'viem/chains'
import Image from 'next/image'
import SendNativeTokenModal from './send-native-token-modal'
import SendErc20Modal from './send-erc20-modal'
import SwitchNetworkModal from './switch-chain-modal'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { truncateString } from '@/utils'

export function ConnectedAccount() {
  const pulpaTokenChainId = parseInt(
    process.env.NEXT_PUBLIC_PULPA_TOKEN_CHAIN_ID ?? '',
  )

  const [isMounted, setIsMounted] = useState(false)

  const { sdkHasLoaded, user } = useDynamicContext()
  const { address, chain, chainId } = useAccount()

  const accountBalance = useBalance({
    address,
  })

  const { data: ensName } = useEnsName({
    address,
    chainId: mainnet.id,
  })
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName!,
    chainId: mainnet.id,
  })

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true)
    }
  }, [isMounted])

  if (!isMounted || !sdkHasLoaded) {
    return (
      <div>
        <p className="text-lg">cargando...</p>
      </div>
    )
  }

  if (status === 'disconnected' && sdkHasLoaded) {
    return (
      <div>
        <p className="text-center text-lg">no conectado</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-y-4 text-center">
      <div className="flex flex-col items-center gap-y-2">
        <p className="text-lg">bienvenido {user?.username}</p>
      </div>
      {ensAvatar && ensName && isMounted && (
        <div className="flex items-center gap-x-2">
          <Image
            alt="ENS Avatar"
            src={ensAvatar}
            className="h-16 w-16 rounded-full"
            height={64}
            width={64}
          />
          {ensName && <p className="text-2xl">{ensName}</p>}
        </div>
      )}
      {address && isMounted && (
        <div className="flex flex-col items-center gap-y-2">
          <p className="text-lg">dirección de cartera conectada:</p>
          <p className="text-lg md:hidden">{truncateString(address)}</p>
          <p className="hidden text-lg md:block">{address}</p>
        </div>
      )}
      <div className="flex flex-col gap-y-2">
        {accountBalance.data?.value !== undefined && isMounted && (
          <p className="text-xl">
            balance: {accountBalance.data?.formatted}{' '}
            {chain?.nativeCurrency.symbol ?? 'ETH'}
          </p>
        )}
        {chain && chainId && isMounted && (
          <>
            <p className="text-lg">chain: {chain.name}</p>
            <p className="text-lg">chain Id: {chainId}</p>
          </>
        )}
      </div>
      <div className="flex justify-center gap-x-4 px-4">
        <div className="w-1/2">
          <SendNativeTokenModal accountBalance={accountBalance} chain={chain} />
        </div>
        <div className="w-1/2">
          {chainId === pulpaTokenChainId ? (
            <SendErc20Modal chain={chain} userAddress={address} />
          ) : (
            <SwitchNetworkModal
              buttonText="enviar $PULPA"
              requiredChainId={pulpaTokenChainId}
            />
          )}
        </div>
      </div>
    </div>
  )
}
