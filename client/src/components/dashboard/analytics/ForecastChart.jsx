import PropTypes from "prop-types";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import ensureChartRegistration from "./chartSetup";
import { formatCurrency } from "../../../utils/formatters";

ensureChartRegistration();

const ForecastChart = ({ data, historical, currency }) => {
  const chartData = useMemo(() => {
    const historicalData = historical?.slice(-12) ?? [];
    const labels = historicalData.map((item) => item.date).concat(["Forecast"]);
    const values = historicalData
      .map((item) => item.amount)
      .concat([data?.predictedAmount ?? 0]);

    return {
      labels,
      datasets: [
        {
          label: "Actual",
          data: values.slice(0, -1),
          borderColor: "rgba(244,114,182,0.8)",
          backgroundColor: "rgba(244,114,182,0.15)",
          fill: true,
          tension: 0.3,
          borderWidth: 2,
        },
        {
          label: "Forecast",
          data: new Array(values.length - 1)
            .fill(null)
            .concat(data?.predictedAmount ?? 0),
          borderColor: "rgba(56,189,248,1)",
          borderDash: [6, 6],
          pointRadius: 5,
          pointBackgroundColor: "rgba(56,189,248,1)",
          tension: 0.3,
          borderWidth: 2,
        },
      ],
    };
  }, [data, historical]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "rgba(226, 232, 240, 0.8)",
          },
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
            color: "rgba(148, 163, 184, 0.85)",
            maxRotation: 0,
          },
          grid: {
            color: "rgba(30, 41, 59, 0.4)",
          },
        },
        y: {
          ticks: {
            color: "rgba(148, 163, 184, 0.85)",
            callback: (value) => formatCurrency(value, currency),
          },
          grid: {
            color: "rgba(30, 41, 59, 0.4)",
          },
        },
      },
    }),
    [currency]
  );

  return <Line data={chartData} options={options} />;
};

ForecastChart.propTypes = {
  data: PropTypes.shape({
    predictedAmount: PropTypes.number,
  }),
  historical: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string,
      amount: PropTypes.number,
    })
  ),
  currency: PropTypes.string,
};

ForecastChart.defaultProps = {
  data: null,
  historical: [],
  currency: "USD",
};

export default ForecastChart;
