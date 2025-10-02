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
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 transition-all duration-200 ${
            activeChart === tab.id
              ? "border-gray-900 bg-gray-900 text-white shadow"
              : "border-slate-200 bg-white text-secondary hover:border-slate-300 hover:text-primary"
          }`}
          style={
            activeChart === tab.id
              ? {
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  borderColor: "#0f172a",
                  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                }
              : {
                  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                  fontSize: "1.05rem",
                  fontWeight: 600,
                }
          }
        >
          <span aria-hidden="true">{tab.icon}</span>
          <span
            style={{
              fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
              fontWeight: 700,
              fontSize: "1.05rem",
            }}
          >
            {tab.label}
          </span>
        </button>
      ))}
    </div>
    <div
      className="h-96"
      style={{
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        fontWeight: 600,
        fontSize: "1rem",
        color: "#1a1a1a",
      }}
    >
      {children}
    </div>
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
