/**
 * ProjectHeader Component
 *
 * Displays project title, badges, metadata, and owner actions
 * Used in the individual project view page
 */

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, Eye, Calendar, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { useDeleteProject } from '@/hooks/use-projects'
import type { ProjectWithSkills } from '@/types/api-v1'

interface ProjectHeaderProps {
  project: ProjectWithSkills
  isOwner?: boolean
}

export function ProjectHeader({
  project,
  isOwner = false,
}: ProjectHeaderProps) {
  const router = useRouter()
  const deleteProjectMutation = useDeleteProject()

  const {
    id,
    title,
    description,
    logoUrl,
    projectType,
    projectStatus,
    viewCount,
    createdAt,
    updatedAt,
    featured,
  } = project

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

  // Format dates
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleDelete = async () => {
    try {
      await deleteProjectMutation.mutateAsync(id)
      toast.success('Project deleted successfully')
      router.push('/portfolio')
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to delete project')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Back button and owner actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/portfolio">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portfolio
          </Link>
        </Button>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/portfolio/${id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Project
              </Link>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your project &quot;{title}&quot; and remove all associated
                    data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Project
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Project header content */}
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Logo */}
        {logoUrl && (
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl border bg-gray-100">
            <Image
              src={logoUrl}
              alt={`${title} logo`}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Title and metadata */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* Title and badges */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-start gap-3">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {title}
              </h1>
              {featured && <Badge variant="secondary">Featured</Badge>}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{typeLabel}</Badge>
              <Badge className={`text-white ${statusColors[projectStatus]}`}>
                {projectStatus.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <p className="text-lg leading-relaxed text-muted-foreground">
            {description}
          </p>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              <span>{viewCount.toLocaleString()} views</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDate(createdAt)}</span>
            </div>
            {updatedAt &&
              new Date(updatedAt).getTime() !==
                new Date(createdAt).getTime() && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>Updated {formatDate(updatedAt)}</span>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
