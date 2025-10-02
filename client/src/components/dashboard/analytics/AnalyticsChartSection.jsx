import PropTypes from "prop-types";
import { CHART_TABS } from "./analyticsConstants";

const AnalyticsChartSection = ({ activeChart, onChartChange, children }) => (
  <div className="dashboard-card">
    <div className="mb-6 flex flex-wrap items-center gap-3 overflow-x-auto">
      {CHART_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChartChange(tab.id)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
            activeChart === tab.id
              ? "border-blue-300 bg-blue-50 text-blue-600 shadow-sm"
              : "border-transparent bg-white text-secondary hover:border-blue-200 hover:text-blue-600"
          }`}
        >
          <span aria-hidden="true">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
    <div className="h-96">{children}</div>
  </div>
);

AnalyticsChartSection.propTypes = {
  activeChart: PropTypes.string.isRequired,
  onChartChange: PropTypes.func.isRequired,
  children: PropTypes.node,
};

AnalyticsChartSection.defaultProps = {
  children: null,
};

export default AnalyticsChartSection;
