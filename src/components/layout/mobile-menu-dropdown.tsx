'use client'

import { useMemo } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

interface MenuItem {
  label: string
  href: string
  adminOnly?: boolean
}

interface MobileMenuDropdownProps {
  isLoading?: boolean
  isSignedIn?: boolean
  ready: boolean
  user: User
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Profile', href: '/profile' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Actividades', href: '/activities' },
]

const ADMIN_MENU_ITEMS: MenuItem[] = [
  { label: 'Admin Dashboard', href: '/admin', adminOnly: true },
  { label: 'Users Management', href: '/admin/users', adminOnly: true },
  { label: 'Crear Actividad', href: '/admin/activities/new', adminOnly: true },
  { label: 'Revisar Submissions', href: '/admin/submissions', adminOnly: true },
]

export default function MobileMenuDropdown({
  ready,
  user,
}: MobileMenuDropdownProps) {
  const account = useConnection()
  const checkSumAddress = useMemo<`0x${string}` | undefined>(
    () => account.address,
    [account.address],
  )

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Avatar image or blockie avatar */}
        <div className="flex animate-in items-center gap-2 px-4 py-2 duration-200 fade-in-50 hover:cursor-pointer hover:rounded-md hover:outline-2 hover:outline-primary">
          {user?.avatarUrl ? (
            <>
              <Avatar>
                <AvatarImage src={user?.avatarUrl ?? ''} />
              </Avatar>
              <span>{user?.displayName ?? ens ?? 'nrc'}</span>
            </>
          ) : checkSumAddress && isAddress(checkSumAddress) ? (
            <>
              <BlockieAvatar
                address={checkSumAddress}
                ensImage={ensAvatar}
                size={32}
              />
              <span>{user?.displayName ?? ens ?? 'nrc'}</span>
            </>
          ) : (
            <Avatar>
              <AvatarFallback>{user?.username?.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-4">
        {/* Regular menu items */}
        {MENU_ITEMS.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link className="w-full cursor-pointer text-foreground" href={item.href}>
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}

        {/* Admin menu items - only visible to admins */}
        {user.role === 'admin' && ADMIN_MENU_ITEMS.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
              Admin
            </DropdownMenuLabel>
            {ADMIN_MENU_ITEMS.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link className="w-full cursor-pointer text-foreground" href={item.href}>
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center focus:bg-transparent">
          <AuthButton size="sm" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
