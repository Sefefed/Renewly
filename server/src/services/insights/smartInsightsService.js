import Subscription from "../../models/subscriptionModel.js";
import Bill from "../../models/billModel.js";
import Budget from "../../models/budgetModel.js";

const PERIOD_CONFIG = {
  "7d": { days: 7, label: "Last 7 days" },
  "30d": { days: 30, label: "Last 30 days" },
  "90d": { days: 90, label: "Last 90 days" },
  "1y": { days: 365, label: "Last year" },
};

const FREQUENCY_IN_DAYS = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  yearly: 365,
};

const CURRENCY_INDEX = {
  USD: 1,
  EUR: 1.07,
  GBP: 1.25,
};

const toISODate = (date) => date.toISOString().split("T")[0];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const convertCurrency = (amount = 0, from = "USD", to = "USD") => {
  if (from === to) return amount;
  const fromRate = CURRENCY_INDEX[from] ?? 1;
  const toRate = CURRENCY_INDEX[to] ?? 1;
  return (amount / fromRate) * toRate;
};

const formatCurrency = (amount, currency = "USD") => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount ?? 0);
  } catch (error) {
    return `$${Number(amount ?? 0).toFixed(0)}`;
  }
};

const differenceInDays = (a, b) => {
  const start = new Date(a);
  const end = new Date(b);
  return Math.floor((start - end) / (1000 * 60 * 60 * 24));
};

const getPeriodConfig = (period) =>
  PERIOD_CONFIG[period] ?? PERIOD_CONFIG["30d"];

const getBaseCurrency = (budget, subscriptions, bills) => {
  if (budget?.currency) return budget.currency;

  const currencies = new Map();
  const tally = (curr) => {
    if (!curr) return;
    currencies.set(curr, (currencies.get(curr) ?? 0) + 1);
  };

  subscriptions.forEach((sub) => tally(sub.currency));
  bills.forEach((bill) => tally(bill.currency));

  if (currencies.size === 0) return "USD";

  let selected = "USD";
  let maxCount = 0;
  currencies.forEach((count, curr) => {
    if (count > maxCount) {
      selected = curr;
      maxCount = count;
    }
  });

  return selected;
};

const buildSpendingTimeline = (
  subscriptions,
  bills,
  { days, baseCurrency }
) => {
  const now = new Date();
  const timeline = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    timeline.push({ date: toISODate(date), amount: 0 });
  }

  const addToDay = (targetDate, value) => {
    const key = toISODate(targetDate);
    const entry = timeline.find((item) => item.date === key);
    if (entry) {
      entry.amount += value;
    }
  };

  subscriptions.forEach((subscription) => {
    const frequencyDays = FREQUENCY_IN_DAYS[subscription.frequency] ?? 30;
    const normalizedPrice = convertCurrency(
      subscription.price,
      subscription.currency,
      baseCurrency
    );
    const dailyCost = normalizedPrice / frequencyDays;

    timeline.forEach((day) => {
      day.amount += dailyCost;
    });

    if (subscription.startDate) {
      const start = new Date(subscription.startDate);
      start.setHours(0, 0, 0, 0);

      timeline.forEach((day) => {
        const current = new Date(day.date);
        const daysSinceStart = differenceInDays(current, start);
        if (daysSinceStart >= 0 && frequencyDays > 0) {
          if (daysSinceStart % frequencyDays === 0) {
            day.amount += normalizedPrice * 0.6;
          }
        }
      });
    }
  });

  bills.forEach((bill) => {
    const normalized = convertCurrency(
      bill.amount,
      bill.currency,
      baseCurrency
    );
    if (bill.dueDate) {
      const due = new Date(bill.dueDate);
      due.setHours(0, 0, 0, 0);
      addToDay(due, normalized);
    }
  });

  return timeline.map((item) => ({
    ...item,
    amount: Number(item.amount.toFixed(2)),
  }));
};

