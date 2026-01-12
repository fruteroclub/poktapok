/**
 * ProjectCard Component
 *
 * List item display for projects
 * Shows title, description, skills, type, status, and stats
 */

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ExternalLink, Github, Video, Eye } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ProjectWithSkills } from '@/types/api-v1'

interface ProjectCardProps {
  project: ProjectWithSkills
  showActions?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function ProjectCard({
  project,
  showActions = false,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const router = useRouter()
  const {
    id,
    title,
    description,
    logoUrl,
    projectType,
    projectStatus,
    skills,
    viewCount,
  } = project
  const { liveUrl, repositoryUrl, videoUrl, featured } = project

  // Format project type for display
  const typeLabel = projectType
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  // Status colors
  const statusColors: Record<string, string> = {
    draft: 'bg-gray-500',
    wip: 'bg-blue-500',
    completed: 'bg-green-500',
    archived: 'bg-gray-400',
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if clicking the card itself, not links/buttons
    if ((e.target as HTMLElement).closest('a, button')) {
      return
    }
    router.push(`/portfolio/${id}`)
  }

  return (
    <div className="group block h-full">
      <Card
        className="flex h-full cursor-pointer flex-col overflow-hidden transition-all group-hover:border-primary hover:shadow-lg"
        onClick={handleCardClick}
      >
        {/* Header with logo and title */}
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              {logoUrl && (
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={logoUrl}
                    alt={`${title} logo`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="truncate text-lg">{title}</CardTitle>
                  {featured && (
                    <Badge variant="secondary" className="text-xs">
                      Featured
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {typeLabel}
                  </Badge>
                  <Badge
                    className={`text-xs text-white ${statusColors[projectStatus]}`}
                  >
                    {projectStatus.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Content with description and skills */}
        <CardContent className="flex-1 space-y-3">
          <CardDescription className="line-clamp-3">
            {description}
          </CardDescription>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 5).map((skill) => (
                <Badge key={skill.id} variant="secondary" className="text-xs">
                  {skill.name}
                </Badge>
              ))}
              {skills.length > 5 && (
                <Badge variant="secondary" className="text-xs">
                  +{skills.length - 5}
                </Badge>
              )}
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap items-center gap-2">
            {repositoryUrl && (
              <Link
                href={repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <Github className="h-4 w-4" />
                <span>Code</span>
              </Link>
            )}
            {liveUrl && (
              <Link
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Live</span>
              </Link>
            )}
            {videoUrl && (
              <Link
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <Video className="h-4 w-4" />
                <span>Video</span>
              </Link>
            )}
          </div>
        </CardContent>

        {/* Footer with view count and actions */}
        <CardFooter className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>{viewCount} views</span>
          </div>

          {showActions && (
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onEdit(id)
                  }}
                >
                  Edit
                </Button>
              )}
              {onDelete && projectStatus === 'draft' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onDelete(id)
                  }}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
