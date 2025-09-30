export const buildRecommendations = (
  overlaps,
  upcomingRenewals,
  savingsPotential
) => {
  const recommendations = [];

  if (overlaps.length > 0) {
    recommendations.push({
      type: "consolidate",
      priority: "high",
      message: "Consider consolidating overlapping subscriptions",
      potentialSavings: savingsPotential,
    });
  }

  if (upcomingRenewals.length > 0) {
    recommendations.push({
      type: "review_renewals",
      priority: "medium",
      message: `${upcomingRenewals.length} subscription(s) renewing soon`,
      subscriptions: upcomingRenewals.map((subscription) => ({
        name: subscription.name,
        renewalDate: subscription.renewalDate,
        amount: subscription.price,
      })),
    });
  }

  return recommendations;
};
