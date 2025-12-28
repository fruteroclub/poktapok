/**
 * ProjectCard Component
 *
 * List item display for projects
 * Shows title, description, skills, type, status, and stats
 */

import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, Github, Video, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ProjectWithSkills } from '@/types/api-v1';

interface ProjectCardProps {
  project: ProjectWithSkills;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ProjectCard({ project, showActions = false, onEdit, onDelete }: ProjectCardProps) {
  const { id, title, description, logoUrl, projectType, projectStatus, skills, viewCount } = project;
  const { liveUrl, repositoryUrl, videoUrl, featured } = project;

  // Format project type for display
  const typeLabel = projectType.split('-').map((word) =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  // Status colors
  const statusColors: Record<string, string> = {
    draft: 'bg-gray-500',
    wip: 'bg-blue-500',
    completed: 'bg-green-500',
    archived: 'bg-gray-400',
  };

  return (
    <Link href={`/portfolio/${id}`} className="block group">
      <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg group-hover:border-primary">
        {/* Header with logo and title */}
        <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {logoUrl && (
              <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={logoUrl}
                  alt={`${title} logo`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-lg truncate">{title}</CardTitle>
                {featured && (
                  <Badge variant="secondary" className="text-xs">
                    Featured
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {typeLabel}
                </Badge>
                <Badge className={`text-xs text-white ${statusColors[projectStatus]}`}>
                  {projectStatus.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Content with description and skills */}
      <CardContent className="flex-1 space-y-3">
        <CardDescription className="line-clamp-3">{description}</CardDescription>

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
        <div className="flex items-center gap-2 flex-wrap">
          {repositoryUrl && (
            <Link
              href={repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <Github className="w-4 h-4" />
              <span>Code</span>
            </Link>
          )}
          {liveUrl && (
            <Link
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Live</span>
            </Link>
          )}
          {videoUrl && (
            <Link
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <Video className="w-4 h-4" />
              <span>Video</span>
            </Link>
          )}
        </div>
      </CardContent>

      {/* Footer with view count and actions */}
      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Eye className="w-4 h-4" />
          <span>{viewCount} views</span>
        </div>

        {showActions && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(id);
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
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(id);
                }}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </CardFooter>
      </Card>
    </Link>
  );
}
