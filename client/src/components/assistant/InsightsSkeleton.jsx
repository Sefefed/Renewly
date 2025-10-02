const shimmer = "animate-pulse bg-slate-100";

const InsightsSkeleton = () => (
  <div className="space-y-6">
    <div
      className={`rounded-2xl border border-slate-200 p-6 shadow-sm ${shimmer}`}
    >
      <div className="mb-4 h-6 w-32 rounded bg-slate-200" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-slate-200" />
        <div className="h-3 w-3/4 rounded bg-slate-200" />
        <div className="h-3 w-5/6 rounded bg-slate-200" />
      </div>
    </div>
    <div
      className={`rounded-2xl border border-slate-200 p-6 shadow-sm ${shimmer}`}
    >
      <div className="mb-4 h-6 w-40 rounded bg-slate-200" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-slate-200" />
        <div className="h-3 w-2/3 rounded bg-slate-200" />
        <div className="h-3 w-4/5 rounded bg-slate-200" />
      </div>
    </div>
    <div
      className={`rounded-2xl border border-slate-200 p-6 shadow-sm ${shimmer}`}
    >
      <div className="mb-4 h-6 w-48 rounded bg-slate-200" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-20 rounded-xl bg-slate-200" />
        ))}
      </div>
    </div>
  </div>
);

export default InsightsSkeleton;
