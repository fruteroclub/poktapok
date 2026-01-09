import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { UserCheck } from 'lucide-react'

interface GuestBadgeProps {
  showTooltip?: boolean
  className?: string
}

/**
 * Badge component to mark submissions/content from guest users.
 * Used to provide transparency about user status in community contributions.
 */
export function GuestBadge({ showTooltip = true, className }: GuestBadgeProps) {
  const badge = (
    <Badge variant="outline" className={className}>
      <UserCheck className="mr-1 h-3 w-3" />
      Guest
    </Badge>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-sm">
            This submission is from a guest user who is earning full membership
            through program participation.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
