'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, User } from 'lucide-react'

interface UserInfoDisplayProps {
  username: string
  displayName: string | null
  email: string | null
  bio: string | null
  avatarUrl: string | null
}

/**
 * UserInfoDisplay - Read-only display of user identity information
 * Shows avatar, username, email, and bio from User table
 * Displayed at top of profile creation form
 */
export function UserInfoDisplay({
  username,
  displayName,
  email,
  bio,
  avatarUrl,
}: UserInfoDisplayProps) {
  const initials = (displayName || username)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card>
      <CardContent className="flex flex-col space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center lg:gap-6 xl:gap-8">
          {/* Avatar and Username */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarUrl || undefined} alt={username} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex h-full items-center gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Username</p>
                <p className="font-medium">{username}</p>
              </div>
            </div>
          </div>

          {/* Display Name */}
          {displayName && (
            <div className="flex items-start gap-2">
              <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Nombre</p>
                <p className="font-medium">{displayName}</p>
              </div>
            </div>
          )}

          {/* Email */}
          {email && (
            <div className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{email}</p>
              </div>
            </div>
          )}
        </div>
        {/* Bio */}
        {bio && (
          <div className="border-t pt-2">
            <p className="mb-1 text-xs text-muted-foreground">Bio</p>
            <p className="text-sm">{bio}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
