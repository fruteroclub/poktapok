import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { DirectoryProfile } from '@/types/api-v1'
import {
  getCountryFlag,
  truncateText,
  getLearningTrackLabel,
  getLearningTrackStyles,
  getAvailabilityLabel,
  getAvailabilityColor,
  getInitials,
} from '@/lib/utils/directory'

interface ProfileCardProps {
  profile: DirectoryProfile
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const displayName = profile.displayName || profile.username
  const truncatedBio = truncateText(profile.bio, 100)
  const initials = getInitials(displayName)

  return (
    <Link href={`/profile/${profile.username}`}>
      <Card className="flex h-full cursor-pointer flex-col transition-shadow hover:shadow-lg">
        <CardContent className="flex h-full flex-col gap-y-4">
          {/* Top Section: Identity (30%) */}
          <div className="flex items-center gap-2 border-b pb-4">
            <Avatar className="h-16 w-16 shrink-0">
              <AvatarImage
                src={profile.avatarUrl || undefined}
                alt={displayName}
              />
              <AvatarFallback className="text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex min-w-0 flex-1 flex-col">
              <h3 className="truncate text-lg font-bold">{displayName}</h3>
              <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                @{profile.username}
              </p>
            </div>
          </div>

          {/* Bottom Section: Details (70%) */}
          <div className="flex flex-1 flex-col space-y-3">
            {/* Bio */}
            {truncatedBio && (
              <p className="line-clamp-3 text-sm text-gray-700 dark:text-gray-300">
                {truncatedBio}
              </p>
            )}

            {/* Location */}
            {profile.city && profile.country && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <span>{profile.city}</span>
                <span>{getCountryFlag(profile.countryCode)}</span>
              </div>
            )}

            {/* Badges Row */}
            <div className="mt-auto flex flex-wrap items-center gap-2">
              {profile.learningTracks && profile.learningTracks.length > 0 && (
                <Badge
                  variant="secondary"
                  className={getLearningTrackStyles(profile.learningTracks[0])}
                >
                  {getLearningTrackLabel(profile.learningTracks[0])}
                </Badge>
              )}

              <div className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 dark:bg-gray-800">
                <span
                  className={`h-2 w-2 rounded-full ${getAvailabilityColor(
                    profile.availabilityStatus,
                  )}`}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {getAvailabilityLabel(profile.availabilityStatus)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
