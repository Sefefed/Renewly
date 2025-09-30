import { calculateSpendingTrend } from "./helpers/spendingTrend.js";
import { calculateCategoryBreakdown } from "./helpers/categoryMetrics.js";
import { calculateMonthlyComparison } from "./helpers/monthlyComparison.js";

export const buildEnhancedInsights = (subscriptions, bills, timeRange) => ({
  spendingTrend: calculateSpendingTrend(subscriptions, bills, timeRange),
  categoryBreakdown: calculateCategoryBreakdown(subscriptions, bills),
  monthlyComparison: calculateMonthlyComparison(subscriptions, bills),
});
