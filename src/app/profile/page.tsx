"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { EditableUserCard } from "@/components/profile/editable-user-card";
import { EditableProfileCard } from "@/components/profile/editable-profile-card";
import { ProfileSkillsSection } from "@/components/profile/profile-skills-section";
import { PortfolioProjectsSection } from "@/components/profile/portfolio-projects-section";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import PageWrapper from "@/components/layout/page-wrapper";
import { ProtectedRoute } from "@/components/layout/protected-route-wrapper";
import { Section } from "@/components/layout/section";

/**
 * Profile Page - User's own profile with inline editing
 * - Displays user data (User table) in editable card
 * - Displays profile data (Profile table) in editable card
 * - Each card has edit button that enables inline editing
 * - Uses Zustand store for state management (no refetching on mutations)
 */
export default function ProfilePage() {
  const { authenticated, ready } = usePrivy();
  const router = useRouter();
  const { data, isLoading, isError } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [authenticated, ready, router]);

  // Redirect if user hasn't completed onboarding
  useEffect(() => {
    if (data?.user) {
      if (data.user.accountStatus === "incomplete" || !data.user.username) {
        router.push("/onboarding");
      }
    }
  }, [data, router]);

  // Handle error state
  useEffect(() => {
    if (isError) {
      router.push("/");
    }
  }, [isError, router]);

  // Loading state
  if (!ready || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No data state
  if (!data?.user) {
    return null;
  }

  const { user, profile } = data;

  return (
    <ProtectedRoute>
      <PageWrapper>
        <div className="page">
          <div className="page-content">
            {/* Page Header */}
            <div className="header-section">
              <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                View and edit your profile information
              </p>
            </div>
            <Section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User Card - User table data */}
              <EditableUserCard
                className="h-full"
                user={{
                  id: user.id,
                  username: user.username,
                  displayName: user.displayName,
                  email: user.email,
                  bio: user.bio,
                  avatarUrl: user.avatarUrl,
                }}
              />

              {/* Profile Card - Profile table data */}
              <EditableProfileCard
                className="h-full" profile={profile} userId={user.id} />

              {/* Portfolio Projects Section */}
              <div className="col-span-2">
                <PortfolioProjectsSection
                  userId={user.id}
                  isOwner={true}
                />
              </div>

              {/* Skills Section - Earned from projects */}
              <div className="w-full md:w-4/5 lg:w-2/3">
                <ProfileSkillsSection
                  userId={user.id}
                  isOwner={true}
                />
              </div>
            </Section>
          </div>
        </div>
      </PageWrapper>
    </ProtectedRoute>
  );
}
