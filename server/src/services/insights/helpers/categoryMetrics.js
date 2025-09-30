import { normalizeSubscriptionAmount } from "./subscriptionMetrics.js";

export const buildCategorySpending = (subscriptions, bills) => {
  const categorySpending = {};

  subscriptions.forEach((subscription) => {
    const category = subscription.category || "other";
    categorySpending[category] =
      (categorySpending[category] || 0) +
      normalizeSubscriptionAmount(subscription);
  });

  bills.forEach((bill) => {
    const category = bill.category || "other";
    categorySpending[category] =
      (categorySpending[category] || 0) + (Number(bill.amount) || 0);
  });

  return categorySpending;
};

export const calculateCategoryBreakdown = (subscriptions, bills) => {
  const categories = {};

  const addAmount = (category, amount) => {
    if (!categories[category]) {
      categories[category] = { amount: 0, count: 0, percentage: 0 };
    }

    categories[category].amount += amount;
    categories[category].count += 1;
  };

  subscriptions.forEach((subscription) => {
    const category = subscription.category || "other";
    addAmount(category, normalizeSubscriptionAmount(subscription));
  });

  bills.forEach((bill) => {
    const category = bill.category || "other";
    addAmount(category, Number(bill.amount) || 0);
  });

  const total =
    Object.values(categories).reduce(
      (sum, category) => sum + category.amount,
      0
    ) || 1;

  Object.values(categories).forEach((entry) => {
    entry.percentage = Number(((entry.amount / total) * 100).toFixed(2));
  });

  return categories;
};
