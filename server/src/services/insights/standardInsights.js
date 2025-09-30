import {
  calculateMonthlySubscriptions,
  calculateYearlySubscriptions,
} from "./helpers/subscriptionMetrics.js";
import {
  calculateMonthlyBills,
  calculateYearlyBills,
} from "./helpers/billMetrics.js";
import { buildCategorySpending } from "./helpers/categoryMetrics.js";
import {
  findSubscriptionOverlaps,
  findUpcomingRenewals,
  calculateSavingsPotential,
} from "./helpers/overlapAnalysis.js";
import { buildBudgetAnalysis } from "./helpers/budgetAnalysis.js";
import { buildRecommendations } from "./helpers/recommendations.js";

export const buildStandardInsights = (subscriptions, bills, budget) => {
  const monthlySubscriptions = calculateMonthlySubscriptions(subscriptions);
  const monthlyBills = calculateMonthlyBills(bills);
  const totalMonthlySpend = monthlySubscriptions + monthlyBills;

  const yearlySubscriptions = calculateYearlySubscriptions(subscriptions);
  const yearlyBills = calculateYearlyBills(bills);
  const totalYearlySpend = yearlySubscriptions + yearlyBills;

  const categorySpending = buildCategorySpending(subscriptions, bills);
  const overlaps = findSubscriptionOverlaps(subscriptions);
  const upcomingRenewals = findUpcomingRenewals(subscriptions);
  const budgetAnalysis = buildBudgetAnalysis(
    budget,
    categorySpending,
    totalMonthlySpend,
    overlaps
  );
  const savingsPotential = calculateSavingsPotential(overlaps);
  const recommendations = buildRecommendations(
    overlaps,
    upcomingRenewals,
    savingsPotential
  );

  return {
    summary: {
      monthlySpending: totalMonthlySpend,
      yearlySpending: totalYearlySpend,
      activeSubscriptions: subscriptions.length,
      pendingBills: bills.filter((bill) => bill.status === "pending").length,
      overdueBills: bills.filter((bill) => bill.status === "overdue").length,
    },
    categoryBreakdown: categorySpending,
    overlaps,
    upcomingRenewals,
    budgetAnalysis,
    savingsPotential,
    recommendations,
  };
};
