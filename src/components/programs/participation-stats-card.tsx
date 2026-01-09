import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, FileText, Award } from 'lucide-react'
import type { ProgramDashboardData } from '@/types/api-v1'

interface ParticipationStatsCardProps {
  stats: ProgramDashboardData['stats']
}

export function ParticipationStatsCard({ stats }: ParticipationStatsCardProps) {
  const attendancePercentage =
    stats.attendance.total > 0
      ? (stats.attendance.present / stats.attendance.total) * 100
      : 0

  const submissionApprovalRate =
    stats.submissions.total > 0
      ? (stats.submissions.approved / stats.submissions.total) * 100
      : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Your Participation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Attendance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="font-medium">Sessions Attended</span>
            </div>
            <span className="text-muted-foreground">
              {stats.attendance.present} / {stats.attendance.total}
            </span>
          </div>
          <Progress value={attendancePercentage} />
          <p className="text-xs text-muted-foreground">
            {attendancePercentage.toFixed(0)}% attendance rate
          </p>
        </div>

        {/* Submissions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Submissions</span>
            </div>
            <span className="text-muted-foreground">
              {stats.submissions.approved} approved
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total: {stats.submissions.total}</span>
            <span>Pending: {stats.submissions.pending}</span>
          </div>
          <Progress value={submissionApprovalRate} />
          <p className="text-xs text-muted-foreground">
            {submissionApprovalRate.toFixed(0)}% approval rate
          </p>
        </div>

        {/* Quality Score */}
        {stats.submissions.approved > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">Quality Score</span>
              </div>
              <span className="text-muted-foreground">
                {stats.qualityScore.toFixed(1)}%
              </span>
            </div>
            <Progress value={stats.qualityScore} />
            <p className="text-xs text-muted-foreground">
              Average score from approved submissions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
