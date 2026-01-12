import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Tag } from 'lucide-react'
import { format } from 'date-fns'
import type { ProgramWithStats } from '@/types/api-v1'

interface ProgramOverviewCardProps {
  program: ProgramWithStats
}

export function ProgramOverviewCard({ program }: ProgramOverviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Program Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Program Type */}
          <div className="flex items-start gap-3">
            <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Program Type</p>
              <Badge variant={program.programType === 'cohort' ? 'default' : 'secondary'} className="mt-1">
                {program.programType === 'cohort' ? 'Cohort' : 'Evergreen'}
              </Badge>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={program.isActive ? 'default' : 'destructive'} className="mt-1">
                {program.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          {/* Start Date */}
          {program.startDate && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                <p className="text-base font-medium">
                  {format(new Date(program.startDate), 'PPP')}
                </p>
              </div>
            </div>
          )}

          {/* End Date */}
          {program.endDate && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">End Date</p>
                <p className="text-base font-medium">
                  {format(new Date(program.endDate), 'PPP')}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
