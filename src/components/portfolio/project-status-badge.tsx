/**
 * ProjectStatusBadge Component
 *
 * Visual badge for project status with color coding
 * Shows status with appropriate styling
 */

import { FileText, Wrench, CheckCircle, Archive } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ProjectStatusBadgeProps {
  status: 'draft' | 'wip' | 'completed' | 'archived'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

// Status configuration
const statusConfig = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-500/10 text-gray-700 hover:bg-gray-500/20',
    icon: FileText,
  },
  wip: {
    label: 'In Progress',
    color: 'bg-blue-500/10 text-blue-700 hover:bg-blue-500/20',
    icon: Wrench,
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-500/10 text-green-700 hover:bg-green-500/20',
    icon: CheckCircle,
  },
  archived: {
    label: 'Archived',
    color: 'bg-gray-400/10 text-gray-600 hover:bg-gray-400/20',
    icon: Archive,
  },
}

// Size variants
const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
}

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

export function ProjectStatusBadge({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}: ProjectStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon
  const sizeClass = sizeClasses[size]
  const iconSize = iconSizes[size]

  return (
    <Badge
      variant="secondary"
      className={`${config.color} ${sizeClass} ${className} inline-flex items-center gap-1.5 border-0 font-medium`}
    >
      {showIcon && <Icon className={iconSize} />}
      <span>{config.label}</span>
    </Badge>
  )
}
