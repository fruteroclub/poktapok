import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, UserX, Calendar, CalendarCheck, Activity, TrendingUp } from 'lucide-react'
import type { ProgramWithStats } from '@/types/api-v1'

interface ProgramStatsGridProps {
  stats: ProgramWithStats['stats']
}

export function ProgramStatsGrid({ stats }: ProgramStatsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Enrollments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.activeEnrollments} active, {stats.completedEnrollments} completed
          </p>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageCompletionRate}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.completedEnrollments} of {stats.totalEnrollments} students
          </p>
        </CardContent>
      </Card>

      {/* Total Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sessions</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSessions}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.completedSessions} completed, {stats.upcomingSessions} upcoming
          </p>
        </CardContent>
      </Card>

      {/* Total Activities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activities</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalActivities}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.directActivities} direct, {stats.transitiveActivities} via sessions
          </p>
        </CardContent>
      </Card>

      {/* Active Enrollments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Students</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeEnrollments}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Currently enrolled
          </p>
        </CardContent>
      </Card>

      {/* Completed Enrollments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Graduated Students</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedEnrollments}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Successfully completed
          </p>
        </CardContent>
      </Card>

      {/* Dropped Enrollments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dropped Students</CardTitle>
          <UserX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.droppedEnrollments}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Left the program
          </p>
        </CardContent>
      </Card>

      {/* Completed Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sessions Held</CardTitle>
          <CalendarCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedSessions}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Already conducted
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
