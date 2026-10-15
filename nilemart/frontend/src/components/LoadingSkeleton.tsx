export function ProductCardSkeleton() {
  return (
    <div className="card p-0 overflow-hidden flex flex-col">
      <div className="w-full aspect-square skeleton" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-20" />
        <div className="skeleton h-5 w-full" />
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-16" />
        <div className="skeleton h-6 w-24" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2 flex-1">
          <div className="skeleton h-5 w-32" />
          <div className="skeleton h-4 w-48" />
        </div>
        <div className="skeleton h-6 w-20" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-3/4" />
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-line">
        <div className="skeleton h-6 w-24" />
        <div className="skeleton h-8 w-28" />
      </div>
    </div>
  );
}

export function DashboardStatSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="skeleton h-10 w-10 rounded-xl" />
        <div className="skeleton h-5 w-12" />
      </div>
      <div className="skeleton h-8 w-32 mb-2" />
      <div className="skeleton h-4 w-24" />
    </div>
  );
}
