import PropTypes from "prop-types";
import { TIMEFRAME_OPTIONS } from "./analyticsConstants";

const AnalyticsTimeframeControls = ({
  timeframe,
  onTimeframeChange,
  onRefresh,
  isRefreshing,
}) => (
  <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
    {TIMEFRAME_OPTIONS.map((option) => {
      const isActive = timeframe === option.id;

      return (
        <button
          key={option.id}
          type="button"
          onClick={() => onTimeframeChange(option.id)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
            isActive
              ? "border-gray-900 bg-gray-900 text-white shadow"
              : "border-transparent text-secondary hover:border-slate-300 hover:bg-slate-50 hover:text-primary"
          }`}
          style={
            isActive
              ? {
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  borderColor: "#0f172a",
                }
              : undefined
          }
          aria-pressed={isActive}
        >
          <span>{option.label}</span>
        </button>
      );
    })}

    <button
      type="button"
      onClick={() => onRefresh(timeframe, { silent: true })}
      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-secondary transition-colors hover:border-blue-200 hover:text-blue-600"
    >
      {isRefreshing ? "Refreshing…" : "Refresh"}
    </button>
  </div>
);

AnalyticsTimeframeControls.propTypes = {
  timeframe: PropTypes.string.isRequired,
  onTimeframeChange: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  isRefreshing: PropTypes.bool,
};

AnalyticsTimeframeControls.defaultProps = {
  isRefreshing: false,
};

export default AnalyticsTimeframeControls;
