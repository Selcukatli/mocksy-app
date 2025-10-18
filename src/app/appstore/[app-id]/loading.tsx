import { Skeleton } from '@/components/ui/skeleton';

export default function AppStorePageLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-4 pb-8 sm:px-6 min-w-0">
      {/* App Store Preview Card Skeleton */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        {/* Cover Image Skeleton */}
        <div className="relative w-full bg-gradient-to-br from-muted/50 to-muted">
          <Skeleton className="w-full h-64 sm:h-80 md:h-96" />
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-6">
          {/* App Icon and Header */}
          <div className="flex items-start gap-4">
            <Skeleton className="h-20 w-20 rounded-2xl flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>

          {/* Description Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Screenshots Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  className="h-64 w-32 flex-shrink-0 rounded-xl"
                />
              ))}
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-11 flex-1" />
            <Skeleton className="h-11 w-24" />
          </div>
        </div>
      </div>

      {/* Reviews Section Skeleton */}
      <div className="mt-6 rounded-2xl border bg-card p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Rating Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center justify-center gap-2">
              <Skeleton className="h-16 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-2 flex-1" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </div>

          {/* Individual Reviews */}
          <div className="space-y-4 pt-4 border-t">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Similar Apps Carousel Skeleton */}
      <div className="mt-6 space-y-4">
        <Skeleton className="h-7 w-48" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-64 flex-shrink-0 rounded-2xl border bg-card overflow-hidden"
            >
              <Skeleton className="w-full h-40" />
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA Skeleton */}
      <div className="mt-6 rounded-2xl border bg-card p-8">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-96 max-w-full" />
          <Skeleton className="h-11 w-48" />
        </div>
      </div>
    </div>
  );
}

