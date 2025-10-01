import Subscription from "../../models/subscriptionModel.js";
import Bill from "../../models/billModel.js";
import Budget from "../../models/budgetModel.js";
import llmProvider from "./llmProvider.js";
import { generateSmartInsights } from "../insights/smartInsightsService.js";

const FREQUENCY_IN_DAYS = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  yearly: 365,
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const formatCurrency = (amount = 0, currency = "USD") => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount ?? 0);
  } catch {
    return `$${Number(amount ?? 0).toFixed(2)}`;
  }
};

const normalizeMonthlyCost = (subscription, baseCurrency = "USD") => {
  const frequencyDays = FREQUENCY_IN_DAYS[subscription.frequency] ?? 30;
  const price = subscription.price ?? 0;
  const converted = subscription.currency === baseCurrency ? price : price; // TODO: currency conversion once multi-currency data is available
  return (converted / frequencyDays) * 30;
};

const sumBy = (collection, iteratee) =>
  collection.reduce((total, item) => total + iteratee(item), 0);

const groupBy = (collection, fn) => {
  const map = new Map();
  collection.forEach((item) => {
    const key = fn(item);
    map.set(key, [...(map.get(key) ?? []), item]);
  });
  return map;
};

class FinancialAssistantService {
  constructor() {
    this.conversationHistory = new Map();
  }

  getHistory(userId) {
    return this.conversationHistory.get(String(userId)) ?? [];
  }

  setHistory(userId, history) {
    this.conversationHistory.set(String(userId), history.slice(-15));
  }

  async processUserQuery(userId, rawQuery, context = {}) {
    if (!rawQuery || !rawQuery.trim()) {
      throw new Error("A query is required to process a request.");
    }

    const query = rawQuery.trim();
    const intent = await this.analyzeIntent(query);
    const userContext = await this.getUserContext(userId);
    const persona = context.persona ?? this.buildPersonaFallback(userContext);
    const knowledgeBase = this.buildKnowledgeBase(userContext);

    const persistedHistory = this.getHistory(userId);
    const providedHistory = context.conversationHistory ?? [];
    const history = [...persistedHistory, ...providedHistory]
      .slice(-10)
      .map((item) => ({
        role: item.type === "assistant" ? "assistant" : "user",
        content:
          typeof item.content === "string"
            ? item.content
            : item.content?.text ?? "",
      }));

    const llmResponse = await llmProvider.generate({
      intent,
      query,
      userContext,
      persona,
      knowledgeBase,
      conversationHistory: history,
    });

    const structuredResponse = await this.generateResponse(
      intent.intent,
      userContext,
      query,
      llmResponse
    );

    const suggestions = await this.generateSuggestions(intent.intent);
    const actions = await this.generateActions(intent.intent, userContext);

    const newHistory = [
      ...persistedHistory,
      { type: "user", content: query, timestamp: new Date() },
      {
        type: "assistant",
        content: structuredResponse,
        timestamp: new Date(),
        intent: intent.intent,
      },
    ];

    this.setHistory(userId, newHistory);

    return {
      response: structuredResponse,
      suggestions,
      actions,
      confidence: intent.confidence,
    };
  }

  async analyzeIntent(query) {
    const intents = {
      spending: ["how much", "spent", "spending", "cost", "expense"],
      savings: ["save", "savings", "cheaper", "reduce", "cut"],
      trends: ["trend", "chart", "graph", "over time", "pattern"],
      alerts: ["alert", "notification", "remind", "warning", "risk"],
      comparison: ["compare", "vs", "versus", "difference", "better"],
    };

    const queryLower = query.toLowerCase();
    let matchedIntent = "general";
    let confidence = 0.6;

    Object.entries(intents).forEach(([intent, keywords]) => {
      const matches = keywords.filter((keyword) =>
        queryLower.includes(keyword)
      );
      if (matches.length > 0 && confidence < 0.9 + matches.length * 0.02) {
        matchedIntent = intent;
        confidence = clamp(0.8 + matches.length * 0.05, 0.8, 0.98);
      }
    });

    return { intent: matchedIntent, confidence };
  }

