import { useMemo } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { formatCurrency } from "../../utils/formatters";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const typeSpecificOptions = {
  vertical: () => ({}),
  grouped: () => ({}),
  horizontal: () => ({ indexAxis: "y" }),
  stacked: () => ({
    scales: {
      x: { stacked: true },
      y: { stacked: true },
    },
  }),
};

const getBaseOptions = (chartType, interactive) => ({
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 16,
      right: 24,
      bottom: 16,
      left: 12,
    },
  },
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "#D1D5DB",
        font: {
          family: "'Inter', sans-serif",
          size: 12,
        },
        padding: 16,
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: "rgba(17, 24, 39, 0.95)",
      titleColor: "#F3F4F6",
      bodyColor: "#E5E7EB",
      borderColor: "rgba(55, 65, 81, 0.35)",
      borderWidth: 1,
      cornerRadius: 10,
      padding: 14,
      displayColors: true,
      callbacks: {
        label: (context) => {
          const rawValue =
            context.parsed[chartType === "horizontal" ? "x" : "y"];
          const value = Number.isFinite(rawValue) ? rawValue : 0;
          return `${context.dataset.label}: ${formatCurrency(value)}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        color: "rgba(55, 65, 81, 0.25)",
        drawBorder: false,
      },
      ticks: {
        color: "#9CA3AF",
        font: {
          size: 11,
        },
        padding: 8,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(55, 65, 81, 0.25)",
        drawBorder: false,
      },
      ticks: {
        color: "#9CA3AF",
        padding: 8,
        callback: (value) => formatCurrency(Number(value) || 0),
      },
    },
  },
  interaction: {
    mode: "nearest",
    intersect: true,
  },
  animation: {
    duration: 950,
    easing: "easeOutQuart",
  },
  onHover: interactive
    ? (event, elements) => {
        event.native.target.style.cursor = elements.length
          ? "pointer"
          : "default";
      }
    : undefined,
});

const buildOptions = (chartType, interactive) => {
  const typeOptions = typeSpecificOptions[chartType]?.() || {};
  return {
    ...getBaseOptions(chartType, interactive),
    ...typeOptions,
  };
};

export default function BarChart({
  chartData,
  height = 320,
  chartType = "vertical",
  className = "",
  interactive = true,
  onBarClick,
  onBarHover,
}) {
  const options = useMemo(() => {
    const mergedOptions = buildOptions(chartType, interactive);

    if (interactive) {
      mergedOptions.onClick = (_, elements, chart) => {
        if (!elements?.length || !onBarClick) return;
        const element = elements[0];
        const { datasetIndex, index } = element;
        const dataset = chart.data.datasets[datasetIndex];
        const label = chart.data.labels[index];
        const value = dataset?.data?.[index] ?? 0;
        onBarClick({
          label,
          value,
          datasetLabel: dataset?.label,
          index,
          datasetIndex,
        });
      };

      mergedOptions.onHover = (event, elements, chart) => {
        event.native.target.style.cursor = elements.length
          ? "pointer"
          : "default";

        if (!onBarHover) return;
        if (!elements.length) {
          onBarHover(null);
          return;
        }

        const element = elements[0];
        const { datasetIndex, index } = element;
        const dataset = chart.data.datasets[datasetIndex];
        const label = chart.data.labels[index];
        const value = dataset?.data?.[index] ?? 0;

        onBarHover({
          label,
          value,
          datasetLabel: dataset?.label,
          index,
          datasetIndex,
        });
      };
    }

    return mergedOptions;
  }, [chartType, interactive, onBarClick, onBarHover]);

  if (!chartData) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-800/50 text-sm text-gray-400">
        No chart data available
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height: `${height}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

BarChart.propTypes = {
  chartData: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    datasets: PropTypes.arrayOf(PropTypes.object).isRequired,
  }),
  height: PropTypes.number,
  chartType: PropTypes.oneOf(["vertical", "horizontal", "stacked", "grouped"]),
  className: PropTypes.string,
  interactive: PropTypes.bool,
  onBarClick: PropTypes.func,
  onBarHover: PropTypes.func,
};

BarChart.defaultProps = {
  chartData: null,
  height: 320,
  chartType: "vertical",
  className: "",
  interactive: true,
  onBarClick: undefined,
  onBarHover: undefined,
};
