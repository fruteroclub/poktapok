'use client'

import React, { useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import AuthButton from '@/components/buttons/auth-button-privy'
import { BlockieAvatar } from '@/components/common/blockie-avatar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { isAddress } from 'viem'
import { useConnection, useEnsAvatar, useEnsName } from 'wagmi'
import { normalize } from 'viem/ens'
import Link from 'next/link'
import { User } from '@/types/api-v1'

interface MobileMenuDropdownProps {
  isLoading?: boolean;
  isSignedIn?: boolean;
  ready: boolean;
  user: User;
}

export default function MobileMenuDropdown({ ready, user }: MobileMenuDropdownProps) {
  const account = useConnection()
  const [checkSumAddress, setCheckSumAddress] = useState<
    `0x${string}` | undefined
  >(undefined)

  const { data: ens } = useEnsName({
    address: checkSumAddress,
    chainId: 1,
    query: {
      enabled: ready && isAddress(checkSumAddress ?? ''),
    },
  })
  const { data: ensAvatar } = useEnsAvatar({
    name: ens ? normalize(ens) : undefined,
    chainId: 1,
    query: {
      enabled: ready && Boolean(ens),
      gcTime: 30_000,
    },
  })

  useEffect(() => {
    if (account.address) {
      setCheckSumAddress(account.address)
    }
  }, [account.address, ready])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>

        {/* Avatar image or blockie avatar */}
        <div className="flex items-center gap-2 px-4 py-2 hover:cursor-pointer hover:rounded-md hover:outline hover:outline-2 hover:outline-primary animate-in fade-in-50 duration-200">
          {user?.avatarUrl ? (
            <>
              <Avatar>
                <AvatarImage src={user?.avatarUrl ?? ''} />
              </Avatar>
              <span>
                {user?.displayName ?? ens ?? 'nrc'}
              </span>
            </>
          ) : (
            checkSumAddress && isAddress(checkSumAddress) ? (
              <>
                <BlockieAvatar
                  address={checkSumAddress}
                  ensImage={ensAvatar}
                  size={32}
                />
                <span>
                  {user?.displayName ?? ens ?? 'nrc'}
                </span></>
            ) : (
              <Avatar>
                <AvatarFallback>
                  {user?.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )
          )
          }
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className="w-56 p-4">
        <DropdownMenuItem>
          <Link className="w-full text-foreground" href="/dashboard">
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link className="w-full text-foreground" href="/profile">
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link className="w-full text-foreground" href="/portfolio">Portfolio</Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="justify-center focus:bg-transparent">
          <AuthButton size="sm" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}