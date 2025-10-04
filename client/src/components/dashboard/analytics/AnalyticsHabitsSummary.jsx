import PropTypes from "prop-types";
import { formatCurrency } from "../../../utils/formatters";
import { DEFAULT_CURRENCY } from "../../../constants/preferences";

const AnalyticsHabitsSummary = ({ habits, currency }) => {
  if (!habits) return null;

  const frequencyEntries = Object.entries(habits.byFrequency ?? {});

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="dashboard-card dashboard-card--compact">
        <p className="analytics-summary__heading">Active habits</p>
        <p className="analytics-summary__value mt-3">
          {habits.active}/{habits.total}
        </p>
        <p className="analytics-summary__meta mt-2">
          Average price {formatCurrency(habits.averagePrice ?? 0, currency)}
        </p>
      </div>
      <div className="dashboard-card dashboard-card--compact">
        <p className="analytics-summary__heading">Frequency mix</p>
        <div className="mt-3 flex flex-wrap gap-2 text-secondary">
          {frequencyEntries.length ? (
            frequencyEntries.map(([frequency, count]) => (
              <span
                key={frequency}
                className="analytics-summary__chip rounded-full px-3 py-1"
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
  currency: DEFAULT_CURRENCY,
};

export default AnalyticsHabitsSummary;
