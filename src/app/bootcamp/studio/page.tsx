"use client";

import { useAuthWithConvex } from "@/hooks/use-auth-with-convex";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Loader2 } from "lucide-react";
import { StudioLayout } from "./studio-layout";
import PageWrapper from "@/components/layout/page-wrapper";

export default function BootcampStudioPage() {
  const { convexUser, isLoading: authLoading } = useAuthWithConvex();
  const { authenticated } = usePrivy();

  // Check if user is enrolled in bootcamp
  const enrollmentData = useQuery(
    api.bootcamp.getEnrollmentWithDetails,
    convexUser?._id ? { programSlug: "vibecoding", userId: convexUser._id } : "skip"
  );

  // Loading state
  if (authLoading || enrollmentData === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF8F0]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-gray-500">Cargando...</span>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!authenticated || !convexUser) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Inicia sesion
          </h1>
          <p className="text-gray-600 text-center max-w-md">
            Necesitas iniciar sesion para acceder al Studio.
          </p>
        </div>
      </PageWrapper>
    );
  }

  // Not enrolled in bootcamp
  if (!enrollmentData?.enrollment) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Acceso Exclusivo
          </h1>
          <p className="text-gray-600 text-center max-w-md mb-6">
            El Studio esta disponible solo para estudiantes del Vibe Coding Bootcamp.
            Inscribete para obtener acceso.
          </p>
          <a
            href="/bootcamp/vibecoding"
            className="px-6 py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
          >
            Ver Bootcamp
          </a>
        </div>
      </PageWrapper>
    );
  }

  // Studio uses navbar but no footer for full height
  return (
    <>
      <StudioLayout 
        user={convexUser} 
        enrollment={enrollmentData.enrollment} 
      />
    </>
  );
}
