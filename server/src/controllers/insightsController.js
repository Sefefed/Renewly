import Subscription from "../models/subscriptionModel.js";
import Bill from "../models/billModel.js";
import Budget from "../models/budgetModel.js";

export const getInsights = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get all user data
    const [subscriptions, bills, budget] = await Promise.all([
      Subscription.find({ user: userId, status: "active" }),
      Bill.find({ user: userId }),
      Budget.findOne({ user: userId }),
    ]);

    // Calculate monthly spending
    const monthlySubscriptions = subscriptions.reduce((total, sub) => {
      if (sub.frequency === "monthly") return total + sub.price;
      if (sub.frequency === "yearly") return total + sub.price / 12;
      if (sub.frequency === "weekly") return total + sub.price * 4.33;
      if (sub.frequency === "daily") return total + sub.price * 30;
      return total;
    }, 0);

    const monthlyBills = bills
      .filter((bill) => bill.status === "pending" || bill.status === "overdue")
      .reduce((total, bill) => total + bill.amount, 0);

    const totalMonthlySpend = monthlySubscriptions + monthlyBills;

    // Calculate yearly spending
    const yearlySubscriptions = subscriptions.reduce((total, sub) => {
      if (sub.frequency === "monthly") return total + sub.price * 12;
      if (sub.frequency === "yearly") return total + sub.price;
      if (sub.frequency === "weekly") return total + sub.price * 52;
      if (sub.frequency === "daily") return total + sub.price * 365;
      return total;
    }, 0);

    const yearlyBills = bills.reduce(
      (total, bill) => total + bill.amount * 12,
      0
    );
    const totalYearlySpend = yearlySubscriptions + yearlyBills;

    // Category breakdown
    const categorySpending = {};
    subscriptions.forEach((sub) => {
      if (!categorySpending[sub.category]) {
        categorySpending[sub.category] = 0;
      }
      if (sub.frequency === "monthly") {
        categorySpending[sub.category] += sub.price;
      } else if (sub.frequency === "yearly") {
        categorySpending[sub.category] += sub.price / 12;
      } else if (sub.frequency === "weekly") {
        categorySpending[sub.category] += sub.price * 4.33;
      } else if (sub.frequency === "daily") {
        categorySpending[sub.category] += sub.price * 30;
      }
    });

    bills.forEach((bill) => {
      if (!categorySpending[bill.category]) {
        categorySpending[bill.category] = 0;
      }
      categorySpending[bill.category] += bill.amount;
    });

    // Find overlaps (same category subscriptions)
    const categoryGroups = {};
    subscriptions.forEach((sub) => {
      if (!categoryGroups[sub.category]) {
        categoryGroups[sub.category] = [];
      }
      categoryGroups[sub.category].push(sub);
    });

    const overlaps = Object.entries(categoryGroups)
      .filter(([category, subs]) => subs.length > 1)
      .map(([category, subs]) => ({
        category,
        subscriptions: subs,
        totalSpending: subs.reduce((total, sub) => {
          if (sub.frequency === "monthly") return total + sub.price;
          if (sub.frequency === "yearly") return total + sub.price / 12;
          if (sub.frequency === "weekly") return total + sub.price * 4.33;
          if (sub.frequency === "daily") return total + sub.price * 30;
          return total;
        }, 0),
      }));

    // Upcoming renewals (next 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    const upcomingRenewals = subscriptions.filter(
      (sub) => sub.renewalDate && sub.renewalDate <= thirtyDaysFromNow
    );

    // Budget analysis
    let budgetAnalysis = null;
    if (budget) {
      const entertainmentSpend = categorySpending.entertainment || 0;
      const entertainmentLimit = budget.categoryLimits.entertainment || 0;
      const entertainmentPercentage =
        entertainmentLimit > 0
          ? (entertainmentSpend / entertainmentLimit) * 100
          : 0;

      budgetAnalysis = {
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

      // Generate suggestions
      if (entertainmentPercentage > 80) {
        budgetAnalysis.suggestions.push({
          type: "budget_warning",
          message: `Entertainment spending is at ${entertainmentPercentage.toFixed(
            1
          )}% of budget`,
          action: "Consider reducing entertainment subscriptions",
        });
      }

      if (overlaps.length > 0) {
        overlaps.forEach((overlap) => {
          budgetAnalysis.suggestions.push({
            type: "overlap",
            message: `Multiple ${overlap.category} subscriptions found`,
            action: `Consider consolidating ${overlap.subscriptions
              .map((s) => s.name)
              .join(", ")}`,
            potentialSavings: overlap.totalSpending * 0.5, // Assume 50% savings
          });
        });
      }
    }

    // Savings potential
    const savingsPotential = overlaps.reduce((total, overlap) => {
      return total + overlap.totalSpending * 0.5; // Assume 50% savings from consolidation
    }, 0);

    const insights = {
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
      recommendations: [
        ...(overlaps.length > 0
          ? [
              {
                type: "consolidate",
                priority: "high",
                message: "Consider consolidating overlapping subscriptions",
                potentialSavings: savingsPotential,
              },
            ]
          : []),
        ...(upcomingRenewals.length > 0
          ? [
              {
                type: "review_renewals",
                priority: "medium",
                message: `${upcomingRenewals.length} subscription(s) renewing soon`,
                subscriptions: upcomingRenewals.map((sub) => ({
                  name: sub.name,
                  renewalDate: sub.renewalDate,
                  amount: sub.price,
                })),
              },
            ]
          : []),
      ],
    };

    res.status(200).json({ success: true, data: insights });
  } catch (error) {
    next(error);
  }
};
