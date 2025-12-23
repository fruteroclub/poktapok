import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProfileByUsername } from "@/lib/db/queries/profiles";
import { getCurrentUser } from "@/lib/auth/helpers";
import {
  canViewField,
  isProfileOwner,
} from "@/lib/utils/visibility";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileInfo } from "@/components/profile/profile-info";
import { SocialLinks } from "@/components/profile/social-links";
import PageWrapper from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";

// Force dynamic rendering (uses cookies for auth)
export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const profileData = await getProfileByUsername(username);

  if (!profileData) {
    return {
      title: "Profile Not Found | Poktapok",
    };
  }

  const { user, profile } = profileData;
  const displayName = user.displayName || user.username;
  const bio = user.bio || "Talent profile on Poktapok";

  // For private profiles, use generic metadata
  if (profile.profileVisibility === "private") {
    return {
      title: `${displayName} (@${user.username}) | Poktapok`,
      description: "This is a private profile on Poktapok",
    };
  }

  return {
    title: `${displayName} (@${user.username}) | Poktapok`,
    description: bio,
    openGraph: {
      title: displayName || user.username!,
      description: bio,
      type: "profile",
      images: user.avatarUrl ? [user.avatarUrl] : [],
    },
    twitter: {
      card: "summary",
      title: displayName || user.username!,
      description: bio,
      images: user.avatarUrl ? [user.avatarUrl] : [],
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  // Fetch profile with user data
  const profileData = await getProfileByUsername(username);

  if (!profileData) {
    notFound();
  }

  const { profile, user } = profileData;

  // Get current user for visibility checks
  const currentUser = await getCurrentUser();

  // Determine if viewer is owner
  const isOwner = isProfileOwner(profile, currentUser?.user || null);

  // Check what the viewer can see
  const canViewSocials = canViewField(
    "socialLinks",
    profile,
    currentUser?.user || null
  );
  const canViewLocation = canViewField(
    "city",
    profile,
    currentUser?.user || null
  );
  const canViewLearningTracks = canViewField(
    "learningTracks",
    profile,
    currentUser?.user || null
  );

  return (
    <PageWrapper>
      <div className="page">
      {/* Profile Header */}
      <ProfileHeader
        username={user.username!}
        displayName={user.displayName}
        bio={user.bio}
        avatarUrl={user.avatarUrl}
        city={profile.city}
        country={profile.country}
        countryCode={profile.countryCode}
        learningTracks={profile.learningTracks}
        availabilityStatus={profile.availabilityStatus}
        profileVisibility={profile.profileVisibility}
        createdAt={user.createdAt}
        isOwner={isOwner}
        canViewLocation={canViewLocation}
        canViewLearningTracks={canViewLearningTracks}
      />

      {/* Content Grid */}
      <Section  className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Main Content (2/3 width on desktop) */}
        <div className="md:col-span-2">
          <ProfileInfo
            learningTracks={profile.learningTracks}
            availabilityStatus={profile.availabilityStatus}
            completedBounties={profile.completedBounties}
            totalEarningsUsd={profile.totalEarningsUsd}
            canViewData={canViewLearningTracks}
          />
        </div>

        {/* Sidebar (1/3 width on desktop) */}
        <div>
          {canViewSocials && (
            <SocialLinks
              githubUrl={profile.githubUrl}
              twitterUrl={profile.twitterUrl}
              linkedinUrl={profile.linkedinUrl}
              telegramHandle={profile.telegramHandle}
            />
          )}

          {/* Private Profile Message for Non-Authenticated Viewers */}
          {profile.profileVisibility === "private" &&
            !isOwner &&
            !currentUser && (
              <div className="mt-6 p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  This is a private profile. Sign in to view more details.
                </p>
              </div>
            )}
        </div>
      </Section>
    </div>
    </PageWrapper>
  );
}
