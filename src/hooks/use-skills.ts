import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export type SkillCategory =
  | "frontend"
  | "backend"
  | "blockchain"
  | "ai"
  | "devops"
  | "design"
  | "other";

export type SkillLevel = "beginner" | "intermediate" | "advanced";

export function useSkills(category?: SkillCategory) {
  const skills = useQuery(api.skills.list, category ? { category } : {});
  return {
    skills: skills ?? [],
    isLoading: skills === undefined,
  };
}

export function useUserSkills(userId: Id<"users"> | undefined) {
  const userSkills = useQuery(
    api.skills.getUserSkills,
    userId ? { userId } : "skip"
  );
  return {
    userSkills: userSkills ?? [],
    isLoading: userSkills === undefined,
  };
}

export function useUserSkillsByUsername(username: string | undefined) {
  const userSkills = useQuery(
    api.skills.getUserSkillsByUsername,
    username ? { username } : "skip"
  );
  return {
    userSkills: userSkills ?? [],
    isLoading: userSkills === undefined,
  };
}

export function useEndorsements(userSkillId: Id<"userSkills"> | undefined) {
  const endorsements = useQuery(
    api.skills.getEndorsements,
    userSkillId ? { userSkillId } : "skip"
  );
  return {
    endorsements: endorsements ?? [],
    isLoading: endorsements === undefined,
  };
}

export function useHasEndorsed(
  endorserId: Id<"users"> | undefined,
  userSkillId: Id<"userSkills"> | undefined
) {
  const hasEndorsed = useQuery(
    api.skills.hasEndorsed,
    endorserId && userSkillId ? { endorserId, userSkillId } : "skip"
  );
  return {
    hasEndorsed: hasEndorsed ?? false,
    isLoading: hasEndorsed === undefined,
  };
}

export function useSkillMutations() {
  const addUserSkill = useMutation(api.skills.addUserSkill);
  const updateUserSkillLevel = useMutation(api.skills.updateUserSkillLevel);
  const removeUserSkill = useMutation(api.skills.removeUserSkill);
  const endorse = useMutation(api.skills.endorse);
  const removeEndorsement = useMutation(api.skills.removeEndorsement);
  const seedSkills = useMutation(api.skills.seedSkills);
  const getOrCreateCustomSkill = useMutation(api.skills.getOrCreateCustomSkill);

  return {
    addUserSkill,
    updateUserSkillLevel,
    removeUserSkill,
    endorse,
    removeEndorsement,
    seedSkills,
    getOrCreateCustomSkill,
  };
}

// Helper to get category display name
export function getCategoryDisplayName(category: SkillCategory): string {
  const names: Record<SkillCategory, string> = {
    frontend: "Frontend",
    backend: "Backend",
    blockchain: "Blockchain",
    ai: "AI/ML",
    devops: "DevOps",
    design: "Diseño",
    other: "Otros",
  };
  return names[category];
}

// Helper to get level display name
export function getLevelDisplayName(level: SkillLevel): string {
  const names: Record<SkillLevel, string> = {
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
  };
  return names[level];
}

// Helper to get level badge color
export function getLevelColor(level: SkillLevel): string {
  const colors: Record<SkillLevel, string> = {
    beginner: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    advanced: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  };
  return colors[level];
}
