import PropTypes from "prop-types";
import { formatCurrency } from "../../../utils/formatters";

const AnalyticsHabitsSummary = ({ habits, currency }) => {
  if (!habits) return null;

  const frequencyEntries = Object.entries(habits.byFrequency ?? {});

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="dashboard-card dashboard-card--compact">
        <p className="text-xs uppercase tracking-[0.25em] text-tertiary">
          Active habits
        </p>
        <p className="mt-3 text-2xl font-semibold text-primary">
          {habits.active}/{habits.total}
        </p>
        <p className="mt-2 text-sm text-secondary">
          Average price {formatCurrency(habits.averagePrice ?? 0, currency)}
        </p>
      </div>
      <div className="dashboard-card dashboard-card--compact">
        <p className="text-xs uppercase tracking-[0.25em] text-tertiary">
          Frequency mix
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-secondary">
          {frequencyEntries.length ? (
            frequencyEntries.map(([frequency, count]) => (
              <span
                key={frequency}
                className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-blue-600"
              >
                {frequency}: {count}
              </span>
            ))
          ) : (
            <span className="text-tertiary">No usage data</span>
          )}
        </div>
      </div>
    </div>
  );
};

AnalyticsHabitsSummary.propTypes = {
  habits: PropTypes.shape({
    total: PropTypes.number,
    active: PropTypes.number,
    byFrequency: PropTypes.object,
    averagePrice: PropTypes.number,
  }),
  currency: PropTypes.string,
};

AnalyticsHabitsSummary.defaultProps = {
  habits: null,
  currency: "USD",
};

export default AnalyticsHabitsSummary;
