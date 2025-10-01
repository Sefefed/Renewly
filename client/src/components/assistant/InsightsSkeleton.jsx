const shimmer = "animate-pulse bg-gray-700/60";

const InsightsSkeleton = () => (
  <div className="space-y-6">
    <div className={`rounded-2xl border border-gray-700/40 p-6 ${shimmer}`}>
      <div className="mb-4 h-6 w-32 rounded bg-gray-600/60" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-gray-600/50" />
        <div className="h-3 w-3/4 rounded bg-gray-600/40" />
        <div className="h-3 w-5/6 rounded bg-gray-600/40" />
      </div>
    </div>
    <div className={`rounded-2xl border border-gray-700/40 p-6 ${shimmer}`}>
      <div className="mb-4 h-6 w-40 rounded bg-gray-600/60" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-gray-600/50" />
        <div className="h-3 w-2/3 rounded bg-gray-600/40" />
        <div className="h-3 w-4/5 rounded bg-gray-600/30" />
      </div>
    </div>
    <div className={`rounded-2xl border border-gray-700/40 p-6 ${shimmer}`}>
      <div className="mb-4 h-6 w-48 rounded bg-gray-600/60" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-20 rounded-xl bg-gray-600/40" />
        ))}
      </div>
    </div>
  </div>
);

export default InsightsSkeleton;
