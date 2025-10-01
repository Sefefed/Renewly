import FadeIn from "../../components/ui/FadeIn";
import SpendingTrendCard from "../../components/dashboard/SpendingTrendCard";
import UpcomingRenewalsCard from "../../components/dashboard/UpcomingRenewalsCard";
import CategoryBreakdownCard from "../../components/dashboard/CategoryBreakdownCard";

const DashboardPrimaryColumn = ({
  insights,
  api,
  timeRange,
  setTimeRange,
  filters,
  enhancedLoading,
  enhancedError,
  enhancedInsights,
  fetchEnhancedInsights,
  categoryBreakdown,
}) => (
  <div className="space-y-8 lg:col-span-2">
    <FadeIn delay={0.22} className="w-full">
      <SpendingTrendCard
        filters={filters}
        activeFilter={timeRange}
        onFilterChange={setTimeRange}
        isLoading={enhancedLoading}
        error={enhancedError}
        data={enhancedInsights?.spendingTrend}
        onRetry={() => fetchEnhancedInsights(timeRange)}
      />
    </FadeIn>

    <FadeIn delay={0.28} className="w-full">
      <UpcomingRenewalsCard renewals={insights.upcomingRenewals} api={api} />
    </FadeIn>

    <FadeIn delay={0.34} className="w-full">
      <CategoryBreakdownCard
        breakdown={categoryBreakdown}
        isLoading={enhancedLoading}
      />
    </FadeIn>
  </div>
);

export default DashboardPrimaryColumn;
