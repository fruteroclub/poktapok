"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import PageWrapper from "@/components/layout/page-wrapper";
import { ProtectedRoute } from "@/components/layout/protected-route-wrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * Dashboard Page - User's home page after completing profile
 * - Displays user info and profile summary
 * - Shows completion status
 * - Links to profile edit
 */
export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useAuth();

  // Redirect if user hasn't completed onboarding
  useEffect(() => {
    if (data?.user) {
      if (data.user.accountStatus === "incomplete" || !data.user.username) {
        router.push("/onboarding");
      } else if (!data.profile) {
        // User completed onboarding but not profile
        router.push("/profile");
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
  if (isLoading) {
    return (
      <ProtectedRoute>
        <PageWrapper>
          <div className="page">
            <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </PageWrapper>
      </ProtectedRoute>
    );
  }

  // No data state
  if (!data?.user || !data?.profile) {
    return null;
  }

  const { user, profile } = data;

  const initials = (user.displayName || user.username || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <ProtectedRoute>
      <PageWrapper>
        <div className="page">
          <div className="space-y-8">
            {/* Welcome Header */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                ¡Bienvenido, {user.displayName || user.username}!
              </h1>
              <p className="text-muted-foreground mt-2">
                Tu perfil está completo y listo para ser visto en el directorio de talento.
              </p>
            </div>

            {/* User Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Tu Perfil</CardTitle>
                <CardDescription>
                  Así es como apareces en el directorio de talento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar and Basic Info */}
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold">
                      {user.displayName || user.username}
                    </h3>
                    <p className="text-muted-foreground">@{user.username}</p>
                    {user.bio && (
                      <p className="mt-2 text-sm">{user.bio}</p>
                    )}
                  </div>
                </div>

                {/* Profile Details */}
                <div className="grid gap-4 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Ubicación
                      </p>
                      <p className="text-sm">
                        {profile.city}, {profile.country}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Learning Track
                      </p>
                      <p className="text-sm capitalize">
                        {profile.learningTracks[0]}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Estado
                      </p>
                      <p className="text-sm capitalize">
                        {profile.availabilityStatus.replace(/_/g, " ")}
                      </p>
                    </div>
                    {user.email && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Email
                        </p>
                        <p className="text-sm">{user.email}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/profile")}
                  >
                    Editar Perfil
                  </Button>
                  <Button onClick={() => router.push("/directory")}>
                    Ver Directorio
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats / Future sections can go here */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Perfil Completo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Todos los campos requeridos completados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Estado de Cuenta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">
                    {user.accountStatus}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tu cuenta está activa
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Visibilidad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Público</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Visible en el directorio de talento
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageWrapper>
    </ProtectedRoute>
  );
}