const detectAnomalies = (timeline) => {
  if (!timeline.length) return [];
  const amounts = timeline.map((item) => item.amount);
  const avg = amounts.reduce((sum, value) => sum + value, 0) / amounts.length;
  const variance =
    amounts.reduce((sum, value) => sum + (value - avg) ** 2, 0) /
    amounts.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) {
    return [];
  }

  return timeline
    .filter((item) => Math.abs(item.amount - avg) > 2 * stdDev)
    .map((item) => ({
      date: item.date,
      amount: Number(item.amount.toFixed(2)),
      deviation: Number((((item.amount - avg) / avg) * 100).toFixed(1)),
      type: item.amount > avg ? "spike" : "drop",
    }));
};

const groupBy = (collection, keyFn) => {
  const map = new Map();
  collection.forEach((item) => {
    const key = keyFn(item);
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(item);
  });
  return map;
};

const identifyDuplicateServices = (groups, baseCurrency) => {
  const duplicates = [];
  groups.forEach((items, key) => {
    if (items.length <= 1) return;
    const sorted = [...items].sort((a, b) => a.price - b.price);
    const baseline = sorted[0];
    const excess = sorted
      .slice(1)
      .reduce(
        (total, item) =>
          total + convertCurrency(item.price, item.currency, baseCurrency),
        0
      );

    duplicates.push({
      title: `${key} appears ${items.length} times`,
      description: "Consider consolidating duplicate subscriptions.",
      potentialSavings: Number(excess.toFixed(2)),
      subscriptionIds: items.map((item) => item._id),
      type: "duplicate",
    });
    duplicates.push({
      title: `Keep the best plan for ${key}`,
      description: `The lowest plan is ${formatCurrency(
        baseline.price,
        baseline.currency
      )}.`,
      potentialSavings: 0,
      subscriptionIds: [baseline._id],
      type: "keep",
    });
  });
  return duplicates;
};

const identifyUnusedSubscriptions = (subscriptions, baseCurrency) => {
  const now = new Date();
  return subscriptions
    .filter((subscription) => {
      const isInactive = subscription.status !== "active";
      const renewalDate = subscription.renewalDate
        ? new Date(subscription.renewalDate)
        : null;
      const overdue = renewalDate ? renewalDate < now : false;
      return isInactive || overdue;
    })
    .map((subscription) => ({
      title: `${subscription.name} might be unused`,
      description: `Status is ${subscription.status}. You could pause or cancel until you need it again.`,
      potentialSavings: Number(
        convertCurrency(
          subscription.price,
          subscription.currency,
          baseCurrency
        ).toFixed(2)
      ),
      subscriptionIds: [subscription._id],
      type: "unused",
    }));
};

const identifyPlanOptimizations = (subscriptions, baseCurrency) => {
  return subscriptions
    .filter((subscription) => subscription.status === "active")
    .map((subscription) => {
      const normalized = convertCurrency(
        subscription.price,
        subscription.currency,
        baseCurrency
      );
      const frequencyDays = FREQUENCY_IN_DAYS[subscription.frequency] ?? 30;
      const monthlyEquivalent = (normalized / frequencyDays) * 30;

      if (monthlyEquivalent < 20) {
        return null;
      }

      const potential = monthlyEquivalent * 0.15;
      return {
        title: `${subscription.name} might have a cheaper tier`,
        description:
          "Check if there is a basic or annual plan that better fits your usage.",
        potentialSavings: Number(potential.toFixed(2)),
        subscriptionIds: [subscription._id],
        type: "plan",
      };
    })
    .filter(Boolean);
};

const findSavingsOpportunities = (subscriptions, baseCurrency) => {
  const groupedByName = groupBy(subscriptions, (item) =>
    item.name.toLowerCase()
  );
  const opportunities = [
    ...identifyDuplicateServices(groupedByName, baseCurrency).filter(
      (item) => item.type !== "keep"
    ),
    ...identifyUnusedSubscriptions(subscriptions, baseCurrency),
    ...identifyPlanOptimizations(subscriptions, baseCurrency),
  ];

  return opportunities
    .sort((a, b) => b.potentialSavings - a.potentialSavings)
    .slice(0, 10);
};

