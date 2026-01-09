'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, TrendingUp } from 'lucide-react'
import type { ProgramDashboardData } from '@/types/api-v1'

interface PromotionProgressCardProps {
  stats: ProgramDashboardData['stats']
}

// These match the requirements in calculatePromotionEligibility
const REQUIREMENTS = {
  attendance: 5,
  submissions: 3,
  qualityScore: 70,
}

export function PromotionProgressCard({ stats }: PromotionProgressCardProps) {
  const attendanceMet = stats.attendance.present >= REQUIREMENTS.attendance
  const submissionsMet = stats.submissions.approved >= REQUIREMENTS.submissions
  const qualityMet = stats.qualityScore >= REQUIREMENTS.qualityScore

  const isEligible = attendanceMet && submissionsMet && qualityMet

  const attendanceProgress =
    (stats.attendance.present / REQUIREMENTS.attendance) * 100
  const submissionsProgress =
    (stats.submissions.approved / REQUIREMENTS.submissions) * 100
  const qualityProgress = (stats.qualityScore / REQUIREMENTS.qualityScore) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Promotion Progress
          </CardTitle>
          {isEligible ? (
            <Badge variant="default" className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Eligible
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1.5">
              In Progress
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Complete these requirements to earn full membership status.
        </p>

        {/* Attendance Requirement */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Sessions Attended</span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {stats.attendance.present} / {REQUIREMENTS.attendance}
              </span>
              {attendanceMet ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
          <Progress value={Math.min(attendanceProgress, 100)} />
        </div>

        {/* Submissions Requirement */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Approved Submissions</span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {stats.submissions.approved} / {REQUIREMENTS.submissions}
              </span>
              {submissionsMet ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
          <Progress value={Math.min(submissionsProgress, 100)} />
        </div>

        {/* Quality Score Requirement */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Quality Score</span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {stats.qualityScore.toFixed(1)}% / {REQUIREMENTS.qualityScore}%
              </span>
              {qualityMet ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
          <Progress value={Math.min(qualityProgress, 100)} />
        </div>

        {isEligible && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
            <p className="font-medium">🎉 Congratulations!</p>
            <p className="mt-1 text-xs">
              You've met all requirements for full membership. An admin will
              review your progress soon.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
