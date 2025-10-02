import { useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { formatCurrency } from "../../../utils/formatters";
import InteractiveLineChart from "./InteractiveLineChart";
import InteractivePieChart from "./InteractivePieChart";
import ForecastChart from "./ForecastChart";
import AnomalyChart from "./AnomalyChart";
import SavingsChart from "./SavingsChart";
import PredictiveAlerts from "./PredictiveAlerts";
import SmartRecommendations from "./SmartRecommendations";
import DrilldownModal from "./DrilldownModal";
import AnalyticsLoadingState from "./AnalyticsLoadingState";
import AnalyticsErrorState from "./AnalyticsErrorState";
import AnalyticsHabitsSummary from "./AnalyticsHabitsSummary";
import AnalyticsTimeframeControls from "./AnalyticsTimeframeControls";
import AnalyticsSummaryCards from "./AnalyticsSummaryCards";
import AnalyticsChartSection from "./AnalyticsChartSection";
import { CHART_TABS } from "./analyticsConstants";

const AnalyticsDashboard = ({
  insights,
  isLoading,
  error,
  timeframe,
  onTimeframeChange,
  onRefresh,
  isRefreshing,
  onAssistantPrompt,
}) => {
  const [activeChart, setActiveChart] = useState(CHART_TABS[0].id);
  const [drilldownData, setDrilldownData] = useState(null);

  const cards = useMemo(() => {
    if (!insights) return [];

    const highestOpportunity = insights.savingsOpportunities?.[0];
    const anomaliesCount = insights.anomalyDetection?.length ?? 0;

    return [
      {
        key: "forecast",
        title: "Monthly Forecast",
        value: insights.predictedSpending?.predictedAmount ?? 0,
        trend: insights.predictedSpending?.trend ?? "stable",
        icon: "🔮",
        description: "Projected spending next month",
        color: "purple",
      },
      {
        key: "savings",
        title: "Savings Potential",
        value:
          typeof highestOpportunity?.potentialSavings === "number"
            ? highestOpportunity.potentialSavings
            : 0,
        trend: "opportunity",
        icon: "💰",
        description: highestOpportunity?.title ?? "Top savings opportunity",
        color: "green",
      },
      {
        key: "budget",
        title: "Budget Health",
        value: insights.budgetHealth?.score
          ? `${insights.budgetHealth.score}/100`
          : "No budget",
        trend: insights.budgetHealth?.trend ?? "stable",
        icon: "❤️",
        description: insights.budgetHealth?.utilization
          ? `Utilization at ${insights.budgetHealth.utilization}%`
          : "Set a budget to unlock this insight",
        color: "blue",
      },
      {
        key: "anomalies",
        title: "Anomalies Detected",
        value: `${anomaliesCount}`,
        trend: anomaliesCount > 0 ? "alert" : "stable",
        icon: "⚠️",
        description:
          anomaliesCount > 0
            ? "Unusual activity spotted"
            : "Everything looks steady",
        color: "orange",
      },
    ];
  }, [insights]);

  const chartContent = useMemo(() => {
    if (!insights) {
      return (
        <div className="flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-secondary shadow-sm">
          No data to visualise yet.
        </div>
      );
    }

    switch (activeChart) {
      case "spending":
        return (
          <InteractiveLineChart
            data={insights.spendingTrends}
            currency={insights.currency}
            onDataPointClick={(payload) => setDrilldownData(payload)}
          />
        );
      case "categories":
        return (
          <InteractivePieChart
            data={insights.categoryBreakdown}
            onSegmentClick={(payload) => setDrilldownData(payload)}
          />
        );
      case "forecast":
        return (
          <ForecastChart
            data={insights.predictedSpending}
            historical={insights.spendingTrends}
            currency={insights.currency}
          />
        );
      case "anomalies":
        return (
          <AnomalyChart
            data={insights.anomalyDetection}
            baseline={insights.spendingTrends}
            currency={insights.currency}
            onPointClick={(payload) => setDrilldownData(payload)}
          />
        );
      case "savings":
        return (
          <SavingsChart
            opportunities={insights.savingsOpportunities}
            currency={insights.currency}
            onBarClick={(payload) => setDrilldownData(payload)}
          />
        );
      default:
        return null;
    }
  }, [activeChart, insights]);

  const handleAlertDetails = useCallback(
    (alert) => {
      if (!alert) {
        return;
      }

      const parts = [
        alert.message ? `Details: ${alert.message}` : null,
        alert.priority ? `Priority: ${alert.priority}` : null,
        alert.type ? `Alert type: ${alert.type}` : null,
        alert.subscriptionId
          ? `Subscription reference: ${alert.subscriptionId}`
          : null,
      ].filter(Boolean);

      const contextLine = parts.length ? `${parts.join(" | ")}.` : "";

      const prompt = `I just received a predictive alert titled "${alert.title}". ${contextLine} Please explain why this alert matters and outline the recommended next steps.`;

      onAssistantPrompt?.(prompt.trim());
    },
    [onAssistantPrompt]
  );

  const handleRecommendationAssist = useCallback(
    (opportunity) => {
      if (!onAssistantPrompt) {
        return;
      }

      if (!opportunity) {
        onAssistantPrompt(
          "I don't see any smart recommendations right now. Please review my subscription spending and suggest fresh ways to save money."
        );
        return;
      }

      const parts = [
        opportunity.description ? `Context: ${opportunity.description}.` : null,
        opportunity.type ? `Opportunity type: ${opportunity.type}.` : null,
        Array.isArray(opportunity.subscriptionIds) &&
        opportunity.subscriptionIds.length
          ? `Related subscriptions: ${opportunity.subscriptionIds.join(", ")}.`
          : null,
        typeof opportunity.potentialSavings === "number"
          ? `Estimated savings: ${formatCurrency(
              opportunity.potentialSavings,
              insights?.currency || "USD"
            )}.`
          : null,
      ].filter(Boolean);

      const prompt = `Help me evaluate the smart recommendation "${
        opportunity.title || "Untitled"
      }". ${parts.join(
        " "
      )} Provide the reasoning behind it and outline clear next steps I can take now.`;

      onAssistantPrompt(prompt.trim());
    },
    [insights?.currency, onAssistantPrompt]
  );

  if (isLoading) {
    return <AnalyticsLoadingState />;
  }

  if (error) {
    return <AnalyticsErrorState error={error} onRetry={onRefresh} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-primary">
            Financial Insights
          </h2>
          <p className="text-sm text-secondary">
            Interactive analytics tailored to your subscriptions.
          </p>
        </div>
        <AnalyticsTimeframeControls
          timeframe={timeframe}
          onTimeframeChange={onTimeframeChange}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
      </div>

      <AnalyticsSummaryCards cards={cards} currency={insights?.currency} />

      <AnalyticsChartSection
        activeChart={activeChart}
        onChartChange={setActiveChart}
      >
        {chartContent}
      </AnalyticsChartSection>

      <AnalyticsHabitsSummary
        habits={insights?.subscriptionHabits}
        currency={insights?.currency}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-primary">
            Predictive Alerts
          </h3>
          <p className="mt-1 text-sm text-secondary">
            Stay ahead of renewals and price changes.
          </p>
          <div className="mt-4">
            <PredictiveAlerts
              alerts={insights?.predictiveAlerts}
              onViewDetails={handleAlertDetails}
            />
          </div>
        </div>
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-primary">
            Smart Recommendations
          </h3>
          <p className="mt-1 text-sm text-secondary">
            Personalized savings ideas based on your habits.
          </p>
          <div className="mt-4">
            <SmartRecommendations
              opportunities={insights?.savingsOpportunities}
              currency={insights?.currency}
              onAskAssistant={handleRecommendationAssist}
            />
          </div>
        </div>
      </div>

      {insights?.categoryOptimization?.length > 0 && (
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-primary">
            Category Optimization Tips
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {insights.categoryOptimization.map((item) => (
              <div
                key={item.category}
                className="rounded-2xl border border-blue-200 bg-blue-50 p-4"
              >
                <p className="text-sm font-semibold text-blue-600">
                  {item.category}
                </p>
                <p className="mt-2 text-xs text-blue-600/80">
                  {item.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {insights?.renewalClustering?.upcomingClusters?.length > 0 && (
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-primary">
            Upcoming Renewal Clusters
          </h3>
          <p className="mt-1 text-sm text-secondary">
            Prepare for busy renewal weeks ahead.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {insights.renewalClustering.upcomingClusters.map((cluster) => (
              <div
                key={cluster.windowLabel}
                className="rounded-2xl border border-violet-200 bg-violet-50 p-4"
              >
                <p className="text-sm font-semibold text-violet-600">
                  {cluster.windowLabel}
                </p>
                <p className="mt-2 text-xs text-violet-600/80">
                  {cluster.count} renewals
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {drilldownData && (
        <DrilldownModal
          data={drilldownData}
          currency={insights?.currency}
          onClose={() => setDrilldownData(null)}
        />
      )}
    </div>
  );
};

AnalyticsDashboard.propTypes = {
  insights: PropTypes.shape({
    predictedSpending: PropTypes.object,
    savingsOpportunities: PropTypes.array,
    budgetHealth: PropTypes.object,
    anomalyDetection: PropTypes.array,
    spendingTrends: PropTypes.array,
    categoryBreakdown: PropTypes.array,
    predictiveAlerts: PropTypes.array,
    subscriptionHabits: PropTypes.object,
    categoryOptimization: PropTypes.array,
    renewalClustering: PropTypes.shape({
      upcomingClusters: PropTypes.array,
    }),
    currency: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  timeframe: PropTypes.string.isRequired,
  onTimeframeChange: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  isRefreshing: PropTypes.bool,
  onAssistantPrompt: PropTypes.func,
};

AnalyticsDashboard.defaultProps = {
  insights: null,
  isLoading: false,
  error: null,
  isRefreshing: false,
  onAssistantPrompt: undefined,
};

export default AnalyticsDashboard;
