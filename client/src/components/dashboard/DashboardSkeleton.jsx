import Navigation from "../Navigation";
import SkeletonCard from "../ui/SkeletonCard";
import StaggerContainer from "../ui/StaggerContainer";

const DashboardSkeleton = () => {
  const listSkeletons = Array.from({ length: 3 });
  const sidebarSkeletons = Array.from({ length: 2 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-800">
      <Navigation />

      <header className="border-b border-slate-200/80 bg-white/80 px-8 py-6 backdrop-blur">
        <div className="space-y-3 max-w-7xl mx-auto animate-pulse">
          <div className="h-8 w-56 rounded-xl bg-slate-200/80 bg-size-200 animate-shimmer"></div>
          <div className="h-4 w-40 rounded-lg bg-slate-200/80 bg-size-200 animate-shimmer"></div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-8 py-8 pt-20 space-y-12">
        <section>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StaggerContainer>
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonCard key={`kpi-skeleton-${index}`} />
              ))}
            </StaggerContainer>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-96 rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-7 shadow-sm animate-pulse">
              <div className="h-6 w-48 rounded-lg bg-slate-200/80 bg-size-200 animate-shimmer mb-8"></div>
              <div className="h-64 rounded-2xl bg-slate-200/80 bg-size-200 animate-shimmer"></div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-7 shadow-sm animate-pulse">
              <div className="h-6 w-56 rounded-lg bg-slate-200/80 bg-size-200 animate-shimmer mb-6"></div>
              <div className="space-y-5">
                {listSkeletons.map((_, index) => (
                  <div
                    key={`renewal-skeleton-${index}`}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-white/80 p-4 border border-slate-200/70"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-slate-200/80 bg-size-200 animate-shimmer"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-32 rounded-lg bg-slate-200/80 bg-size-200 animate-shimmer"></div>
                        <div className="h-3 w-24 rounded-lg bg-slate-200/80 bg-size-200 animate-shimmer"></div>
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      <div className="h-4 w-16 rounded-lg bg-slate-200/80 bg-size-200 animate-shimmer"></div>
                      <div className="h-3 w-20 rounded-lg bg-slate-200/80 bg-size-200 animate-shimmer"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="h-72 rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-7 shadow-sm animate-pulse">
              <div className="h-6 w-44 rounded-lg bg-slate-200/80 bg-size-200 animate-shimmer mb-6"></div>
              <div className="h-48 rounded-2xl bg-slate-200/80 bg-size-200 animate-shimmer"></div>
            </div>

            {sidebarSkeletons.map((_, index) => (
              <div
                key={`sidebar-skeleton-${index}`}
                className="space-y-5 rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-7 shadow-sm animate-pulse"
              >
                <div className="h-6 w-48 rounded-lg bg-slate-200/80 bg-size-200 animate-shimmer"></div>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((__, subIndex) => (
                    <div
                      key={`sidebar-item-${index}-${subIndex}`}
                      className="h-14 rounded-2xl bg-slate-200/80 bg-size-200 animate-shimmer"
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardSkeleton;
