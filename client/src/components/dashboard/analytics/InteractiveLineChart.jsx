import PropTypes from "prop-types";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import ensureChartRegistration from "./chartSetup";
import { formatCurrency } from "../../../utils/formatters";

ensureChartRegistration();

const gradientBackgroundPlugin = {
  id: "customGradient",
  beforeDraw: (chart) => {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    const gradient = ctx.createLinearGradient(
      0,
      chartArea.bottom,
      0,
      chartArea.top
    );
    gradient.addColorStop(0, "rgba(59,130,246,0.05)");
    gradient.addColorStop(0.5, "rgba(59,130,246,0.15)");
    gradient.addColorStop(1, "rgba(236,72,153,0.15)");

    const dataset = chart.config.data.datasets[0];
    dataset.backgroundColor = gradient;
  },
};

const InteractiveLineChart = ({ data, currency, onDataPointClick }) => {
  const chartData = useMemo(() => {
    const labels = data?.map((item) => item.date) ?? [];
    const values = data?.map((item) => item.amount) ?? [];

    return {
      labels,
      datasets: [
        {
          label: "Spending",
          data: values,
          borderColor: "rgba(59,130,246,1)",
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "rgba(59,130,246,1)",
          pointBorderColor: "#fff",
          borderWidth: 2,
          tension: 0.35,
        },
      ],
    };
  }, [data]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => formatCurrency(context.parsed.y, currency),
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "rgba(148, 163, 184, 0.9)",
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 8,
          },
          grid: {
            color: "rgba(30, 41, 59, 0.4)",
          },
        },
        y: {
          ticks: {
            color: "rgba(148, 163, 184, 0.9)",
            callback: (value) => formatCurrency(value, currency),
          },
          grid: {
            color: "rgba(30, 41, 59, 0.4)",
          },
        },
      },
      onClick: (_evt, elements, chart) => {
        if (elements.length && onDataPointClick) {
          const [element] = elements;
          const dataPoint = chart.data.datasets[0].data[element.index];
          const label = chart.data.labels[element.index];
          onDataPointClick({ date: label, amount: dataPoint });
        }
      },
    }),
    [currency, onDataPointClick]
  );

  return (
    <Line
      data={chartData}
      options={options}
      plugins={[gradientBackgroundPlugin]}
    />
  );
};

InteractiveLineChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
    })
  ),
  currency: PropTypes.string,
  onDataPointClick: PropTypes.func,
};

InteractiveLineChart.defaultProps = {
  data: [],
  currency: "USD",
  onDataPointClick: undefined,
};

export default InteractiveLineChart;
