export default function TableSkeleton() {
  return (
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
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <tr key={i}>
                {/* App Icon + Name */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted/50 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted/50 rounded animate-pulse" />
                      <div className="h-3 w-20 bg-muted/50 rounded animate-pulse" />
                    </div>
                  </div>
                </td>

                {/* Cover */}
                <td className="px-4 py-4">
                  <div className="w-20 h-14 rounded-lg bg-muted/50 animate-pulse" />
                </td>

                {/* Category */}
                <td className="px-4 py-4">
                  <div className="h-4 w-24 bg-muted/50 rounded animate-pulse" />
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <div className="h-6 w-20 bg-muted/50 rounded-full animate-pulse" />
                </td>

                {/* Featured */}
                <td className="px-4 py-4">
                  <div className="h-6 w-24 bg-muted/50 rounded-full animate-pulse" />
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-8 h-8 bg-muted/50 rounded-lg animate-pulse" />
                    <div className="w-8 h-8 bg-muted/50 rounded-lg animate-pulse" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

