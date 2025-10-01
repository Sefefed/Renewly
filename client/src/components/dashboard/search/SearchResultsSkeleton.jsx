const SearchResultsSkeleton = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`search-skeleton-${index}`}
          className="flex items-center justify-between rounded-2xl border border-gray-700/50 bg-gray-800/70 p-5"
        >
          <div className="flex items-center gap-4 w-full">
            <div className="h-12 w-12 rounded-xl bg-size-200 animate-shimmer"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 w-44 rounded-lg bg-size-200 animate-shimmer"></div>
              <div className="h-3 w-32 rounded-lg bg-size-200 animate-shimmer"></div>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-2">
            <div className="h-4 w-24 rounded-lg bg-size-200 animate-shimmer"></div>
            <div className="h-3 w-20 rounded-lg bg-size-200 animate-shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResultsSkeleton;
