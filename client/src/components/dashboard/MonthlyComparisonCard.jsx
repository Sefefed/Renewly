import PropTypes from "prop-types";
import { formatCurrency } from "../../utils/formatters";
import { useCurrency } from "../../hooks/useCurrency";

export default function MonthlyComparisonCard({
  comparison,
  showInitialLoader,
}) {
  const { currency } = useCurrency();
  if (!comparison) {
    return null;
  }

  const difference = comparison.difference ?? 0;
  const increase = difference >= 0;
  const percentage = comparison.percentageChange;
  const tone = increase ? "text-rose-500" : "text-emerald-500";

  return (
    <div className="dashboard-card">
      <h2 className="mb-6 text-2xl font-semibold text-primary">
        Monthly Comparison
      </h2>
      {showInitialLoader ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-secondary shadow-sm sm:grid-cols-2">
            <div>
              <p className="mb-1 text-lg uppercase tracking-wide font-semibold text-tertiary">
                {comparison.currentMonth.label}
              </p>
              <p className="text-lg font-semibold text-primary">
                {formatCurrency(comparison.currentMonth.total, currency)}
              </p>
              <p className="mt-2 text-sm ">
                Subscriptions:{" "}
                {formatCurrency(
                  comparison.currentMonth.subscriptions,
                  currency
                )}
              </p>
              <p className="text-sm">
                Bills: {formatCurrency(comparison.currentMonth.bills, currency)}
              </p>
            </div>
            <div>
              <p className="mb-1 text-lg font-semibold uppercase tracking-wide text-tertiary">
                {comparison.previousMonth.label}
              </p>
              <p className="text-lg font-semibold text-primary">
                {formatCurrency(comparison.previousMonth.total, currency)}
              </p>
              <p className="mt-2 text-sm">
                Subscriptions:{" "}
                {formatCurrency(
                  comparison.previousMonth.subscriptions,
                  currency
                )}
              </p>
              <p className="text-sm ">
                Bills:{" "}
                {formatCurrency(comparison.previousMonth.bills, currency)}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">
                  {increase ? "Spending increased" : "Spending decreased"}
                </p>
                <p className={`mt-2 text-xl font-semibold ${tone}`}>
                  {formatCurrency(Math.abs(difference), currency)}{" "}
                  {increase ? "higher" : "lower"} than last month
                </p>
                {percentage !== null && (
                  <p className="mt-1 text-xs text-tertiary">
                    Change of {Math.abs(percentage).toFixed(2)}%
                  </p>
                )}
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