  async getUserContext(userId) {
    const [subscriptions, bills, budget, smartInsights] = await Promise.all([
      Subscription.find({ user: userId }).lean(),
      Bill.find({ user: userId }).lean(),
      Budget.findOne({ user: userId }).lean(),
      generateSmartInsights(userId, "30d"),
    ]);

    const baseCurrency =
      budget?.currency || subscriptions[0]?.currency || "USD";

    const monthlySpending = sumBy(subscriptions, (subscription) =>
      normalizeMonthlyCost(subscription, baseCurrency)
    );

    const categories = groupBy(
      subscriptions,
      (subscription) => subscription.category ?? "other"
    );

    const topCategories = Array.from(categories.entries())
      .map(([category, items]) => ({
        name: category,
        amount: sumBy(items, (item) =>
          normalizeMonthlyCost(item, baseCurrency)
        ),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    const { currentMonth, previousMonth, delta } =
      this.calculateMonthlyComparison(smartInsights.spendingTrends);

    return {
      baseCurrency,
      monthlySpending: Number(monthlySpending.toFixed(2)),
      topCategories,
      monthlyComparison: {
        current: currentMonth,
        previous: previousMonth,
        delta,
      },
      savingsOpportunities: smartInsights.savingsOpportunities ?? [],
      anomalies: smartInsights.anomalyDetection ?? [],
      budgetHealth: smartInsights.budgetHealth ?? null,
      predictiveAlerts: smartInsights.predictiveAlerts ?? [],
      subscriptionHabits: smartInsights.subscriptionHabits ?? null,
      predictedSpending: smartInsights.predictedSpending ?? null,
      renewalClustering: smartInsights.renewalClustering ?? null,
      categoryBreakdown: smartInsights.categoryBreakdown ?? [],
      raw: {
        subscriptions,
        bills,
        budget,
      },
    };
  }

  calculateMonthlyComparison(spendingTimeline = []) {
    if (!spendingTimeline.length) {
      return { currentMonth: 0, previousMonth: 0, delta: 0 };
    }

    const current = spendingTimeline.slice(-30);
    const previous = spendingTimeline.slice(-60, -30);

    const currentTotal = sumBy(current, (item) => item.amount ?? 0);
    const previousTotal = sumBy(previous, (item) => item.amount ?? 0);
    const delta = previousTotal
      ? ((currentTotal - previousTotal) / previousTotal) * 100
      : 0;

    return {
      currentMonth: Number(currentTotal.toFixed(2)),
      previousMonth: Number(previousTotal.toFixed(2)),
      delta: Number(delta.toFixed(1)),
    };
  }

  buildPersonaFallback(userContext) {
    const { budgetHealth, subscriptionHabits } = userContext ?? {};
    const utilization = budgetHealth?.utilization ?? 0;
    const frequencyMix = subscriptionHabits?.byFrequency ?? {};
    const activeSubCount = subscriptionHabits?.active ?? 0;

    const variabilityScore = Object.values(frequencyMix).length;

    let spendingStyle = "balanced_adaptive";
    if (utilization > 90 || activeSubCount > 15) {
      spendingStyle = "exploratory_variable";
    } else if (utilization < 60 && variabilityScore <= 2) {
      spendingStyle = "conservative_consistent";
    }

    return {
      spendingStyle,
      riskTolerance:
        utilization > 90 ? "high" : utilization > 70 ? "medium" : "low",
      financialGoals: [
        utilization > 80 ? "reduce_monthly_spend" : "optimize_value",
      ],
      preferredCommunication:
        spendingStyle === "exploratory_variable" ? "dynamic" : "concise",
      learningPriority:
        spendingStyle === "conservative_consistent"
          ? "discover_alternatives"
          : "optimize_budget",
    };
  }

  async generateResponse(intent, userContext, query, llmText) {
    const generatorMap = {
      spending: this.generateSpendingResponse.bind(this),
      savings: this.generateSavingsResponse.bind(this),
      trends: this.generateTrendsResponse.bind(this),
      alerts: this.generateAlertsResponse.bind(this),
      comparison: this.generateComparisonResponse.bind(this),
      general: this.generateGeneralResponse.bind(this),
    };

    const handler = generatorMap[intent] ?? generatorMap.general;
    const response = await handler(userContext, query);

    return {
      ...response,
      text: llmText ?? response.text,
    };
  }

  async generateSpendingResponse(userContext) {
    const { monthlySpending, topCategories, monthlyComparison, baseCurrency } =
      userContext;

    const topCategoryCopy = topCategories
      .map((cat) => `${cat.name}: ${formatCurrency(cat.amount, baseCurrency)}`)
      .join("; ");

    const deltaCopy = monthlyComparison.delta
      ? `${monthlyComparison.delta > 0 ? "up" : "down"} ${Math.abs(
          monthlyComparison.delta
        )}% versus last month`
      : "tracking similarly to last month";

    return {
      text: `You've spent ${formatCurrency(
        monthlySpending,
        baseCurrency
      )} this month. Your biggest expenses are ${
        topCategoryCopy || "well distributed"
      }, and you're ${deltaCopy}.`,
      data: {
        monthlySpending,
        topCategories,
        comparison: monthlyComparison,
      },
      type: "spending_summary",
    };
  }

  async generateSavingsResponse(userContext) {
    const { savingsOpportunities, baseCurrency } = userContext;

    const topSuggestions = savingsOpportunities.slice(0, 3);
    const potentialSavings = topSuggestions.reduce(
      (total, item) => total + (item.potentialSavings ?? 0),
      0
    );

    return {
      text:
        topSuggestions.length > 0
          ? `I found ${topSuggestions.length} quick win$${
              topSuggestions.length > 1 ? "s" : ""
            } to lower your costs. Acting on them could free up ${formatCurrency(
              potentialSavings,
              baseCurrency
            )} this month.`
          : "Your subscriptions already look lean. Keep checking back for new savings opportunities as your usage changes.",
      data: {
        opportunities: topSuggestions,
        potentialSavings,
      },
      type: "savings_recommendation",
    };
  }

  async generateTrendsResponse(userContext) {
    const { predictedSpending, anomalies, baseCurrency } = userContext;
    const { predictedAmount, trend, confidence } = predictedSpending ?? {};

    return {
      text:
        predictedAmount && confidence
          ? `You're on track to spend ${formatCurrency(
              predictedAmount,
              baseCurrency
            )} next month with a ${confidence}% confidence. The trajectory looks ${
              trend ?? "stable"
            }, and recent anomalies show ${anomalies.length} unusual spike${
              anomalies.length === 1 ? "" : "s"
            } worth reviewing.`
          : "Your spending trend looks steady. Keep an eye on any anomalies that pop up for deeper dives.",
      data: {
        predictedSpending,
        anomalies: anomalies.slice(0, 5),
      },
      type: "trend_overview",
    };
  }

  async generateAlertsResponse(userContext) {
    const { predictiveAlerts } = userContext;

    return {
      text:
        predictiveAlerts.length > 0
          ? `You have ${predictiveAlerts.length} smart alert$${
              predictiveAlerts.length > 1 ? "s" : ""
            } to review. Prioritize the high-priority items so nothing slips through the cracks.`
          : "You're all clear right now. I'll keep watching for anything unusual and flag it here first.",
      data: {
        alerts: predictiveAlerts,
      },
      type: "alert_summary",
    };
  }

  async generateComparisonResponse(userContext) {
    const { topCategories, monthlySpending, monthlyComparison } = userContext;

    const previous = monthlyComparison.previous || 1;
    const perCategory = topCategories.map((cat) => ({
      ...cat,
      share: Number(((cat.amount / monthlySpending) * 100).toFixed(1)),
    }));

    return {
      text: `Compared to last month, you're spending ${
        monthlyComparison.delta > 0 ? "more" : "less"
      } across top categories. ${
        perCategory[0]?.name ?? "Your leading category"
      } accounts for ${perCategory[0]?.share ?? ""}%.`,
      data: {
        monthlySpending,
        previousSpend: previous,
        categories: perCategory,
        comparison: monthlyComparison,
      },
      type: "comparison_insight",
    };
  }

  async generateGeneralResponse(userContext) {
    const { budgetHealth, baseCurrency } = userContext;

    const utilizationCopy = budgetHealth?.utilization
      ? `You're using ${Math.round(budgetHealth.utilization)}% of your budget`
      : "Your budget isn't set yet";

    return {
      text: `${utilizationCopy}. Ask about savings opportunities or request a quick spending breakdown anytime.`,
      data: {
        budgetHealth,
        currency: baseCurrency,
      },
      type: "general_guidance",
    };
  }

  buildKnowledgeBase(userContext) {
    if (!userContext) return "";

    const {
      baseCurrency,
      monthlySpending,
      topCategories = [],
      monthlyComparison,
      savingsOpportunities = [],
      predictiveAlerts = [],
      anomalies = [],
      budgetHealth,
      predictedSpending,
      renewalClustering,
      categoryBreakdown = [],
      raw = {},
    } = userContext;

    const lines = [];

    lines.push(`Base currency: ${baseCurrency}`);
    lines.push(
      `Monthly spending: ${formatCurrency(monthlySpending, baseCurrency)} (${
        monthlyComparison?.delta ?? 0
      }% change vs previous month)`
    );

    if (budgetHealth) {
      lines.push(
        `Budget utilization: ${budgetHealth.utilization ?? "n/a"}% of ${
          budgetHealth.limit
            ? formatCurrency(budgetHealth.limit, baseCurrency)
            : "no set limit"
        }`
      );
    }

    if (predictedSpending?.predictedAmount) {
      lines.push(
        `Next month forecast: ${formatCurrency(
          predictedSpending.predictedAmount,
          baseCurrency
        )} (${predictedSpending.trend} trend, confidence ${
          predictedSpending.confidence
        }%)`
      );
    }

    if (topCategories.length) {
      lines.push("Top spending categories:");
      topCategories.slice(0, 5).forEach((category) => {
        lines.push(
          `  - ${category.name}: ${formatCurrency(
            category.amount,
            baseCurrency
          )}`
        );
      });
    }

    if (categoryBreakdown.length) {
      lines.push("Category breakdown (% of spend):");
      categoryBreakdown.slice(0, 6).forEach((category) => {
        lines.push(
          `  - ${category.category}: ${category.percentage}% (${formatCurrency(
            category.total,
            baseCurrency
          )})`
        );
      });
    }

    const subscriptions = raw.subscriptions ?? [];
    if (subscriptions.length) {
      lines.push("Key subscriptions (up to 10):");
      subscriptions.slice(0, 10).forEach((subscription) => {
        const renewal = subscription.renewalDate
          ? new Date(subscription.renewalDate).toLocaleDateString()
          : "n/a";
        lines.push(
          `  - ${subscription.name} | ${formatCurrency(
            normalizeMonthlyCost(subscription, baseCurrency),
            baseCurrency
          )}/month | status: ${subscription.status} | renewal: ${renewal}`
        );
      });
    }

    const bills = raw.bills ?? [];
    if (bills.length) {
      lines.push("Recent bills (up to 5):");
      bills.slice(0, 5).forEach((bill) => {
        const due = bill.dueDate
          ? new Date(bill.dueDate).toLocaleDateString()
          : "n/a";
        lines.push(
          `  - ${bill.name ?? bill.category ?? "Bill"}: ${formatCurrency(
            bill.amount,
            bill.currency || baseCurrency
          )} due ${due} (${bill.status})`
        );
      });
    }

    if (renewalClustering?.upcomingClusters?.length) {
      lines.push("Renewal clusters:");
      renewalClustering.upcomingClusters.slice(0, 5).forEach((cluster) => {
        lines.push(
          `  - ${cluster.windowLabel}: ${cluster.count} renewals approaching`
        );
      });
    }

    if (savingsOpportunities.length) {
      lines.push("Savings opportunities (top 5):");
      savingsOpportunities.slice(0, 5).forEach((opportunity) => {
        lines.push(
          `  - ${opportunity.title} (${
            opportunity.type
          }) | Potential: ${formatCurrency(
            opportunity.potentialSavings,
            baseCurrency
          )}`
        );
      });
    }

    if (predictiveAlerts.length) {
      lines.push("Active smart alerts (top 5):");
      predictiveAlerts.slice(0, 5).forEach((alert) => {
        lines.push(`  - ${alert.title}: ${alert.message}`);
      });
    }

    if (anomalies.length) {
      lines.push("Recent anomalies:");
      anomalies.slice(0, 3).forEach((anomaly) => {
        lines.push(
          `  - ${anomaly.date}: ${formatCurrency(
            anomaly.amount,
            baseCurrency
          )} (${anomaly.type} ${anomaly.deviation}% vs average)`
        );
      });
    }

    return lines.join("\n");
  }

  async generateSuggestions(intent) {
    const baseSuggestions = [
      "How can I save more this month?",
      "What are my most expensive subscriptions?",
      "Show me upcoming renewals.",
    ];

    switch (intent) {
      case "spending":
        return [
          "Break down my spending by category.",
          "How does this month compare to last month?",
          "Which subscription increased the most?",
        ];
      case "savings":
        return [
          "Which subscriptions should I cancel?",
          "Do I have duplicate services?",
          "Is there a cheaper plan available?",
        ];
      case "trends":
        return [
          "What is my spending forecast?",
          "Show me anomalies this month.",
          "How stable is my subscription mix?",
        ];
      case "alerts":
        return [
          "What should I act on first?",
          "Any renewals coming up soon?",
          "How can I avoid surprise charges?",
        ];
      case "comparison":
        return [
          "Compare streaming vs productivity spend.",
          "Am I paying more than last quarter?",
          "Where can I rebalance my budget?",
        ];
      default:
        return baseSuggestions;
    }
  }

  async generateActions(intent, userContext) {
    const { savingsOpportunities, predictiveAlerts } = userContext;

    if (intent === "savings" && savingsOpportunities.length > 0) {
      return savingsOpportunities.slice(0, 3).map((opportunity) => ({
        label: `Review ${opportunity.title}`,
        query: `Tell me more about ${opportunity.title}`,
      }));
    }

    if (intent === "alerts" && predictiveAlerts.length > 0) {
      return predictiveAlerts.slice(0, 3).map((alert) => ({
        label: `Open alert for ${alert.title}`,
        query: `How do I resolve the ${alert.title} alert?`,
      }));
    }

    return [
      {
        label: "Show savings opportunities",
        query: "What are my top savings opportunities?",
      },
      {
        label: "Review upcoming renewals",
        query: "Which renewals are coming up soon?",
      },
    ];
  }

  async generateSmartAlerts(userId) {
    const [subscriptions, budget] = await Promise.all([
      Subscription.find({ user: userId }).lean(),
      Budget.findOne({ user: userId }).lean(),
    ]);

    const alerts = [];
    const baseCurrency =
      budget?.currency || subscriptions[0]?.currency || "USD";
    const currentSpending = sumBy(subscriptions, (subscription) =>
      normalizeMonthlyCost(subscription, baseCurrency)
    );

    if (budget?.monthlyLimit) {
      const projected = currentSpending;
      if (projected > budget.monthlyLimit * 1.1) {
        alerts.push({
          type: "spending_pace",
          title: "Spending ahead of pace",
          message: `You're on track to exceed your budget by ${formatCurrency(
            projected - budget.monthlyLimit,
            baseCurrency
          )}.`,
          severity: "high",
          suggestedAction: "review_subscriptions",
        });
      }
    }

    const duplicates = this.findDuplicateServices(subscriptions);
    if (duplicates.length > 0) {
      alerts.push({
        type: "duplicate_services",
        title: "Possible duplicate services",
        message: `You might be paying for similar services: ${duplicates
          .map((item) => item.name)
          .join(", ")}.`,
        severity: "medium",
        suggestedAction: "review_duplicates",
      });
    }

    const potentialIncreases = this.predictPriceIncreases(subscriptions);
    alerts.push(...potentialIncreases);

    return alerts;
  }

  findDuplicateServices(subscriptions) {
    const grouped = groupBy(subscriptions, (subscription) =>
      subscription.name.trim().toLowerCase()
    );

    return Array.from(grouped.values())
      .filter((group) => group.length > 1)
      .flatMap((group) =>
        group.map((item) => ({
          id: item._id,
          name: item.name,
        }))
      );
  }

  predictPriceIncreases(subscriptions) {
    if (!subscriptions.length) return [];

    const averagePrice =
      subscriptions.reduce((sum, subscription) => sum + subscription.price, 0) /
      subscriptions.length;

    return subscriptions
      .filter((subscription) => subscription.price > averagePrice * 1.4)
      .map((subscription) => ({
        type: "price_increase",
        title: `${subscription.name} might increase soon`,
        message: `${subscription.name} costs more than similar services. Keep an eye on future invoices just in case.`,
        severity: "medium",
        suggestedAction: "compare_plans",
      }));
  }
}

const financialAssistant = new FinancialAssistantService();

export default financialAssistant;
