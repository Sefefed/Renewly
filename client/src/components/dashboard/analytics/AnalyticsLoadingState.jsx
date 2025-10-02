import SkeletonCard from "../../ui/SkeletonCard";

const AnalyticsLoadingState = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonCard key={`insight-skeleton-${index}`} lines={3} />
      ))}
    </div>
    <SkeletonCard lines={4} className="h-96" />
  </div>
);

export default AnalyticsLoadingState;
