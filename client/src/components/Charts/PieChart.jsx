import PropTypes from "prop-types";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const DEFAULT_COLORS = [
  "rgba(59, 130, 246, 0.8)",
  "rgba(16, 185, 129, 0.8)",
  "rgba(245, 158, 11, 0.8)",
  "rgba(139, 92, 246, 0.8)",
  "rgba(239, 68, 68, 0.8)",
  "rgba(14, 165, 233, 0.8)",
  "rgba(249, 115, 22, 0.8)",
];

export default function PieChart({ data, height = 300 }) {
  const categories = Object.keys(data || {});
  const datasetValues = categories.map((category) => {
    const entry = data[category];
    if (typeof entry === "number") return entry;
    return entry?.amount ?? 0;
  });

  const chartData = {
    labels: categories,
    datasets: [
      {
        data: datasetValues,
        backgroundColor: DEFAULT_COLORS.slice(0, categories.length),
        borderColor: DEFAULT_COLORS.slice(0, categories.length).map((color) =>
          color.replace("0.8", "1")
        ),
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#9CA3AF",
          font: { size: 12 },
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.parsed;
            const total =
              context.dataset.data.reduce((acc, val) => acc + val, 0) || 1;
            const percentage = Math.round((value / total) * 100);
            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}

PieChart.propTypes = {
  data: PropTypes.objectOf(
    PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        amount: PropTypes.number,
        count: PropTypes.number,
        percentage: PropTypes.number,
      }),
    ])
  ),
  height: PropTypes.number,
};
