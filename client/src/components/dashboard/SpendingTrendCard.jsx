import { useMemo } from "react";
import PropTypes from "prop-types";
import FilterTabs from "../ui/FilterTabs";
import { BarChart } from "../Charts";

const buildGradient = (color, fallback) =>
  Array.isArray(color) ? color : [color ?? fallback];

export default function SpendingTrendCard({
  filters,
  activeFilter,
  onFilterChange,
  isLoading,
  error,
  data,
  onRetry,
}) {
  const hasData = (data?.length ?? 0) > 0;

  const chartData = useMemo(() => {
    if (!hasData) return null;

    const labels = data.map((item) => item.month);

    return {
      labels,
      datasets: [
        {
          label: "Total Spending",
          data: data.map((item) => item.spending ?? 0),
          backgroundColor: buildGradient(
            "rgba(59, 130, 246, 0.85)",
            "rgba(59, 130, 246, 0.7)"
          ),
          borderColor: "rgba(255, 255, 255, 0.06)",
          borderWidth: 1.5,
          borderRadius: 10,
          maxBarThickness: 42,
          hoverBackgroundColor: "rgba(59, 130, 246, 0.95)",
        },
        {
          label: "Subscriptions",
          data: data.map((item) => item.subscriptions ?? 0),
          backgroundColor: buildGradient(
            "rgba(16, 185, 129, 0.8)",
            "rgba(16, 185, 129, 0.7)"
          ),
          borderColor: "rgba(255, 255, 255, 0.06)",
          borderWidth: 1.5,
          borderRadius: 10,
          maxBarThickness: 42,
          hoverBackgroundColor: "rgba(16, 185, 129, 0.9)",
        },
        {
          label: "Bills",
          data: data.map((item) => item.bills ?? 0),
          backgroundColor: buildGradient(
            "rgba(245, 158, 11, 0.75)",
            "rgba(245, 158, 11, 0.65)"
          ),
          borderColor: "rgba(255, 255, 255, 0.06)",
          borderWidth: 1.5,
          borderRadius: 10,
          maxBarThickness: 42,
          hoverBackgroundColor: "rgba(245, 158, 11, 0.9)",
        },
      ],
    };
  }, [data, hasData]);

  return (
    <div className="dashboard-card">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-primary">
            Spending Trend
          </h2>
          <p className="text-sm text-secondary">
            Visualize how subscriptions and bills stack up across each period.
          </p>
        </div>
        <FilterTabs
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
          isLoading={isLoading}
          variant="dark"
        />
      </div>

      <div className="mt-6">
        {error ? (
          <div className="flex h-72 flex-col items-center justify-center gap-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-600">
            <p className="text-center text-sm font-medium">
              Unable to load enhanced insights: {error}
            </p>
            <button
              onClick={onRetry}
              className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-600 transition hover:bg-rose-100 hover:text-rose-700"
            >
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex h-72 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : hasData ? (
          <BarChart chartData={chartData} chartType="grouped" height={320} />
        ) : (
          <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-secondary">
            No trend data available yet. Add subscriptions or bills to get
            started.
          </div>
        )}
      </div>
    </div>
  );
}

SpendingTrendCard.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  activeFilter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string,
      spending: PropTypes.number,
      subscriptions: PropTypes.number,
      bills: PropTypes.number,
    })
  ),
  onRetry: PropTypes.func,
};

SpendingTrendCard.defaultProps = {
  isLoading: false,
  error: null,
  data: [],
  onRetry: undefined,
};
