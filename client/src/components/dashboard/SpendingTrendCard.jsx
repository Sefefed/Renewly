import PropTypes from "prop-types";
import FilterTabs from "../ui/FilterTabs";
import { LineChart } from "../Charts";

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

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-7 shadow-2xl border border-gray-700/30 backdrop-blur-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Spending Trend
          </h2>
          <p className="text-sm text-gray-400">
            Track how your spending evolves over time.
          </p>
        </div>
        <FilterTabs
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
          isLoading={isLoading}
        />
      </div>

      <div className="mt-6">
        {error ? (
          <div className="flex h-72 flex-col items-center justify-center gap-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200">
            <p className="text-sm font-medium text-center">
              Unable to load enhanced insights: {error}
            </p>
            <button
              onClick={onRetry}
              className="rounded-lg border border-red-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-red-100 transition hover:border-red-400 hover:text-red-50"
            >
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex h-72 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : hasData ? (
          <LineChart data={data} height={320} />
        ) : (
          <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-gray-700 text-sm text-gray-400">
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
