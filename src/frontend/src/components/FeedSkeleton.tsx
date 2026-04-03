import { Skeleton } from "@/components/ui/skeleton";

export function FeedSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {(["a", "b", "c"] as const).map((k) => (
        <div key={`skeleton-${k}`} className="flex gap-3">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
