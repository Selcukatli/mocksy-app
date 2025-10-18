export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        {/* Featured Apps Carousel Skeleton */}
        <div className="w-full h-[380px] md:h-[450px] rounded-3xl overflow-hidden bg-gray-200 dark:bg-gray-900/40 animate-pulse">
          <div className="w-full h-full flex items-end p-8 md:p-12">
            <div className="space-y-4 w-full max-w-2xl">
              <div className="h-10 w-3/4 bg-gray-300 dark:bg-gray-800/60 rounded-lg" />
              <div className="h-6 w-1/2 bg-gray-300 dark:bg-gray-800/60 rounded-lg" />
              <div className="flex gap-2 mt-6">
                <div className="h-10 w-32 bg-gray-300 dark:bg-gray-800/60 rounded-full" />
                <div className="h-10 w-10 bg-gray-300 dark:bg-gray-800/60 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="w-full h-12 rounded-xl bg-gray-200 dark:bg-gray-900/40 animate-pulse" />

        {/* Category Carousels Skeleton */}
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between px-2">
                <div className="h-7 w-32 bg-gray-200 dark:bg-gray-900/40 rounded animate-pulse" />
                <div className="h-5 w-16 bg-gray-200 dark:bg-gray-900/40 rounded animate-pulse" />
              </div>
              {/* Carousel Items */}
              <div className="flex gap-6 overflow-hidden">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div
                    key={j}
                    className="w-[400px] md:w-[500px] flex-shrink-0 space-y-1"
                  >
                    {Array.from({ length: 3 }).map((_, k) => (
                      <div
                        key={k}
                        className="w-full flex items-center gap-4 p-4 rounded-xl animate-pulse"
                      >
                        {/* Icon */}
                        <div className="h-16 w-16 md:h-20 md:w-20 flex-shrink-0 rounded-[22%] bg-gray-200 dark:bg-gray-900/40" />
                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-900/40 rounded" />
                          <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800/40 rounded" />
                        </div>
                        {/* Button */}
                        <div className="flex-shrink-0">
                          <div className="h-9 w-20 rounded-full bg-gray-200 dark:bg-gray-900/40" />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

