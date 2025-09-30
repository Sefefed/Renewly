import { calculateMonthlySpending } from "./monthlySpending.js";

export const calculateMonthlyComparison = (subscriptions, bills) => {
  const currentDate = new Date();
  const previousDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1
  );

  const current = calculateMonthlySpending(subscriptions, bills, currentDate);
  const previous = calculateMonthlySpending(subscriptions, bills, previousDate);

  const difference = current.total - previous.total;
  const percentageChange =
    previous.total === 0 ? null : (difference / previous.total) * 100;

  return {
    currentMonth: {
      label: currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      total: Number(current.total.toFixed(2)),
      subscriptions: Number(current.subscriptions.toFixed(2)),
      bills: Number(current.bills.toFixed(2)),
    },
    previousMonth: {
      label: previousDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      total: Number(previous.total.toFixed(2)),
      subscriptions: Number(previous.subscriptions.toFixed(2)),
      bills: Number(previous.bills.toFixed(2)),
    },
    difference: Number(difference.toFixed(2)),
    trend: difference >= 0 ? "up" : "down",
    percentageChange:
      percentageChange === null ? null : Number(percentageChange.toFixed(2)),
  };
};
