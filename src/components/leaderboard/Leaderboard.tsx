"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface LeaderboardProps {
  programId: Id<"bootcampPrograms">;
  limit?: number;
  showStats?: boolean;
}

export function Leaderboard({ programId, limit = 10, showStats = true }: LeaderboardProps) {
  const leaderboard = useQuery(api.leaderboard.getLeaderboard, { programId, limit });
  const stats = useQuery(api.leaderboard.getProgramStats, { programId });

  if (!leaderboard || !stats) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Participantes"
            value={stats.enrollments.total}
            subtext={`${stats.enrollments.active} activos`}
            color="rosa"
          />
          <StatCard
            label="Progreso Promedio"
            value={`${stats.progress.average}%`}
            subtext={`${stats.progress.distribution.completed} completados`}
            color="naranja"
          />
          <StatCard
            label="Entregables"
            value={stats.deliverables.total}
            subtext={`${stats.deliverables.approved} aprobados`}
            color="lila"
          />
          <StatCard
            label="Dia Mas Activo"
            value={stats.activity.mostActiveDay.count || 0}
            subtext={stats.activity.mostActiveDay.date || "N/A"}
            color="teal"
          />
        </div>
      )}

      {/* Progress by Session */}
      {showStats && (
        <div className="bg-white rounded-2xl border-2 border-[var(--dark)] p-6 shadow-[4px_4px_0_var(--dark)]">
          <h3 className="font-bold text-lg mb-4">Progreso por Sesion</h3>
          <div className="space-y-3">
            {Object.entries(stats.deliverables.bySession).map(([session, data]) => (
              <div key={session} className="flex items-center gap-4">
                <span className="w-24 text-sm font-medium">Sesion {session}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-[var(--rosa)] transition-all"
                    style={{
                      width: `${stats.enrollments.total > 0 
                        ? (data.approved / stats.enrollments.total) * 100 
                        : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-16 text-right">
                  {data.approved}/{stats.enrollments.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl border-2 border-[var(--dark)] overflow-hidden shadow-[4px_4px_0_var(--dark)]">
        <div className="px-6 py-4 border-b-2 border-[var(--dark)] bg-[var(--cream)]">
          <h3 className="font-bold text-lg">Ranking de Participantes</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {leaderboard.map((participant) => (
            <LeaderboardRow key={participant.enrollmentId} participant={participant} />
          ))}
          {leaderboard.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No hay participantes aun
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  subtext: string;
  color: "rosa" | "naranja" | "lila" | "teal";
}

function StatCard({ label, value, subtext, color }: StatCardProps) {
  const colorMap = {
    rosa: "bg-[var(--rosa)]",
    naranja: "bg-[var(--nar)]",
    lila: "bg-[var(--lila)]",
    teal: "bg-[var(--teal)]",
  };

  return (
    <div className={`${colorMap[color]} rounded-2xl border-2 border-[var(--dark)] p-4 shadow-[3px_3px_0_var(--dark)] text-white`}>
      <p className="text-sm opacity-90">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs opacity-75">{subtext}</p>
    </div>
  );
}

interface LeaderboardRowProps {
  participant: {
    rank: number;
    displayName: string;
    username: string | null;
    avatarUrl: string | null;
    progress: number;
    sessionsCompleted: number;
    deliverables: { submitted: number; approved: number };
    status: string;
  };
}

function LeaderboardRow({ participant }: LeaderboardRowProps) {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
      {/* Rank */}
      <div className="w-12 text-center">
        <span className={`${participant.rank <= 3 ? "text-2xl" : "text-lg font-bold text-gray-400"}`}>
          {getRankBadge(participant.rank)}
        </span>
      </div>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-[var(--cream)] border-2 border-[var(--dark)] overflow-hidden flex items-center justify-center">
        {participant.avatarUrl ? (
          <img src={participant.avatarUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg font-bold text-[var(--dark)]">
            {participant.displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="font-bold truncate">{participant.displayName}</p>
        {participant.username && (
          <p className="text-sm text-gray-500">@{participant.username}</p>
        )}
      </div>

      {/* Progress */}
      <div className="w-24">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all ${
                participant.progress >= 100 ? "bg-green-500" : "bg-[var(--rosa)]"
              }`}
              style={{ width: `${Math.min(participant.progress, 100)}%` }}
            />
          </div>
          <span className="text-sm font-medium w-10 text-right">{participant.progress}%</span>
        </div>
      </div>

      {/* Deliverables */}
      <div className="w-20 text-center">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--lila)] text-white">
          {participant.deliverables.approved}/{participant.deliverables.submitted}
        </span>
      </div>

      {/* Status Badge */}
      <div className="w-24 text-right">
        {participant.status === "completed" ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            Completado
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            Activo
          </span>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
