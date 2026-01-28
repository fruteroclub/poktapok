import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function SkeletonCard() {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex min-w-0 items-start gap-4">
          <Skeleton className="h-16 w-16 shrink-0 rounded-full" />

          <div className="min-w-0 flex-1 space-y-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32 max-w-full" />
              <Skeleton className="h-4 w-24 max-w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 max-w-full" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
