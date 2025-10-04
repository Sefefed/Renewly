import PropTypes from "prop-types";
import { useMemo } from "react";
import { Scatter } from "react-chartjs-2";
import ensureChartRegistration from "./chartSetup";
import { formatCurrency } from "../../../utils/formatters";
import { DEFAULT_CURRENCY } from "../../../constants/preferences";

ensureChartRegistration();

const AnomalyChart = ({ data, baseline, currency, onPointClick }) => {
  const baselineSeries = baseline?.map((item, index) => ({
    x: index,
    y: item.amount,
  }));

  const anomaliesSeries = data?.map((item) => ({
    x: baseline?.findIndex((day) => day.date === item.date) ?? 0,
    y: item.amount,
    payload: item,
  }));

  const chartData = useMemo(
    () => ({
      datasets: [
        {
          label: "Baseline",
          data: baselineSeries,
          showLine: true,
          borderColor: "rgba(148,163,184,0.35)",
          backgroundColor: "rgba(148,163,184,0.05)",
          borderWidth: 1,
          pointRadius: 0,
        },
        {
          label: "Anomalies",
          data: anomaliesSeries,
          pointRadius: 6,
          backgroundColor: anomaliesSeries?.map((item) =>
            item.payload?.type === "spike"
              ? "rgba(248,113,113,0.9)"
              : "rgba(56,189,248,0.9)"
          ),
          borderColor: "#fff",
          borderWidth: 1,
        },
      ],
    }),
    [anomaliesSeries, baselineSeries]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#1a1a1a",
            font: {
              family: "'Inter', 'Helvetica Neue', Arial, sans-serif",
              size: 14,
              weight: 600,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const anomaly = context.raw?.payload;
              if (!anomaly) {
                return formatCurrency(context.parsed.y, currency);
              }
              const label = anomaly.type === "spike" ? "Spike" : "Drop";
              return `${label}: ${formatCurrency(anomaly.amount, currency)} (${
                anomaly.deviation
              }% deviation)`;
            },
          },
        },
      },
      scales: {
        x: {
          display: false,
        },
        y: {
          ticks: {
            color: "#1a1a1a",
            font: {
              family: "'Inter', 'Helvetica Neue', Arial, sans-serif",
              size: 13,
              weight: 600,
            },
            callback: (value) => formatCurrency(value, currency),
          },
          grid: {
            color: "rgba(30, 41, 59, 0.4)",
          },
        },
      },
      onClick: (_event, elements) => {
        if (!onPointClick || !elements.length) return;
        const [{ datasetIndex, index }] = elements;
        if (datasetIndex !== 1) return;
        const anomaly = anomaliesSeries?.[index]?.payload;
        if (anomaly) onPointClick(anomaly);
      },
    }),
    [anomaliesSeries, currency, onPointClick]
  );

  return <Scatter data={chartData} options={options} />;
};

AnomalyChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string,
      amount: PropTypes.number,
      deviation: PropTypes.number,
      type: PropTypes.oneOf(["spike", "drop"]),
    })
  ),
  baseline: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string,
      amount: PropTypes.number,
    })
  ),
  currency: PropTypes.string,
  onPointClick: PropTypes.func,
};

AnomalyChart.defaultProps = {
  data: [],
  baseline: [],
  currency: DEFAULT_CURRENCY,
  onPointClick: undefined,
};

export default AnomalyChart;
