import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 min-w-0">
          <Skeleton className="h-16 w-16 rounded-full shrink-0" />

          <div className="flex-1 space-y-3 min-w-0">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32 max-w-full" />
              <Skeleton className="h-4 w-24 max-w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 max-w-full" />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
