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
      <Card className="transition-shadow hover:shadow-lg cursor-pointer h-full">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 flex-shrink-0">
              <AvatarImage src={profile.avatarUrl || undefined} alt={displayName} />
              <AvatarFallback className="text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg truncate">{displayName}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                @{profile.username}
              </p>

              {truncatedBio && (
                <p className="text-sm mt-2 line-clamp-2">{truncatedBio}</p>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-3">
                {profile.city && profile.country && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {profile.city} {getCountryFlag(profile.countryCode)}
                  </span>
                )}

                {profile.learningTracks && profile.learningTracks.length > 0 && (
                  <Badge
                    variant="secondary"
                    className={getLearningTrackStyles(profile.learningTracks[0])}
                  >
                    {getLearningTrackLabel(profile.learningTracks[0])}
                  </Badge>
                )}

                <div className="flex items-center gap-1.5">
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
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
