import PropTypes from "prop-types";
import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import ensureChartRegistration from "./chartSetup";
import { formatCurrency } from "../../../utils/formatters";

ensureChartRegistration();

const SavingsChart = ({ opportunities, currency, onBarClick }) => {
  const trimmed = useMemo(
    () => opportunities?.slice(0, 6) ?? [],
    [opportunities]
  );

  const chartData = useMemo(() => {
    const labels = trimmed.map((item) => item.title);
    const values = trimmed.map((item) => item.potentialSavings ?? 0);

    return {
      labels,
      datasets: [
        {
          label: "Potential Savings",
          data: values,
          backgroundColor: "rgba(34,197,94,0.65)",
          borderRadius: 14,
          borderSkipped: false,
        },
      ],
    };
  }, [trimmed]);

  const options = useMemo(
    () => ({
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => formatCurrency(context.parsed.x, currency),
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "rgba(148,163,184,0.85)",
            callback: (value) => formatCurrency(value, currency),
          },
          grid: {
            color: "rgba(30,41,59,0.35)",
          },
        },
        y: {
          ticks: {
            color: "rgba(226,232,240,0.8)",
          },
          grid: {
            display: false,
          },
        },
      },
      onClick: (_event, elements) => {
        if (!onBarClick || !elements.length) return;
        const [{ index }] = elements;
        onBarClick(trimmed[index]);
      },
    }),
    [currency, onBarClick, trimmed]
  );

  return <Bar data={chartData} options={options} />;
};

SavingsChart.propTypes = {
  opportunities: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      potentialSavings: PropTypes.number,
      description: PropTypes.string,
    })
  ),
  currency: PropTypes.string,
  onBarClick: PropTypes.func,
};

SavingsChart.defaultProps = {
  opportunities: [],
  currency: "USD",
  onBarClick: undefined,
};

export default SavingsChart;
