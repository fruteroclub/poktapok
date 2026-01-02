/**
 * SkillBadge Component
 *
 * Skill display with category-based color coding
 * Shows skill name with visual distinction by category
 */

import { Badge } from '@/components/ui/badge'
import type { Skill } from '@/types/api-v1'

interface SkillBadgeProps {
  skill: Skill
  size?: 'sm' | 'md' | 'lg'
  showCategory?: boolean
  className?: string
}

// Category color mapping
const categoryColors: Record<string, string> = {
  language: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  framework: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  tool: 'bg-green-100 text-green-800 hover:bg-green-200',
  blockchain: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  other: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
}

// Size variants
const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
}

export function SkillBadge({
  skill,
  size = 'md',
  showCategory = false,
  className = '',
}: SkillBadgeProps) {
  const colorClass = categoryColors[skill.category] || categoryColors.other
  const sizeClass = sizeClasses[size]

  return (
    <Badge
      variant="secondary"
      className={`${colorClass} ${sizeClass} ${className} border-0 font-medium`}
    >
      {skill.name}
      {showCategory && (
        <span className="ml-1 text-xs opacity-60">({skill.category})</span>
      )}
    </Badge>
  )
}

/**
 * SkillBadgeList Component
 *
 * Display a list of skills with optional limit
 */
interface SkillBadgeListProps {
  skills: Skill[]
  maxDisplay?: number
  size?: 'sm' | 'md' | 'lg'
  showCategory?: boolean
  className?: string
}

export function SkillBadgeList({
  skills,
  maxDisplay = 10,
  size = 'md',
  showCategory = false,
  className = '',
}: SkillBadgeListProps) {
  const displayedSkills = skills.slice(0, maxDisplay)
  const remainingCount = skills.length - maxDisplay

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {displayedSkills.map((skill) => (
        <SkillBadge
          key={skill.id}
          skill={skill}
          size={size}
          showCategory={showCategory}
        />
      ))}
      {remainingCount > 0 && (
        <Badge
          variant="secondary"
          className={`${sizeClasses[size]} border-0 bg-gray-100 font-medium text-gray-600`}
        >
          +{remainingCount} more
        </Badge>
      )}
    </div>
  )
}
