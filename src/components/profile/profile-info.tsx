import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Code2, Coins, Shield } from 'lucide-react'

interface ProfileInfoProps {
  learningTracks: ('ai' | 'crypto' | 'privacy')[] | null
  availabilityStatus: 'available' | 'open_to_offers' | 'unavailable' | null
  projectsCount: number
  totalEarningsUsd: number
  canViewData: boolean
}

const learningTrackConfig = {
  ai: {
    label: 'Code: AI',
    icon: Code2,
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  },
  crypto: {
    label: 'Crypto/DeFi',
    icon: Coins,
    color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  },
  privacy: {
    label: 'Privacy',
    icon: Shield,
    color: 'bg-green-500/10 text-green-700 dark:text-green-400',
  },
}

const availabilityConfig = {
  available: {
    label: 'Available',
    color: 'bg-green-500/10 text-green-700 dark:text-green-400',
    dot: '🟢',
  },
  open_to_offers: {
    label: 'Open to Offers',
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    dot: '🔵',
  },
  unavailable: {
    label: 'Unavailable',
    color: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
    dot: '⚫',
  },
}

export function ProfileInfo({
  learningTracks,
  availabilityStatus,
  projectsCount,
  totalEarningsUsd,
  canViewData,
}: ProfileInfoProps) {
  // Don't render if can't view data
  if (!canViewData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            This profile is private. Sign in to view more details.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Learning Tracks */}
      {learningTracks && learningTracks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Learning Tracks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {learningTracks.map((track) => {
                const config = learningTrackConfig[track]
                const Icon = config.icon

                return (
                  <Badge
                    key={track}
                    variant="secondary"
                    className={config.color}
                  >
                    <Icon className="mr-1 h-3 w-3" />
                    {config.label}
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Availability Status */}
      {availabilityStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant="secondary"
              className={availabilityConfig[availabilityStatus].color}
            >
              <span className="mr-1">
                {availabilityConfig[availabilityStatus].dot}
              </span>
              {availabilityConfig[availabilityStatus].label}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {(projectsCount > 0 || totalEarningsUsd > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Completed Bounties
              </span>
              <span className="font-semibold">{projectsCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total Earnings
              </span>
              <span className="font-semibold">
                ${totalEarningsUsd.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
