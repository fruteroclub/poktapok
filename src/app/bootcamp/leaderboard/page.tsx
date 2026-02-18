"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Leaderboard } from "@/components/leaderboard";
import Link from "next/link";

export default function LeaderboardPage() {
  // Get the first active bootcamp program
  const programs = useQuery(api.bootcamp.listPrograms);
  const activeProgram = programs?.find(p => p.status === "active");

  if (!programs) {
    return (
      <div className="min-h-screen bg-[var(--cream)] p-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!activeProgram) {
    return (
      <div className="min-h-screen bg-[var(--cream)] p-8">
        <div className="max-w-5xl mx-auto text-center py-20">
          <h1 className="text-3xl font-bold mb-4">No hay bootcamps activos</h1>
          <p className="text-gray-600 mb-8">
            Vuelve pronto para ver el leaderboard del proximo bootcamp.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-[var(--rosa)] text-white font-bold rounded-full border-2 border-[var(--dark)] shadow-[3px_3px_0_var(--dark)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_var(--dark)] transition-all"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      {/* Header */}
      <div className="bg-white border-b-2 border-[var(--dark)]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-2">
            <Link 
              href="/bootcamp/vibecoding"
              className="text-sm text-[var(--rosa)] hover:underline"
            >
              ← Volver al bootcamp
            </Link>
          </div>
          <h1 className="text-4xl font-black">Leaderboard</h1>
          <p className="text-gray-600 mt-2">
            {activeProgram.name} - Ranking de participantes
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Leaderboard programId={activeProgram._id} limit={20} showStats={true} />
      </div>
    </div>
  );
}
