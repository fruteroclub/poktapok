"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/use-auth";
import { UserInfoDisplay } from "@/components/profile/user-info-display";
import { ProfileForm } from "@/components/profile/profile-form";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import PageWrapper from "@/components/layout/page-wrapper";
import { ProtectedRoute } from "@/components/layout/protected-route-wrapper";

/**
 * Profile Page - Profile creation/edit page
 * - Uses TanStack Query to fetch current user data
 * - Shows profile form if no profile exists
 * - Will show edit form if profile exists (future enhancement)
 */
export default function ProfilePage() {
  const { authenticated, ready } = usePrivy();
  const router = useRouter();
  const { data, isLoading, isError } = useMe();

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
          <div className="space-y-8">
            {/* Page Header */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {profile ? "Editar Perfil" : "Crear tu Perfil"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {profile
                  ? "Actualiza tu información de perfil"
                  : "Completa tu perfil para aparecer en el directorio de talento"}
              </p>
            </div>

            {/* User Info (Read-only) */}
            <UserInfoDisplay
              username={user.username}
              displayName={user.displayName}
              email={user.email}
              bio={user.bio}
              avatarUrl={user.avatarUrl}
            />

            {/* Profile Form */}
            {!profile ? (
              <div className="space-y-6">
                <div className="p-4 border rounded-lg ">
                  <h3 className="font-semibold mb-1">Completa tu perfil</h3>
                  <p className="text-sm text-muted-foreground">
                    Ayúdanos a conocerte mejor completando la siguiente información.
                    Esto nos permitirá conectarte con oportunidades relevantes.
                  </p>
                </div>

                <ProfileForm
                  userInfo={{
                    username: user.username,
                    displayName: user.displayName,
                    avatarUrl: user.avatarUrl,
                  }}
                />
              </div>
            ) : (
              <div className="p-8 border rounded-lg text-center">
                <h3 className="text-lg font-semibold mb-2">Perfil ya creado</h3>
                <p className="text-muted-foreground mb-4">
                  Tu perfil ya existe. La función de edición estará disponible
                  próximamente.
                </p>
              </div>
            )}
          </div>
        </div>
      </PageWrapper>
    </ProtectedRoute>
  );
}
