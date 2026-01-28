/**
 * ProfileSkillsSection Component
 *
 * Displays user's earned skills from projects
 * Shows top 5 skills by project count with option to view all
 */

'use client'

import { useState } from 'react'
import { Loader2, Code2, ChevronRight } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SkillBadge } from '@/components/portfolio/skill-badge'
import { useUserSkills } from '@/hooks/use-skills'
import { SkillsModal } from './skills-modal'

interface ProfileSkillsSectionProps {
  userId: string
  isOwner: boolean
}

export function ProfileSkillsSection({
  userId,
  isOwner,
}: ProfileSkillsSectionProps) {
  const [showAllSkills, setShowAllSkills] = useState(false)

  // Fetch user skills (limit to 5 for display)
  const { data, isLoading, isError } = useUserSkills(userId)

  if (isLoading) {
    return (
      <Card className="gap-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Skills
          </CardTitle>
          <CardDescription>Earned through projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="gap-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Skills
          </CardTitle>
          <CardDescription>Earned through projects</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load skills</p>
        </CardContent>
      </Card>
    )
  }

  const skills = data?.skills || []
  const topSkills = skills.slice(0, 5)
  const hasMoreSkills = skills.length > 5

  // Empty state
  if (skills.length === 0) {
    return (
      <Card className="gap-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Skills
          </CardTitle>
          <CardDescription>Earned through projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Code2 className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
            <p className="mb-4 text-sm text-muted-foreground">
              {isOwner
                ? "You haven't earned any skills yet. Add skills to your projects to showcase your expertise."
                : 'No skills earned yet'}
            </p>
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = '/portfolio/new')}
              >
                Create Project
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="gap-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Skills ({skills.length})
          </CardTitle>
          <CardDescription>
            Technical skills demonstrated across projects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {topSkills.map((userSkill) => (
              <div key={userSkill.skill.id} className="flex items-center gap-1">
                <SkillBadge skill={userSkill.skill} size="md" />
                <span className="text-xs text-muted-foreground">
                  ({userSkill.projectCount})
                </span>
              </div>
            ))}
          </div>

          {hasMoreSkills && (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllSkills(true)}
              >
                View All {skills.length} Skills
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills Modal */}
      <SkillsModal
        skills={skills}
        isOpen={showAllSkills}
        onClose={() => setShowAllSkills(false)}
      />
    </>
  )
}
