import PropTypes from "prop-types";

const PRIORITY_STYLES = {
  high: "border-rose-200 bg-rose-50",
  medium: "border-amber-200 bg-amber-50",
  low: "border-blue-200 bg-blue-50",
};

const PredictiveAlerts = ({ alerts }) => {
  if (!alerts?.length) {
    return (
      <div className="dashboard-card dashboard-card--compact text-sm text-secondary">
        No predictive alerts at the moment.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div
          key={`${alert.subscriptionId}-${alert.type}`}
          className={`flex items-start gap-4 rounded-2xl border bg-white p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg ${
            PRIORITY_STYLES[alert.priority] ?? PRIORITY_STYLES.low
          }`}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl"
            aria-hidden="true"
          >
            {alert.type === "immediate_renewal" ? "⏳" : "🔮"}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary">{alert.title}</p>
            <p className="mt-1 text-sm text-secondary">{alert.message}</p>
          </div>
          <button
            type="button"
            className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-500"
          >
            View details
          </button>
        </div>
      ))}
    </div>
  );
};

PredictiveAlerts.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      subscriptionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      type: PropTypes.string,
      title: PropTypes.string,
      message: PropTypes.string,
      priority: PropTypes.oneOf(["high", "medium", "low"]),
    })
  ),
};

PredictiveAlerts.defaultProps = {
  alerts: [],
};

export default PredictiveAlerts;
