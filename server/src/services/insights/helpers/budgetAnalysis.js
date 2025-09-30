const BUDGET_WARNING_THRESHOLD = 80;

export const buildBudgetAnalysis = (
  budget,
  categorySpending,
  totalMonthlySpend,
  overlaps
) => {
  if (!budget) {
    return null;
  }

  const entertainmentSpend = categorySpending.entertainment || 0;
  const entertainmentLimit = budget.categoryLimits?.entertainment || 0;
  const entertainmentPercentage =
    entertainmentLimit > 0
      ? (entertainmentSpend / entertainmentLimit) * 100
      : 0;

  const analysis = {
    monthlyLimit: budget.monthlyLimit,
    currentSpending: totalMonthlySpend,
    percentageUsed: (totalMonthlySpend / budget.monthlyLimit) * 100,
    categoryAnalysis: {
      entertainment: {
        spent: entertainmentSpend,
        limit: entertainmentLimit,
        percentage: entertainmentPercentage,
        overBudget: entertainmentSpend > entertainmentLimit,
      },
    },
    suggestions: [],
  };

  if (entertainmentPercentage > BUDGET_WARNING_THRESHOLD) {
    analysis.suggestions.push({
      type: "budget_warning",
      message: `Entertainment spending is at ${entertainmentPercentage.toFixed(
        1
      )}% of budget`,
      action: "Consider reducing entertainment subscriptions",
    });
  }

  overlaps.forEach((overlap) => {
    analysis.suggestions.push({
      type: "overlap",
      message: `Multiple ${overlap.category} subscriptions found`,
      action: `Consider consolidating ${overlap.subscriptions
        .map((subscription) => subscription.name)
        .join(", ")}`,
      potentialSavings: overlap.totalSpending * 0.5,
    });
  });

  return analysis;
};
