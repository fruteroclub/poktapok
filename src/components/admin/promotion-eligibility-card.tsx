'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import type { PromotionEligibility } from '@/lib/promotion/calculate-eligibility'

interface PromotionEligibilityCardProps {
  eligibility: PromotionEligibility
  className?: string
}

/**
 * Admin component that displays a guest user's promotion eligibility
 * with detailed progress indicators for each criterion.
 */
export function PromotionEligibilityCard({
  eligibility,
  className,
}: PromotionEligibilityCardProps) {
  const { isEligible, criteria, reasons } = eligibility

  const attendanceProgress =
    (criteria.attendanceCount / criteria.attendanceRequired) * 100
  const submissionProgress =
    (criteria.submissionCount / criteria.submissionRequired) * 100
  const qualityProgress = (criteria.qualityScore / criteria.qualityRequired) * 100

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Promotion Eligibility</CardTitle>
          {isEligible ? (
            <Badge variant="default" className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Eligible
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              Not Eligible
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Attendance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Attendance</span>
            <span className="text-muted-foreground">
              {criteria.attendanceCount} / {criteria.attendanceRequired} sessions
            </span>
          </div>
          <Progress value={Math.min(attendanceProgress, 100)} />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {criteria.attendanceCount >= criteria.attendanceRequired ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span>
              {criteria.attendanceRequired - criteria.attendanceCount > 0
                ? `${criteria.attendanceRequired - criteria.attendanceCount} more sessions needed`
                : 'Requirement met'}
            </span>
          </div>
        </div>

        {/* Submissions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Approved Submissions</span>
            <span className="text-muted-foreground">
              {criteria.submissionCount} / {criteria.submissionRequired}{' '}
              submissions
            </span>
          </div>
          <Progress value={Math.min(submissionProgress, 100)} />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {criteria.submissionCount >= criteria.submissionRequired ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span>
              {criteria.submissionRequired - criteria.submissionCount > 0
                ? `${criteria.submissionRequired - criteria.submissionCount} more submissions needed`
                : 'Requirement met'}
            </span>
          </div>
        </div>

        {/* Quality Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Quality Score</span>
            <span className="text-muted-foreground">
              {criteria.qualityScore.toFixed(1)}% / {criteria.qualityRequired}%
            </span>
          </div>
          <Progress value={Math.min(qualityProgress, 100)} />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {criteria.qualityScore >= criteria.qualityRequired ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span>
              {criteria.qualityScore < criteria.qualityRequired
                ? `${(criteria.qualityRequired - criteria.qualityScore).toFixed(1)}% improvement needed`
                : 'Requirement met'}
            </span>
          </div>
        </div>

        {/* Reasons (if not eligible) */}
        {!isEligible && reasons.length > 0 && (
          <div className="rounded-lg border border-muted bg-muted/50 p-4">
            <p className="mb-2 text-sm font-medium">Requirements Not Met:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {reasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
