import { getMonthlySubscriptionValue } from "./subscriptionMetrics.js";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const groupByCategory = (subscriptions) =>
  subscriptions.reduce((groups, subscription) => {
    const category = subscription.category || "other";
    const collection = groups.get(category) || [];
    collection.push(subscription);
    groups.set(category, collection);
    return groups;
  }, new Map());

export const findSubscriptionOverlaps = (subscriptions) =>
  Array.from(groupByCategory(subscriptions))
    .filter(([, subs]) => subs.length > 1)
    .map(([category, subs]) => ({
      category,
      subscriptions: subs,
      totalSpending: subs.reduce(
        (total, subscription) =>
          total + getMonthlySubscriptionValue(subscription),
        0
      ),
    }));

export const calculateSavingsPotential = (overlaps) =>
  overlaps.reduce((total, overlap) => total + overlap.totalSpending * 0.5, 0);

export const findUpcomingRenewals = (subscriptions) => {
  const threshold = Date.now() + THIRTY_DAYS_MS;

  return subscriptions.filter((subscription) => {
    if (!subscription.renewalDate) return false;
    const renewalTime = new Date(subscription.renewalDate).getTime();
    return Number.isFinite(renewalTime) && renewalTime <= threshold;
  });
};
