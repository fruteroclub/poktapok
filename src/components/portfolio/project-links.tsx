/**
 * ProjectLinks Component
 *
 * Displays project repository, live demo, and video links
 * Used in the individual project view page
 */

import { ExternalLink, Github, Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ProjectLinksProps {
  repositoryUrl?: string | null
  liveUrl?: string | null
  videoUrl?: string | null
}

export function ProjectLinks({
  repositoryUrl,
  liveUrl,
  videoUrl,
}: ProjectLinksProps) {
  // If no links, don't render the component
  if (!repositoryUrl && !liveUrl && !videoUrl) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <ExternalLink className="h-5 w-5" />
          Links
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {repositoryUrl && (
            <Button
              variant="outline"
              size="lg"
              asChild
              className="flex items-center gap-2"
            >
              <a
                href={repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline"
              >
                <Github className="h-5 w-5" />
                <span>Repository</span>
                <ExternalLink className="ml-1 h-4 w-4 opacity-50" />
              </a>
            </Button>
          )}

          {liveUrl && (
            <Button
              variant="outline"
              size="lg"
              asChild
              className="flex items-center gap-2"
            >
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline"
              >
                <ExternalLink className="h-5 w-5" />
                <span>Live Demo</span>
                <ExternalLink className="ml-1 h-4 w-4 opacity-50" />
              </a>
            </Button>
          )}

          {videoUrl && (
            <Button
              variant="outline"
              size="lg"
              asChild
              className="flex items-center gap-2"
            >
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline"
              >
                <Video className="h-5 w-5" />
                <span>Video Demo</span>
                <ExternalLink className="ml-1 h-4 w-4 opacity-50" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
