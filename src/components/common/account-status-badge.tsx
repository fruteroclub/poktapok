import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { UserX, Clock, UserCheck, CheckCircle2, XCircle } from 'lucide-react'
import type { AccountStatus } from '@/types/api-v1'

interface AccountStatusBadgeProps {
  status: AccountStatus
  showTooltip?: boolean
}

const STATUS_CONFIG = {
  incomplete: {
    label: 'Incomplete',
    icon: UserX,
    variant: 'secondary' as const,
    tooltip: 'Profile setup incomplete. Complete your profile to apply.',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    variant: 'outline' as const,
    tooltip: 'Application submitted. Waiting for admin review.',
  },
  guest: {
    label: 'Guest',
    icon: UserCheck,
    variant: 'default' as const,
    tooltip:
      'Guest member with limited access. Earn full membership through program participation.',
  },
  active: {
    label: 'Member',
    icon: CheckCircle2,
    variant: 'default' as const,
    tooltip: 'Full member with complete platform access.',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    variant: 'destructive' as const,
    tooltip: 'Application was not approved.',
  },
} as const

export function AccountStatusBadge({
  status,
  showTooltip = true,
}: AccountStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  const badge = (
    <Badge variant={config.variant} className="gap-1.5">
      <Icon className="h-3.5 w-3.5" />
      {config.label}
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
          <p className="max-w-xs text-sm">{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
