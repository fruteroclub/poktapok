import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, MapPin, Calendar } from "lucide-react";
import { ShareButton } from "./share-button";
import { formatLocation } from "@/lib/utils/country-flags";
import { format, isAfter, subDays } from "date-fns";

interface ProfileHeaderProps {
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  city: string | null;
  country: string | null;
  countryCode: string | null;
  learningTracks: ("ai" | "crypto" | "privacy")[] | null;
  availabilityStatus: "available" | "open_to_offers" | "unavailable" | null;
  profileVisibility: "public" | "members" | "private";
  createdAt: Date;
  isOwner: boolean;
  canViewLocation: boolean;
  canViewLearningTracks: boolean;
}

const learningTrackConfig = {
  ai: {
    label: "Code: AI",
    variant: "default" as const,
  },
  crypto: {
    label: "Crypto/DeFi",
    variant: "secondary" as const,
  },
  privacy: {
    label: "Privacy",
    variant: "outline" as const,
  },
};

const availabilityConfig = {
  available: {
    label: "Available",
    dot: "🟢",
  },
  open_to_offers: {
    label: "Open to Offers",
    dot: "🔵",
  },
  unavailable: {
    label: "Unavailable",
    dot: "⚫",
  },
};

// Check if user is "new" (created within last 7 days)
function isNewMember(createdAt: Date): boolean {
  const sevenDaysAgo = subDays(new Date(), 7);
  return isAfter(createdAt, sevenDaysAgo);
}

export function ProfileHeader({
  username,
  displayName,
  bio,
  avatarUrl,
  city,
  country,
  countryCode,
  learningTracks,
  availabilityStatus,
  profileVisibility,
  createdAt,
  isOwner,
  canViewLocation,
  canViewLearningTracks,
}: ProfileHeaderProps) {
  // Get user initials for avatar fallback
  const initials = displayName
    ? displayName.charAt(0).toUpperCase()
    : username.charAt(0).toUpperCase();

  // Format join date
  const joinDate = format(new Date(createdAt), "MMMM yyyy");

  // Check if new member
  const showNewBadge = isNewMember(new Date(createdAt));

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar */}
        <Avatar className="h-32 w-32 shrink-0">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={displayName || username} />
          ) : null}
          <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold truncate">
                {displayName || username}
              </h1>
              <p className="text-muted-foreground">@{username}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 shrink-0">
              {isOwner ? (
                <Button size="sm" asChild>
                  <Link href="/profile/edit">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              ) : (
                <ShareButton username={username} displayName={displayName} />
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {/* Private Profile Badge */}
            {profileVisibility === "private" && !isOwner && (
              <Badge variant="destructive">Private Profile</Badge>
            )}

            {/* Learning Tracks (if visible) */}
            {canViewLearningTracks &&
              learningTracks &&
              learningTracks.length > 0 &&
              learningTracks.map((track) => (
                <Badge key={track} variant={learningTrackConfig[track].variant}>
                  {learningTrackConfig[track].label}
                </Badge>
              ))}

            {/* Availability Status (if visible) */}
            {canViewLearningTracks && availabilityStatus && (
              <Badge variant="outline">
                <span className="mr-1">
                  {availabilityConfig[availabilityStatus].dot}
                </span>
                {availabilityConfig[availabilityStatus].label}
              </Badge>
            )}

            {/* New Member Badge */}
            {showNewBadge && (
              <Badge variant="secondary" className="bg-blue-500/10">
                New
              </Badge>
            )}
          </div>

          {/* Bio */}
          {bio && <p className="text-lg mb-4 whitespace-pre-wrap">{bio}</p>}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {/* Location (if visible) */}
            {canViewLocation && (city || country) && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{formatLocation(city, country, countryCode)}</span>
              </div>
            )}

            {/* Join Date */}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Joined {joinDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
