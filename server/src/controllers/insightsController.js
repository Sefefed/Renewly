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
      .filter(([, subs]) => subs.length > 1)
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

export const getEnhancedInsights = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { timeRange = "monthly" } = req.query;

    const [subscriptions, bills] = await Promise.all([
      Subscription.find({ user: userId }),
      Bill.find({ user: userId }),
    ]);

    const spendingTrend = calculateSpendingTrend(
      subscriptions,
      bills,
      timeRange
    );
    const categoryBreakdown = calculateCategoryBreakdown(subscriptions, bills);
    const monthlyComparison = calculateMonthlyComparison(subscriptions, bills);

    res.status(200).json({
      success: true,
      data: {
        spendingTrend,
        categoryBreakdown,
        monthlyComparison,
      },
    });
  } catch (error) {
    next(error);
  }
};

const normalizeSubscriptionAmount = (subscription) => {
  const price = Number(subscription.price) || 0;
  switch (subscription.frequency) {
    case "daily":
      return price * 30;
    case "weekly":
      return price * 4.33;
    case "yearly":
      return price / 12;
    case "monthly":
    default:
      return price;
  }
};

const calculateMonthlySpending = (subscriptions, bills, targetDate) => {
  const month = targetDate.getMonth();
  const year = targetDate.getFullYear();
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const subscriptionTotal = subscriptions.reduce((total, subscription) => {
    const startDate = subscription.startDate
      ? new Date(subscription.startDate)
      : null;
    const renewalDate = subscription.renewalDate
      ? new Date(subscription.renewalDate)
      : null;
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

const buildTrendPeriods = (timeRange) => {
  const now = new Date();
  const config = {
    monthly: { points: 6, monthsPerPoint: 1 },
    quarterly: { points: 6, monthsPerPoint: 3 },
    yearly: { points: 6, monthsPerPoint: 12 },
  };

  const { points, monthsPerPoint } = config[timeRange] || config.monthly;
  const periods = [];

  for (let i = points - 1; i >= 0; i--) {
    const end = new Date(
      now.getFullYear(),
      now.getMonth() - i * monthsPerPoint + 1,
      0,
      23,
      59,
      59,
      999
    );
    const start = new Date(
      end.getFullYear(),
      end.getMonth() - monthsPerPoint + 1,
      1
    );

    let label;
    if (monthsPerPoint === 1) {
      label = start.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    } else if (monthsPerPoint === 3) {
      const quarter = Math.floor(start.getMonth() / 3) + 1;
      label = `Q${quarter} ${start.getFullYear()}`;
    } else {
      label = start.getFullYear().toString();
    }

    periods.push({ start, end, label, monthsPerPoint });
  }

  return periods;
};

const calculateSpendingTrend = (subscriptions, bills, timeRange) => {
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

const calculateCategoryBreakdown = (subscriptions, bills) => {
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

  Object.keys(categories).forEach((category) => {
    categories[category].percentage = Number(
      ((categories[category].amount / total) * 100).toFixed(2)
    );
  });

  return categories;
};

const calculateMonthlyComparison = (subscriptions, bills) => {
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
