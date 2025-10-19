export default function AdminSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-40 h-8 bg-muted/50 rounded-lg animate-pulse" />
        <div className="w-48 h-8 bg-muted/50 rounded-lg animate-pulse" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-xl border p-4">
            <div className="h-4 w-24 bg-muted/50 rounded animate-pulse" />
            <div className="h-8 w-16 bg-muted/50 rounded animate-pulse mt-2" />
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="bg-card rounded-xl border p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 bg-muted/50 rounded animate-pulse" />
          <div className="w-16 h-4 bg-muted/50 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-muted/30 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3">
                  <div className="h-4 w-12 bg-muted/50 rounded animate-pulse" />
                </th>
                <th className="px-4 py-3">
                  <div className="h-4 w-16 bg-muted/50 rounded animate-pulse" />
                </th>
                <th className="px-4 py-3">
                  <div className="h-4 w-20 bg-muted/50 rounded animate-pulse" />
                </th>
                <th className="px-4 py-3">
                  <div className="h-4 w-16 bg-muted/50 rounded animate-pulse" />
                </th>
                <th className="px-4 py-3">
                  <div className="h-4 w-20 bg-muted/50 rounded animate-pulse" />
                </th>
                <th className="px-4 py-3">
                  <div className="h-4 w-16 bg-muted/50 rounded animate-pulse" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  {/* App Icon + Name */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted/50" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-muted/50 rounded" />
                        <div className="h-3 w-20 bg-muted/50 rounded" />
                      </div>
                    </div>
                  </td>

                  {/* Cover */}
                  <td className="px-4 py-4">
                    <div className="w-20 h-14 rounded-lg bg-muted/50" />
                  </td>

                  {/* Category */}
                  <td className="px-4 py-4">
                    <div className="h-4 w-24 bg-muted/50 rounded" />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <div className="h-6 w-20 bg-muted/50 rounded-full" />
                  </td>

                  {/* Featured */}
                  <td className="px-4 py-4">
                    <div className="h-6 w-24 bg-muted/50 rounded-full" />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-8 h-8 bg-muted/50 rounded-lg" />
                      <div className="w-8 h-8 bg-muted/50 rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

