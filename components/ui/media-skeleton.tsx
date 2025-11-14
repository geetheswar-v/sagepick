import { Skeleton } from "@/components/ui/skeleton";

interface MediaSectionSkeletonProps {
  cardCount?: number;
}

export function MediaSectionSkeleton({ cardCount = 6 }: MediaSectionSkeletonProps) {
  return (
    <section className="py-8 space-y-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title Skeleton */}
        <Skeleton className="h-8 w-48 mb-6" />
        
        {/* Horizontal Scroll Container */}
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: cardCount }).map((_, index) => (
            <MediaCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function MediaCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-48 space-y-3">
      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
      <Skeleton className="h-4 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
