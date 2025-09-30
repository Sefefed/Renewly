import { buildTrendPeriods } from "./trendPeriods.js";
import { calculateMonthlySpending } from "./monthlySpending.js";

export const calculateSpendingTrend = (subscriptions, bills, timeRange) => {
  const periods = buildTrendPeriods(timeRange);

  return periods.map(({ start, end, label, monthsPerPoint }) => {
    const monthly = calculateMonthlySpending(subscriptions, bills, start);

    const subscriptionsTotal = monthly.subscriptions * monthsPerPoint;
    const billsTotal = bills.reduce((total, bill) => {
      if (!bill.dueDate) return total;
      const dueDate = new Date(bill.dueDate);

      return dueDate >= start && dueDate <= end
        ? total + (Number(bill.amount) || 0)
        : total;
    }, 0);

    const total = subscriptionsTotal + billsTotal;

    return {
      month: label,
      spending: Number(total.toFixed(2)),
      subscriptions: Number(subscriptionsTotal.toFixed(2)),
      bills: Number(billsTotal.toFixed(2)),
    };
  });
};
