const TREND_CONFIG = {
  monthly: { points: 6, monthsPerPoint: 1 },
  quarterly: { points: 6, monthsPerPoint: 3 },
  yearly: { points: 6, monthsPerPoint: 12 },
};

export const buildTrendPeriods = (timeRange) => {
  const now = new Date();
  const { points, monthsPerPoint } =
    TREND_CONFIG[timeRange] || TREND_CONFIG.monthly;
  const periods = [];

  for (let index = points - 1; index >= 0; index -= 1) {
    const end = new Date(
      now.getFullYear(),
      now.getMonth() - index * monthsPerPoint + 1,
      0,
      23,
      59,
      59,
      999
    );

    const start = new Date(
      end.getFullYear(),
      end.getMonth() - monthsPerPoint + 1,
      1
    );

    let label;
    if (monthsPerPoint === 1) {
      label = start.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    } else if (monthsPerPoint === 3) {
      const quarter = Math.floor(start.getMonth() / 3) + 1;
      label = `Q${quarter} ${start.getFullYear()}`;
    } else {
      label = start.getFullYear().toString();
    }

    periods.push({ start, end, label, monthsPerPoint });
  }

  return periods;
};
