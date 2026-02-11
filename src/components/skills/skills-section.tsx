'use client';

import { useUserSkillsByUsername, useSkillMutations, useHasEndorsed } from '@/hooks/use-skills';
import { useAuthWithConvex } from '@/hooks/use-auth-with-convex';
import { SkillBadge } from './skill-badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Loader2 } from 'lucide-react';
import { Id } from '../../../convex/_generated/dataModel';
import { useState } from 'react';
import { toast } from 'sonner';

interface SkillsSectionProps {
  username: string;
  isOwnProfile?: boolean;
}

export function SkillsSection({ username, isOwnProfile = false }: SkillsSectionProps) {
  const { userSkills, isLoading } = useUserSkillsByUsername(username);
  const { convexUser } = useAuthWithConvex();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (userSkills.length === 0) {
    if (isOwnProfile) {
      return (
        <div className="rounded-lg border border-dashed p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Aún no has agregado skills. Ve a tu Portfolio para agregarlos.
          </p>
        </div>
      );
    }
    return null;
  }

  // Group skills by category
  const groupedSkills = userSkills.reduce(
    (acc, us) => {
      const category = us.skill?.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(us);
      return acc;
    },
    {} as Record<string, typeof userSkills>
  );

  const categoryOrder = ['frontend', 'backend', 'blockchain', 'ai', 'devops', 'design', 'other'];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Skills</h3>
      <div className="space-y-3">
        {categoryOrder.map((category) => {
          const skills = groupedSkills[category];
          if (!skills || skills.length === 0) return null;

          return (
            <div key={category} className="flex flex-wrap gap-2">
              {skills.map((us) => (
                <SkillWithEndorse
                  key={us._id}
                  userSkillId={us._id}
                  name={us.skill?.name || 'Unknown'}
                  level={us.level}
                  endorsementCount={us.endorsementCount}
                  currentUserId={convexUser?._id}
                  isOwnProfile={isOwnProfile}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface SkillWithEndorseProps {
  userSkillId: Id<'userSkills'>;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  endorsementCount: number;
  currentUserId?: Id<'users'>;
  isOwnProfile: boolean;
}

function SkillWithEndorse({
  userSkillId,
  name,
  level,
  endorsementCount,
  currentUserId,
  isOwnProfile,
}: SkillWithEndorseProps) {
  const { hasEndorsed, isLoading: checkingEndorsement } = useHasEndorsed(
    currentUserId,
    userSkillId
  );
  const { endorse, removeEndorsement } = useSkillMutations();
  const [isEndorsing, setIsEndorsing] = useState(false);

  const handleEndorse = async () => {
    if (!currentUserId || isOwnProfile) return;

    setIsEndorsing(true);
    try {
      if (hasEndorsed) {
        await removeEndorsement({ endorserId: currentUserId, userSkillId });
        toast.success('Endorsement removed');
      } else {
        await endorse({ endorserId: currentUserId, userSkillId });
        toast.success('Skill endorsed!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error');
    } finally {
      setIsEndorsing(false);
    }
  };

  // If not logged in or own profile, just show badge
  if (!currentUserId || isOwnProfile) {
    return (
      <SkillBadge
        name={name}
        level={level}
        endorsementCount={endorsementCount}
      />
    );
  }

  // Show badge with endorse action
  return (
    <div className="group relative inline-flex items-center gap-1">
      <SkillBadge
        name={name}
        level={level}
        endorsementCount={endorsementCount}
      />
      <Button
        variant="ghost"
        size="icon"
        className={`h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100 ${
          hasEndorsed ? 'text-primary' : 'text-muted-foreground'
        }`}
        onClick={handleEndorse}
        disabled={isEndorsing || checkingEndorsement}
      >
        {isEndorsing ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <ThumbsUp className={`h-3 w-3 ${hasEndorsed ? 'fill-current' : ''}`} />
        )}
      </Button>
    </div>
  );
}
