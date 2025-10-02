import PropTypes from "prop-types";
import { formatCurrency } from "../../utils/formatters";

const METRIC_CONFIG = [
  {
    key: "monthlySpending",
    label: "Monthly Spending",
    valueClass: "text-emerald-500",
    iconBg: "bg-emerald-50 text-emerald-500",
    formatter: formatCurrency,
  },
  {
    key: "yearlySpending",
    label: "Yearly Spending",
    valueClass: "text-blue-600",
    iconBg: "bg-blue-50 text-blue-600",
    formatter: formatCurrency,
  },
  {
    key: "activeSubscriptions",
    label: "Active Subscriptions",
    valueClass: "text-violet-500",
    iconBg: "bg-violet-50 text-violet-500",
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
      valueClass: "text-amber-500",
      iconBg: "bg-amber-50 text-amber-500",
      value: formatCurrency(savingsPotential ?? 0),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
      {metrics.map(({ key, label, value, valueClass }) => (
        <div key={key} className="dashboard-card dashboard-card--compact group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary text-black">
                {label}
              </p>
              <p
                className={`text-3xl font-semibold mt-3 transition-transform duration-300 group-hover:scale-105 ${valueClass}`}
              >
                {value}
              </p>
            </div>
          </div>
        </div>
      ))}
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
