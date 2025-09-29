import PropTypes from "prop-types";
import { formatCurrency } from "../../utils/formatters";

export default function MonthlyComparisonCard({
  comparison,
  showInitialLoader,
}) {
  if (!comparison) {
    return null;
  }

  const difference = comparison.difference ?? 0;
  const increase = difference >= 0;
  const percentage = comparison.percentageChange;
  const icon = increase ? "⬆️" : "⬇️";
  const tone = increase ? "text-red-400" : "text-green-400";
  const pillBg = increase
    ? "bg-red-500/10 border-red-500/30"
    : "bg-green-500/10 border-green-500/30";

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-7 shadow-2xl border border-gray-700/30 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        Monthly Comparison
      </h2>
      {showInitialLoader ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-700/40 bg-gray-900/50 p-4 text-sm text-gray-300 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">
                {comparison.currentMonth.label}
              </p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(comparison.currentMonth.total)}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Subscriptions:{" "}
                {formatCurrency(comparison.currentMonth.subscriptions)}
              </p>
              <p className="text-xs text-gray-400">
                Bills: {formatCurrency(comparison.currentMonth.bills)}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">
                {comparison.previousMonth.label}
              </p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(comparison.previousMonth.total)}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Subscriptions:{" "}
                {formatCurrency(comparison.previousMonth.subscriptions)}
              </p>
              <p className="text-xs text-gray-400">
                Bills: {formatCurrency(comparison.previousMonth.bills)}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-gray-700/40 bg-gray-900/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">
                  {increase ? "Spending increased" : "Spending decreased"}
                </p>
                <p className={`mt-2 text-xl font-semibold ${tone}`}>
                  {formatCurrency(Math.abs(difference))}{" "}
                  {increase ? "higher" : "lower"} than last month
                </p>
                {percentage !== null && (
                  <p className="mt-1 text-xs text-gray-400">
                    Change of {Math.abs(percentage).toFixed(2)}%
                  </p>
                )}
              </div>
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full border ${pillBg}`}
              >
                <span className="text-xl">{icon}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

MonthlyComparisonCard.propTypes = {
  comparison: PropTypes.shape({
    currentMonth: PropTypes.shape({
      label: PropTypes.string,
      total: PropTypes.number,
      subscriptions: PropTypes.number,
      bills: PropTypes.number,
    }),
    previousMonth: PropTypes.shape({
      label: PropTypes.string,
      total: PropTypes.number,
      subscriptions: PropTypes.number,
      bills: PropTypes.number,
    }),
    difference: PropTypes.number,
    percentageChange: PropTypes.number,
  }),
  showInitialLoader: PropTypes.bool,
};

MonthlyComparisonCard.defaultProps = {
  comparison: null,
  showInitialLoader: false,
};
