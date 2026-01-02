"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { EditableUserCard } from "@/components/profile/editable-user-card";
import { EditableProfileCard } from "@/components/profile/editable-profile-card";
import { ProfileSkillsSection } from "@/components/profile/profile-skills-section";
import { PortfolioProjectsSection } from "@/components/profile/portfolio-projects-section";
import { Loader2, Clock } from "lucide-react";
import { useEffect } from "react";
import PageWrapper from "@/components/layout/page-wrapper";
import { ProtectedRoute } from "@/components/layout/protected-route-wrapper";
import { Section } from "@/components/layout/section";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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
              <p className="text-gray-600 dark:text-gray-400">
                View and edit your profile information
              </p>

              {/* Pending Approval Banner */}
              {user.accountStatus === "pending" && (
                <Alert className="border-amber-500/50 bg-amber-500/10">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                  <AlertTitle className="text-amber-900 dark:text-amber-100">
                    Profile Under Review
                  </AlertTitle>
                  <AlertDescription className="text-amber-800 dark:text-amber-200">
                    Your profile is currently being reviewed by our team. You&apos;ll be able to access the full platform once your profile is approved. We&apos;ll notify you via email when the review is complete.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Section>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {/* User Card - User table data */}
                <div className="w-full col-span-2 lg:col-span-1">
                  <EditableUserCard
                    className="h-full"
                    user={{
                      id: user.id,
                      username: user.username,
                      displayName: user.displayName,
                      email: user.email,
                      bio: user.bio,
                      avatarUrl: user.avatarUrl,
                      role: user.role,
                      accountStatus: user.accountStatus,
                    }}
                  />
                </div>
                {/* Profile Card - Profile table data */}
                <div className="col-span-2 lg:col-span-1">
                  <EditableProfileCard
                    className="h-full" profile={profile} userId={user.id} />
                </div>
                {/* Portfolio Projects Section */}
                <div className="col-span-2">
                  <PortfolioProjectsSection
                    userId={user.id}
                    isOwner={true}
                  />
                </div>

                {/* Skills Section - Earned from projects */}
                <div className="col-span-2">
                  <ProfileSkillsSection
                    userId={user.id}
                    isOwner={true}
                  />
                </div>
              </div>
            </Section>
          </div>
        </div>
      </PageWrapper>
    </ProtectedRoute>
  );
}
