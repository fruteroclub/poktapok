/**
 * SkillsModal Component
 *
 * Modal for viewing all user skills with project counts
 * Organized by category
 */

'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { SkillBadge } from '@/components/portfolio/skill-badge';
import type { UserSkillWithDetails } from '@/types/api-v1';

interface SkillsModalProps {
  skills: UserSkillWithDetails[];
  isOpen: boolean;
  onClose: () => void;
}

export function SkillsModal({ skills, isOpen, onClose }: SkillsModalProps) {
  // Group skills by category
  const skillsByCategory = skills.reduce((acc, userSkill) => {
    const category = userSkill.skill.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(userSkill);
    return {};
  }, {} as Record<string, UserSkillWithDetails[]>);

  // Category display names
  const categoryNames: Record<string, string> = {
    language: 'Languages',
    framework: 'Frameworks',
    tool: 'Tools',
    blockchain: 'Blockchain',
    other: 'Other',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>All Skills ({skills.length})</DialogTitle>
          <DialogDescription>
            Skills earned through {skills.reduce((sum, s) => sum + s.projectCount, 0)} projects
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="capitalize">
                  {categoryNames[category] || category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {categorySkills.length} skill{categorySkills.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {categorySkills.map((userSkill) => (
                  <div key={userSkill.skill.id} className="flex items-center gap-1">
                    <SkillBadge skill={userSkill.skill} size="md" />
                    <span className="text-xs text-muted-foreground">
                      ({userSkill.projectCount} {userSkill.projectCount === 1 ? 'project' : 'projects'})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {Object.keys(skillsByCategory).length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No skills to display
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