const computeBudgetHealth = (budget, subscriptions, baseCurrency, timeline) => {
  const totalMonthlySpend = subscriptions.reduce((total, subscription) => {
    const normalized = convertCurrency(
      subscription.price,
      subscription.currency,
      baseCurrency
    );
    const frequencyDays = FREQUENCY_IN_DAYS[subscription.frequency] ?? 30;
    return total + (normalized / frequencyDays) * 30;
  }, 0);

  const budgetLimit = budget?.monthlyLimit
    ? convertCurrency(budget.monthlyLimit, budget.currency, baseCurrency)
    : null;

  const utilization = budgetLimit
    ? Number(((totalMonthlySpend / budgetLimit) * 100).toFixed(1))
    : null;

  const recentTrend = timeline.slice(-7);
  const avgRecent =
    recentTrend.reduce((sum, item) => sum + item.amount, 0) /
    (recentTrend.length || 1);
  const avgPrevious =
    timeline
      .slice(Math.max(0, timeline.length - 14), timeline.length - 7)
      .reduce((sum, item) => sum + item.amount, 0) / (recentTrend.length || 1);
  const trend = avgPrevious > 0 ? (avgRecent - avgPrevious) / avgPrevious : 0;

  const score = (() => {
    if (!budgetLimit) {
      return clamp(80 - trend * 50, 10, 95);
    }
    const stress = utilization - 80;
    return clamp(95 - Math.max(stress, 0) * 1.2 - trend * 40, 5, 95);
  })();

  return {
    score: Number(score.toFixed(0)),
    utilization,
    monthlySpend: Number(totalMonthlySpend.toFixed(2)),
    limit: budgetLimit ? Number(budgetLimit.toFixed(2)) : null,
    trend: trend > 0.05 ? "down" : trend < -0.05 ? "up" : "stable",
    currency: baseCurrency,
  };
};

