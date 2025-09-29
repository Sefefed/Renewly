import PropTypes from "prop-types";
import { formatCurrency } from "../../utils/formatters";

const METRIC_CONFIG = [
  {
    key: "monthlySpending",
    label: "Monthly Spending",
    icon: "💰",
    valueClass: "text-green-400",
    iconBg: "bg-green-500/20",
    hoverBorder: "hover:border-blue-500/30",
    formatter: formatCurrency,
  },
  {
    key: "yearlySpending",
    label: "Yearly Spending",
    icon: "📊",
    valueClass: "text-blue-400",
    iconBg: "bg-blue-500/20",
    hoverBorder: "hover:border-blue-500/30",
    formatter: formatCurrency,
  },
  {
    key: "activeSubscriptions",
    label: "Active Subscriptions",
    icon: "📱",
    valueClass: "text-purple-400",
    iconBg: "bg-purple-500/20",
    hoverBorder: "hover:border-purple-500/30",
    formatter: (value) => value ?? 0,
  },
];

export default function KpiGrid({ summary, savingsPotential }) {
  const metrics = [
    ...METRIC_CONFIG.map((config) => ({
      ...config,
      value: config.formatter(summary?.[config.key] ?? 0),
    })),
    {
      key: "savingsPotential",
      label: "Savings Potential",
      icon: "💡",
      valueClass: "text-yellow-400",
      iconBg: "bg-yellow-500/20",
      hoverBorder: "hover:border-yellow-500/30",
      value: formatCurrency(savingsPotential ?? 0),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {metrics.map(
        ({ key, label, icon, value, valueClass, iconBg, hoverBorder }) => (
          <div
            key={key}
            className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700/30 transition-all duration-500 hover:scale-105 group ${hoverBorder}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-medium">{label}</p>
                <p
                  className={`text-3xl font-bold mt-2 transition-transform duration-300 group-hover:scale-105 ${valueClass}`}
                >
                  {value}
                </p>
              </div>
              <div
                className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center transition-transform duration-300 shadow-lg group-hover:scale-110`}
              >
                <span className="text-2xl">{icon}</span>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

KpiGrid.propTypes = {
  summary: PropTypes.shape({
    monthlySpending: PropTypes.number,
    yearlySpending: PropTypes.number,
    activeSubscriptions: PropTypes.number,
  }),
  savingsPotential: PropTypes.number,
};

KpiGrid.defaultProps = {
  summary: null,
  savingsPotential: 0,
};
