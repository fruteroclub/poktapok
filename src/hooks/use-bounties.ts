import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export type BountyStatus = "draft" | "open" | "claimed" | "in_review" | "completed" | "cancelled";
export type BountyDifficulty = "beginner" | "intermediate" | "advanced";
export type SubmissionStatus = "pending" | "approved" | "rejected" | "revision_requested";

export function useBounties(options?: {
  status?: BountyStatus;
  difficulty?: BountyDifficulty;
  limit?: number;
}) {
  const bounties = useQuery(api.bounties.list, options || {});
  return {
    bounties: bounties ?? [],
    isLoading: bounties === undefined,
  };
}

export function useOpenBounties(options?: {
  difficulty?: BountyDifficulty;
  limit?: number;
}) {
  const bounties = useQuery(api.bounties.listOpen, options || {});
  return {
    bounties: bounties ?? [],
    isLoading: bounties === undefined,
  };
}

export function useBounty(bountyId: Id<"bounties"> | undefined) {
  const bounty = useQuery(
    api.bounties.get,
    bountyId ? { bountyId } : "skip"
  );
  return {
    bounty,
    isLoading: bounty === undefined,
  };
}

export function useMyBounties(userId: Id<"users"> | undefined) {
  const claims = useQuery(
    api.bounties.getMyBounties,
    userId ? { userId } : "skip"
  );
  return {
    claims: claims ?? [],
    isLoading: claims === undefined,
  };
}

export function useHasUserClaimed(
  bountyId: Id<"bounties"> | undefined,
  userId: Id<"users"> | undefined
) {
  const claim = useQuery(
    api.bounties.hasUserClaimed,
    bountyId && userId ? { bountyId, userId } : "skip"
  );
  return {
    claim,
    hasClaimed: !!claim,
    isLoading: claim === undefined,
  };
}

export function useBountySubmissions(status?: SubmissionStatus) {
  const submissions = useQuery(
    api.bounties.listSubmissions,
    status ? { status } : {}
  );
  return {
    submissions: submissions ?? [],
    isLoading: submissions === undefined,
  };
}

export function useBountyStats() {
  const stats = useQuery(api.bounties.getStats, {});
  return {
    stats,
    isLoading: stats === undefined,
  };
}

export function useBountyMutations() {
  const claim = useMutation(api.bounties.claim);
  const submit = useMutation(api.bounties.submit);
  const abandonClaim = useMutation(api.bounties.abandonClaim);
  const create = useMutation(api.bounties.create);
  const update = useMutation(api.bounties.update);
  const reviewSubmission = useMutation(api.bounties.reviewSubmission);

  return {
    claim,
    submit,
    abandonClaim,
    create,
    update,
    reviewSubmission,
  };
}

// Helper functions
export function getDifficultyDisplayName(difficulty: BountyDifficulty): string {
  const names: Record<BountyDifficulty, string> = {
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
  };
  return names[difficulty];
}

export function getDifficultyColor(difficulty: BountyDifficulty): string {
  const colors: Record<BountyDifficulty, string> = {
    beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return colors[difficulty];
}

export function getStatusDisplayName(status: BountyStatus): string {
  const names: Record<BountyStatus, string> = {
    draft: "Borrador",
    open: "Abierto",
    claimed: "Reclamado",
    in_review: "En Revisión",
    completed: "Completado",
    cancelled: "Cancelado",
  };
  return names[status];
}

export function getStatusColor(status: BountyStatus): string {
  const colors: Record<BountyStatus, string> = {
    draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    claimed: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    in_review: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return colors[status];
}

export function formatReward(amount: number, currency: string): string {
  if (currency === "USD" || currency === "USDC") {
    return `$${amount.toLocaleString()}`;
  }
  return `${amount} ${currency}`;
}
