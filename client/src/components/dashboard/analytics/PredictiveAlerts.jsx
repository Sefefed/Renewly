import PropTypes from "prop-types";

const PRIORITY_STYLES = {
  high: "from-orange-500/20 via-red-500/20 to-red-500/10 border-red-400/40",
  medium:
    "from-amber-400/20 via-orange-400/20 to-orange-400/10 border-amber-300/40",
  low: "from-blue-500/20 via-indigo-500/20 to-indigo-500/10 border-indigo-300/40",
};

const PredictiveAlerts = ({ alerts }) => {
  if (!alerts?.length) {
    return (
      <div className="rounded-2xl border border-gray-700/40 bg-gradient-to-br from-gray-800/70 to-gray-900/70 p-6 text-sm text-gray-400">
        No predictive alerts at the moment.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div
          key={`${alert.subscriptionId}-${alert.type}`}
          className={`flex items-start gap-4 rounded-2xl border bg-gradient-to-r p-5 transition-all duration-300 hover:scale-[1.01] hover:border-blue-400/40 ${
            PRIORITY_STYLES[alert.priority] ?? PRIORITY_STYLES.low
          }`}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/10 text-xl"
            aria-hidden="true"
          >
            {alert.type === "immediate_renewal" ? "⏳" : "🔮"}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">{alert.title}</p>
            <p className="mt-1 text-sm text-gray-200/80">{alert.message}</p>
          </div>
          <button
            type="button"
            className="text-sm font-medium text-blue-200 transition-colors hover:text-white"
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
