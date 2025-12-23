import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { DirectoryProfile } from "@/types/api-v1";
import {
  getCountryFlag,
  truncateText,
  getLearningTrackLabel,
  getLearningTrackStyles,
  getAvailabilityLabel,
  getAvailabilityColor,
  getInitials,
} from "@/lib/utils/directory";

interface ProfileCardProps {
  profile: DirectoryProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const displayName = profile.displayName || profile.username;
  const truncatedBio = truncateText(profile.bio, 100);
  const initials = getInitials(displayName);

  return (
    <Link href={`/profile/${profile.username}`}>
      <Card className="transition-shadow hover:shadow-lg cursor-pointer h-full flex flex-col">
        <CardContent className="flex flex-col h-full">
          {/* Top Section: Identity (30%) */}
          <div className="flex items-center gap-2 border-b" style={{ minHeight: '30%' }}>
            <Avatar className="h-16 w-16 shrink-0">
              <AvatarImage src={profile.avatarUrl || undefined} alt={displayName} />
              <AvatarFallback className="text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col min-w-0 flex-1">
              <h3 className="font-bold text-lg truncate">{displayName}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                @{profile.username}
              </p>
            </div>
          </div>

          {/* Bottom Section: Details (70%) */}
          <div className="flex flex-col pt-4 space-y-3 flex-1">
            {/* Bio */}
            {truncatedBio && (
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
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
            <div className="flex flex-wrap items-center gap-2 mt-auto">
              {profile.learningTracks && profile.learningTracks.length > 0 && (
                <Badge
                  variant="secondary"
                  className={getLearningTrackStyles(profile.learningTracks[0])}
                >
                  {getLearningTrackLabel(profile.learningTracks[0])}
                </Badge>
              )}

              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800">
                <span
                  className={`h-2 w-2 rounded-full ${getAvailabilityColor(
                    profile.availabilityStatus
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
  );
}
