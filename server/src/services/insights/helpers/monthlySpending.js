import { normalizeSubscriptionAmount } from "./subscriptionMetrics.js";

const toDate = (value) => (value ? new Date(value) : null);

export const calculateMonthlySpending = (subscriptions, bills, targetDate) => {
  const month = targetDate.getMonth();
  const year = targetDate.getFullYear();
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const subscriptionTotal = subscriptions.reduce((total, subscription) => {
    const startDate = toDate(subscription.startDate);
    const renewalDate = toDate(subscription.renewalDate);
    const isCancelled = subscription.status === "cancelled";

    if (startDate && startDate > endOfMonth) return total;
    if (isCancelled && renewalDate && renewalDate < startOfMonth) return total;

    return total + normalizeSubscriptionAmount(subscription);
  }, 0);

  const billTotal = bills.reduce((total, bill) => {
    if (!bill.dueDate) return total;

    const dueDate = new Date(bill.dueDate);
    if (dueDate.getFullYear() === year && dueDate.getMonth() === month) {
      return total + (Number(bill.amount) || 0);
    }

    return total;
  }, 0);

  return {
    total: subscriptionTotal + billTotal,
    subscriptions: subscriptionTotal,
    bills: billTotal,
  };
};
