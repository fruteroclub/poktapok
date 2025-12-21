"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import OnboardingForm from "@/components/onboarding/onboarding-form";

export default function OnboardingPage() {
  const { authenticated, ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if not authenticated
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [authenticated, ready, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Completa tu perfil</h1>
        <p className="mt-2 text-muted-foreground">
          Completa tu información para empezar a usar la plataforma
        </p>
      </div>
      <OnboardingForm />
    </div>
  );
}