const analyzeSubscriptionHabits = (subscriptions, baseCurrency) => {
  const total = subscriptions.length;
  const active = subscriptions.filter(
    (subscription) => subscription.status === "active"
  );
  const byFrequency = subscriptions.reduce((acc, subscription) => {
    acc[subscription.frequency] = (acc[subscription.frequency] ?? 0) + 1;
    return acc;
  }, {});

  const averagePrice = subscriptions.length
    ? subscriptions.reduce(
        (sum, subscription) =>
          sum +
          convertCurrency(
            subscription.price,
            subscription.currency,
            baseCurrency
          ),
        0
      ) / subscriptions.length
    : 0;

  const byCategory = groupBy(subscriptions, (item) => item.category ?? "other");
  const topCategories = Array.from(byCategory.entries())
    .map(([category, items]) => ({
      category,
      total: items.reduce(
        (sum, subscription) =>
          sum +
          convertCurrency(
            subscription.price,
            subscription.currency,
            baseCurrency
          ),
        0
      ),
      count: items.length,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  return {
    total,
    active: active.length,
    byFrequency,
    averagePrice: Number(averagePrice.toFixed(2)),
    topCategories,
  };
};

const suggestCategoryOptimization = (subscriptions, baseCurrency) => {
  const totals = groupBy(
    subscriptions,
    (subscription) => subscription.category ?? "other"
  );
  const categoryTotals = Array.from(totals.entries()).map(
    ([category, list]) => {
      const total = list.reduce(
        (sum, subscription) =>
          sum +
          convertCurrency(
            subscription.price,
            subscription.currency,
            baseCurrency
          ),
        0
      );
      return { category, total, count: list.length };
    }
  );

  if (!categoryTotals.length) return [];

  const avg =
    categoryTotals.reduce((sum, item) => sum + item.total, 0) /
    categoryTotals.length;

  return categoryTotals
    .filter((item) => item.total > avg * 1.3)
    .map((item) => ({
      category: item.category,
      overspend: Number((item.total - avg).toFixed(2)),
      recommendation: `Reduce spending in ${item.category} by ${formatCurrency(
        item.total - avg,
        baseCurrency
      )} to align with other categories.`,
      intensity: clamp((item.total / avg) * 25, 10, 80),
    }));
};

const analyzeRenewalClustering = (subscriptions) => {
  const now = new Date();
  const futureWindow = new Date();
  futureWindow.setDate(futureWindow.getDate() + 60);

  const relevant = subscriptions.filter((subscription) => {
    if (!subscription.renewalDate) return false;
    const renewal = new Date(subscription.renewalDate);
    return renewal >= now && renewal <= futureWindow;
  });

  const clusters = groupBy(relevant, (subscription) => {
    const renewal = new Date(subscription.renewalDate);
    const week = Math.ceil((renewal - now) / (1000 * 60 * 60 * 24) / 7);
    return `Week ${week}`;
  });

  return {
    upcomingClusters: Array.from(clusters.entries())
      .map(([windowLabel, list]) => ({
        windowLabel,
        count: list.length,
        subscriptions: list.map((item) => ({
          id: item._id,
          name: item.name,
          renewalDate: item.renewalDate,
        })),
      }))
      .sort((a, b) => b.count - a.count),
  };
};

const computeCategoryBreakdown = (subscriptions, baseCurrency) => {
  const totals = groupBy(subscriptions, (item) => item.category ?? "other");
  const breakdown = Array.from(totals.entries()).map(([category, list]) => {
    const total = list.reduce(
      (sum, subscription) =>
        sum +
        convertCurrency(
          subscription.price,
          subscription.currency,
          baseCurrency
        ),
      0
    );
    return {
      category,
      total: Number(total.toFixed(2)),
      percentage: 0,
    };
  });

  const overall = breakdown.reduce((sum, item) => sum + item.total, 0) || 1;
  return breakdown.map((item) => ({
    ...item,
    percentage: Number(((item.total / overall) * 100).toFixed(1)),
  }));
};

const generatePredictiveAlerts = (subscriptions, baseCurrency) => {
  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const averagePrice =
    subscriptions.reduce((sum, subscription) => sum + subscription.price, 0) /
    (subscriptions.length || 1);

  return subscriptions.reduce((alerts, subscription) => {
    const renewal = subscription.renewalDate
      ? new Date(subscription.renewalDate)
      : null;
    if (renewal && renewal <= sevenDaysFromNow && renewal >= now) {
      const amount = convertCurrency(
        subscription.price,
        subscription.currency,
        baseCurrency
      );
      alerts.push({
        type: "immediate_renewal",
        title: "Renewal approaching",
        message: `${
          subscription.name
        } renews on ${renewal.toLocaleDateString()} for ${formatCurrency(
          amount,
          baseCurrency
        )}.`,
        priority: "high",
        subscriptionId: subscription._id,
      });
    }

    const priceDelta = subscription.price - averagePrice;
    if (priceDelta > averagePrice * 0.35) {
      alerts.push({
        type: "predicted_price_increase",
        title: "Possible price surge",
        message: `${subscription.name} costs considerably more than similar services. Expect potential increases soon.`,
        priority: "medium",
        subscriptionId: subscription._id,
      });
    }

    return alerts;
  }, []);
};

class SpendingPredictor {
  constructor(baseCurrency) {
    this.baseCurrency = baseCurrency;
  }

  bucketTimelineByMonth(timeline) {
    const buckets = new Map();
    timeline.forEach((entry) => {
      const monthKey = entry.date.slice(0, 7);
      buckets.set(monthKey, (buckets.get(monthKey) ?? 0) + entry.amount);
    });
    return Array.from(buckets.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([month, amount]) => ({ month, amount }));
  }

  calculateConfidence(monthlySeries) {
    if (monthlySeries.length <= 1) return 0.5;
    const amounts = monthlySeries.map((item) => item.amount);
    const average =
      amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const variance =
      amounts.reduce((sum, amount) => sum + (amount - average) ** 2, 0) /
      amounts.length;
    const stdDev = Math.sqrt(variance);
    const coefficient = average ? stdDev / average : 1;
    return clamp(1 - coefficient, 0.25, 0.95);
  }

  identifyKeyFactors(subscriptions) {
    const totals = computeCategoryBreakdown(subscriptions, this.baseCurrency);
    return totals
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)
      .map((item) => `${item.category} (${item.percentage}% of spend)`);
  }

  assessRiskLevel(anomalies, budgetHealth) {
    if (anomalies.length > 4) return "high";
    if (budgetHealth.utilization && budgetHealth.utilization > 95)
      return "high";
    if (
      anomalies.length > 0 ||
      (budgetHealth.utilization && budgetHealth.utilization > 85)
    ) {
      return "medium";
    }
    return "low";
  }

  predictNextMonthSpending(subscriptions, timeline, anomalies, budgetHealth) {
    const monthlySeries = this.bucketTimelineByMonth(timeline).slice(-6);
    const averageMonthly = monthlySeries.length
      ? monthlySeries.reduce((sum, entry) => sum + entry.amount, 0) /
        monthlySeries.length
      : 0;

    const lastMonth = monthlySeries.at(-1)?.amount ?? averageMonthly;
    const previousMonth = monthlySeries.at(-2)?.amount ?? lastMonth;
    const momGrowth = previousMonth
      ? (lastMonth - previousMonth) / previousMonth
      : 0;

    const seasonalAdjustment = monthlySeries.length >= 4 ? 0.05 : 0;
    const basePrediction = averageMonthly;
    const trendAdjustment = momGrowth * basePrediction * 0.6;
    const seasonalContribution = seasonalAdjustment * basePrediction;
    const predictedAmount =
      basePrediction + trendAdjustment + seasonalContribution;

    const confidence = this.calculateConfidence(monthlySeries);
    const riskLevel = this.assessRiskLevel(anomalies, budgetHealth);
    const factors = this.identifyKeyFactors(subscriptions);

    return {
      predictedAmount: Number(predictedAmount.toFixed(2)),
      confidence: Number((confidence * 100).toFixed(0)),
      trend: momGrowth > 0.03 ? "up" : momGrowth < -0.03 ? "down" : "stable",
      factors,
      riskLevel,
      averageMonthly: Number(basePrediction.toFixed(2)),
      lastMonth: Number(lastMonth.toFixed(2)),
    };
  }
}

export const generateSmartInsights = async (userId, period = "30d") => {
  const { days } = getPeriodConfig(period);
  const [subscriptions, bills, budget] = await Promise.all([
    Subscription.find({ user: userId }).lean(),
    Bill.find({ user: userId }).lean(),
    Budget.findOne({ user: userId }).lean(),
  ]);

  const baseCurrency = getBaseCurrency(budget, subscriptions, bills);
  const timeline = buildSpendingTimeline(subscriptions, bills, {
    days,
    baseCurrency,
  });

  const anomalies = detectAnomalies(timeline);
  const savingsOpportunities = findSavingsOpportunities(
    subscriptions,
    baseCurrency
  );
  const budgetHealth = computeBudgetHealth(
    budget,
    subscriptions,
    baseCurrency,
    timeline
  );
  const predictiveAlerts = generatePredictiveAlerts(
    subscriptions,
    baseCurrency
  );
  const subscriptionHabits = analyzeSubscriptionHabits(
    subscriptions,
    baseCurrency
  );
  const categoryOptimization = suggestCategoryOptimization(
    subscriptions,
    baseCurrency
  );
  const renewalClustering = analyzeRenewalClustering(subscriptions);
  const categoryBreakdown = computeCategoryBreakdown(
    subscriptions,
    baseCurrency
  );

  const predictor = new SpendingPredictor(baseCurrency);
  const predictedSpending = predictor.predictNextMonthSpending(
    subscriptions,
    timeline,
    anomalies,
    budgetHealth
  );

  return {
    period,
    currency: baseCurrency,
    spendingTrends: timeline,
    anomalyDetection: anomalies,
    savingsOpportunities,
    budgetHealth,
    predictiveAlerts,
    subscriptionHabits,
    categoryOptimization,
    renewalClustering,
    categoryBreakdown,
    predictedSpending,
  };
};
