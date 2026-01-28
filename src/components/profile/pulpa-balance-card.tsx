'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Coins, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react'
import { usePulpaBalance } from '@/hooks/use-profile'
import { PULPA_CONFIG } from '@/lib/blockchain/pulpa-config'
import { cn } from '@/lib/utils'

interface PulpaBalanceCardProps {
  className?: string
}

/**
 * Card component displaying user's PULPA token balance
 *
 * Features:
 * - Real-time balance from Optimism blockchain
 * - Manual refresh button
 * - Link to view token on block explorer
 * - Graceful handling of no wallet state
 */
export function PulpaBalanceCard({ className }: PulpaBalanceCardProps) {
  const { data, isLoading, isError, error, refetch, isFetching } =
    usePulpaBalance()

  // Explorer URL for PULPA token contract
  const tokenExplorerUrl = `https://optimistic.etherscan.io/token/${PULPA_CONFIG.address}`

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Coins className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">PULPA Balance</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Optimism Network
              </p>
            </div>
          </div>

          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh balance"
          >
            <RefreshCw
              className={cn('h-4 w-4', isFetching && 'animate-spin')}
            />
          </Button>
        </div>

        {/* Balance Display */}
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">
              {error instanceof Error
                ? error.message
                : 'Failed to load balance'}
            </span>
          </div>
        ) : !data?.hasWallet ? (
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-400">0</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No wallet connected
            </p>
          </div>
        ) : (
          <div>
            <p className="text-3xl font-bold">
              {data.formattedBalance}
              <span className="ml-2 text-lg font-normal text-gray-500 dark:text-gray-400">
                PULPA
              </span>
            </p>
            {data.walletAddress && (
              <p
                className="truncate text-xs text-gray-500 dark:text-gray-400"
                title={data.walletAddress}
              >
                {data.walletAddress.slice(0, 6)}...
                {data.walletAddress.slice(-4)}
              </p>
            )}
          </div>
        )}

        {/* Footer - View on Explorer */}
        <div className="border-t pt-3">
          <a
            href={tokenExplorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-primary dark:text-gray-400"
          >
            View PULPA on Etherscan
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
