import PropTypes from "prop-types";
import { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import ensureChartRegistration from "./chartSetup";
import { formatCurrency } from "../../../utils/formatters";
import { DEFAULT_CURRENCY } from "../../../constants/preferences";

ensureChartRegistration();

const COLORS = [
  "#60A5FA",
  "#8B5CF6",
  "#F472B6",
  "#34D399",
  "#FBBF24",
  "#38BDF8",
  "#F97316",
];

const InteractivePieChart = ({ data, currency, onSegmentClick }) => {
  const chartData = useMemo(() => {
    const labels = data?.map((item) => item.category ?? "Other") ?? [];
    const values = data?.map((item) => item.total ?? 0) ?? [];
    const backgroundColor = values.map(
      (_, index) => COLORS[index % COLORS.length]
    );

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor,
          borderWidth: 1,
          borderColor: "rgba(15,23,42,0.9)",
          hoverOffset: 8,
        },
      ],
    };
  }, [data]);

  const options = useMemo(
    () => ({
      cutout: "60%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#1a1a1a",
            font: {
              family: "'Inter', 'Helvetica Neue', Arial, sans-serif",
              size: 13,
              weight: 600,
            },
            usePointStyle: true,
            padding: 16,
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label ?? "";
              const value = context.parsed ?? 0;
              return `${label}: ${formatCurrency(value, currency)}`;
            },
          },
        },
      },
      onClick: (_event, elements, chart) => {
        if (!onSegmentClick || !elements.length) return;
        const [{ index }] = elements;
        const value = chart.data.datasets[0].data[index];
        const label = chart.data.labels[index];
        onSegmentClick({ label, value });
      },
    }),
    [currency, onSegmentClick]
  );

  return <Doughnut data={chartData} options={options} />;
};

InteractivePieChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string,
      total: PropTypes.number,
      percentage: PropTypes.number,
    })
  ),
  currency: PropTypes.string,
  onSegmentClick: PropTypes.func,
};

InteractivePieChart.defaultProps = {
  data: [],
  currency: DEFAULT_CURRENCY,
  onSegmentClick: undefined,
};

export default InteractivePieChart;
