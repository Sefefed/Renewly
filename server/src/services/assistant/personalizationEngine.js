import Subscription from "../../models/subscriptionModel.js";
import Budget from "../../models/budgetModel.js";
import { generateSmartInsights } from "../insights/smartInsightsService.js";

class PersonalizationEngine {
  async getUserPersona(userId) {
    const [subscriptions, budget, insights] = await Promise.all([
      Subscription.find({ user: userId }).lean(),
      Budget.findOne({ user: userId }).lean(),
      generateSmartInsights(userId, "90d"),
    ]);

    const monthlySeries = insights.spendingTrends ?? [];
    const categoryBreakdown = insights.categoryBreakdown ?? [];

    const userData = {
      subscriptions,
      budget,
      monthlySpending: monthlySeries,
      categories: categoryBreakdown,
      anomalies: insights.anomalyDetection ?? [],
      budgetHealth: insights.budgetHealth ?? null,
    };

    return {
      spendingStyle: this.analyzeSpendingStyle(userData),
      riskTolerance: this.assessRiskTolerance(userData),
      financialGoals: this.extractFinancialGoals(userData),
      preferredCommunication: this.determineCommunicationStyle(userData),
      learningPriority: this.assessLearningNeeds(userData),
    };
  }

  analyzeSpendingStyle(userData) {
    const { monthlySpending, categories } = userData;

    const amounts = monthlySpending.map((entry) => entry.amount ?? 0);
    const average = amounts.length
      ? amounts.reduce((sum, value) => sum + value, 0) / amounts.length
      : 0;
    const variance = amounts.length
      ? amounts.reduce((sum, value) => sum + (value - average) ** 2, 0) /
        amounts.length
      : 0;
    const stdDev = Math.sqrt(variance);
    const variability = average ? stdDev / average : 0;
    const categoryDiversity = categories.length;

    if (variability < 0.1 && categoryDiversity < 3) {
      return "conservative_consistent";
    }
    if (variability > 0.3 && categoryDiversity > 5) {
      return "exploratory_variable";
    }
    return "balanced_adaptive";
  }

  assessRiskTolerance(userData) {
    const utilization = userData.budgetHealth?.utilization ?? 0;
    if (utilization > 95) return "high";
    if (utilization > 75) return "medium";
    return "low";
  }

  extractFinancialGoals(userData) {
    const goals = [];
    const { budgetHealth, categories, anomalies } = userData;

    if (!budgetHealth?.limit) {
      goals.push("set_budget");
    } else if (budgetHealth.utilization > 90) {
      goals.push("reduce_utilization");
    }

    const heavyCategories = categories.filter(
      (category) => category.percentage > 35
    );
    if (heavyCategories.length > 0) {
      goals.push("rebalance_categories");
    }

    if (anomalies.length > 0) {
      goals.push("investigate_anomalies");
    }

    if (!goals.length) {
      goals.push("optimize_value");
    }

    return goals;
  }

  determineCommunicationStyle(userData) {
    const subscriptionCount = userData.subscriptions.length;
    if (subscriptionCount > 20) {
      return "bullet";
    }
    if (subscriptionCount <= 5) {
      return "conversational";
    }
    return "concise";
  }

  assessLearningNeeds(userData) {
    const hasBudget = Boolean(userData.budget);
    const hasHighVariability =
      this.analyzeSpendingStyle(userData) === "exploratory_variable";

    if (!hasBudget) {
      return "build_budget_basics";
    }
    if (hasHighVariability) {
      return "control_variability";
    }
    return "optimize_existing";
  }

  async getCurrentContext(userId) {
    const insights = await generateSmartInsights(userId, "30d");
    return {
      anomalies: insights.anomalyDetection ?? [],
      savingsOpportunities: insights.savingsOpportunities ?? [],
      alerts: insights.predictiveAlerts ?? [],
    };
  }

  async generatePersonalizedTips(userId) {
    const persona = await this.getUserPersona(userId);
    const context = await this.getCurrentContext(userId);

    const tipLibrary = {
      conservative_consistent: [
        "Consider exploring budget-friendly alternatives to your regular services.",
        "Your consistent spending pattern makes you a great candidate for annual plans.",
        "Automate savings transfers to make the most of your predictable cash flow.",
      ],
      exploratory_variable: [
        "Track your variable spending to uncover optimization opportunities.",
        "Categorize subscriptions by necessity versus nice-to-have to prioritize savings.",
        "Use Renewly's discovery tools to find better-value alternatives when you experiment.",
      ],
      balanced_adaptive: [
        "Fine-tune your setup with analytics to stay ahead of future changes.",
        "Enable smart alerts so unusual activity is flagged immediately.",
        "Compare similar services periodically to make sure you're getting the best value.",
      ],
    };

    const primaryTips = tipLibrary[persona.spendingStyle] ?? [
      "Start by exploring your spending patterns in the analytics dashboard.",
    ];

    const adaptiveTips = [];
    if (context.anomalies.length > 0) {
      adaptiveTips.push(
        "Review this month's anomalies so nothing slips by unnoticed."
      );
    }
    if (context.savingsOpportunities.length > 0) {
      adaptiveTips.push(
        "Act on one savings opportunity this week to reduce monthly costs."
      );
    }
    if (context.alerts.length > 0) {
      adaptiveTips.push(
        "Prioritize the high-severity alerts to avoid surprise renewals."
      );
    }

    return [...primaryTips.slice(0, 2), ...adaptiveTips.slice(0, 2)];
  }
}

const personalizationEngine = new PersonalizationEngine();

export default personalizationEngine;
