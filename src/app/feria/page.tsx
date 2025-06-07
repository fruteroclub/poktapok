'use client'

import { useCallback } from 'react'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { useAccount, useBalance } from 'wagmi'

import config from '@/config'
import PageWrapper from '@/components/layout/page-wrapper'
import AuthButton from '@/components/buttons/auth-button-dynamic'
import { Skeleton } from "@/components/ui/skeleton"
import SendMxnModal from '@/components/onchain/send-mxn-modal'

export default function FeriaPage() {
  const { xoc } = config.tokens
  const { sdkHasLoaded } = useDynamicContext()
  const { address, isConnected, isConnecting } = useAccount()
  const { data: balance, isLoading, refetch: refetchBalance, status } = useBalance({
    address,
    token: xoc.address,
    chainId: xoc.chains.base.id,
  })

  const refetchMxnBalance = useCallback(async () => {
    await refetchBalance()
  }, [refetchBalance])

  return (
    <PageWrapper>
      <div className="page container space-y-4 pt-8">
        {sdkHasLoaded && !isConnected && !isConnecting ? (
          <div className="gap-y-8 flex flex-col items-center pt-16">
            <p className="text-3xl text-center">inicia sesión para ver tu balance</p>
            <AuthButton size="lg" />
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center w-full md:max-w-xl lg:max-w-lg mx-auto gap-y-2">
              <div className="w-full">
                <h2 className="text-primary text-2xl text-left">balance feria</h2>
              </div>
              <div className="space-y-1 flex flex-col items-center w-1/2 lg:w-1/3">
                {!sdkHasLoaded || isLoading ? (
                  <>
                    <Skeleton className="w-full h-[3.75rem] lg:h-[3rem]" />
                  </>
                ) :
                  status === 'success' && balance.formatted ? (
                    <p className="text-6xl lg:text-5xl font-semibold font-funnel">
                      {Number(balance.formatted).toFixed(2)}
                    </p>
                  ) : (
                    <>
                      <Skeleton className="w-full h-[3.75rem] lg:h-[3rem]" />
                    </>
                  )
                }
                <p className="text-2xl lg:text-xl font-medium">MXN</p>
              </div>
            </div>
            {balance && (
              <div className="flex justify-center">
                <SendMxnModal
                  mxnBalance={balance}
                  refetchMxnBalance={refetchMxnBalance}
                  userAddress={address!}
                />
              </div>)
            }
          </>
        )}
      </div>
    </PageWrapper>
  )
} 