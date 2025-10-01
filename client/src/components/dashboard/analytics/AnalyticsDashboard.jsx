import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import SkeletonCard from "../../ui/SkeletonCard";
import InsightCard from "./InsightCard";
import InteractiveLineChart from "./InteractiveLineChart";
import InteractivePieChart from "./InteractivePieChart";
import ForecastChart from "./ForecastChart";
import AnomalyChart from "./AnomalyChart";
import SavingsChart from "./SavingsChart";
import PredictiveAlerts from "./PredictiveAlerts";
import SmartRecommendations from "./SmartRecommendations";
import DrilldownModal from "./DrilldownModal";
import { formatCurrency } from "../../../utils/formatters";

const TIMEFRAME_OPTIONS = [
  { id: "7d", label: "7D", icon: "📅" },
  { id: "30d", label: "30D", icon: "📊" },
  { id: "90d", label: "90D", icon: "📈" },
  { id: "1y", label: "1Y", icon: "🎯" },
];

const CHART_TABS = [
  { id: "spending", label: "Spending Trends", icon: "📈" },
  { id: "categories", label: "Category Breakdown", icon: "📊" },
  { id: "forecast", label: "Spending Forecast", icon: "🔮" },
  { id: "anomalies", label: "Anomalies", icon: "🎯" },
  { id: "savings", label: "Savings", icon: "💰" },
];

const LoadingState = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonCard key={`insight-skeleton-${index}`} lines={3} />
      ))}
    </div>
    <SkeletonCard lines={4} className="h-96" />
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-8 text-red-200">
    <h3 className="text-xl font-semibold">
      We couldn&apos;t load smart insights
    </h3>
    <p className="mt-2 text-sm text-red-200/80">{error}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 rounded-xl bg-red-500/20 px-4 py-2 text-sm font-medium text-red-100 transition-colors hover:bg-red-500/30 hover:text-white"
      >
        Try again
      </button>
    )}
  </div>
);

ErrorState.propTypes = {
  error: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
};

ErrorState.defaultProps = {
  onRetry: undefined,
};

const HabitsSummary = ({ habits, currency }) => {
  if (!habits) return null;

  const freqEntries = Object.entries(habits.byFrequency ?? {});

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-gray-700/40 bg-gradient-to-br from-gray-800/70 to-gray-900/70 p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
          Active habits
        </p>
        <p className="mt-3 text-2xl font-semibold text-white">
          {habits.active}/{habits.total}
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Average price {formatCurrency(habits.averagePrice ?? 0, currency)}
        </p>
      </div>
      <div className="rounded-2xl border border-gray-700/40 bg-gradient-to-br from-gray-800/70 to-gray-900/70 p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
          Frequency mix
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-300">
          {freqEntries.length ? (
            freqEntries.map(([frequency, count]) => (
              <span
                key={frequency}
                className="rounded-full bg-blue-500/10 px-3 py-1 text-blue-200"
              >
                {frequency}: {count}
              </span>
            ))
          ) : (
            <span className="text-gray-500">No usage data</span>
          )}
        </div>
      </div>
    </div>
  );
};

HabitsSummary.propTypes = {
  habits: PropTypes.shape({
    total: PropTypes.number,
    active: PropTypes.number,
    byFrequency: PropTypes.object,
    averagePrice: PropTypes.number,
  }),
  currency: PropTypes.string,
};

HabitsSummary.defaultProps = {
  habits: null,
  currency: "USD",
};

const AnalyticsDashboard = ({
  insights,
  isLoading,
  error,
  timeframe,
  onTimeframeChange,
  onRefresh,
  isRefreshing,
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

  const renderChart = () => {
    if (!insights) {
      return (
        <div className="flex h-full items-center justify-center rounded-2xl border border-gray-700/40 bg-gray-900/60 text-sm text-gray-400">
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
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRefresh} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text">
            Financial Insights
          </h2>
          <p className="text-sm text-gray-400">
            Interactive analytics tailored to your subscriptions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-700/40 bg-gray-900/70 p-1">
          {TIMEFRAME_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onTimeframeChange(option.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
                timeframe === option.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <span aria-hidden="true">{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => onRefresh(timeframe, { silent: true })}
            className="rounded-xl bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
          >
            {isRefreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <InsightCard
            key={card.key}
            title={card.title}
            value={card.value}
            trend={card.trend}
            icon={card.icon}
            color={card.color}
            description={card.description}
            currency={insights?.currency}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-gray-700/40 bg-gradient-to-br from-gray-800/70 to-gray-900/70 p-6 shadow-2xl">
        <div className="mb-6 flex flex-wrap items-center gap-3 overflow-x-auto">
          {CHART_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveChart(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
                activeChart === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              <span aria-hidden="true">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="h-96">{renderChart()}</div>
      </div>

      <HabitsSummary
        habits={insights?.subscriptionHabits}
        currency={insights?.currency}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-700/40 bg-gradient-to-br from-gray-800/70 to-gray-900/70 p-6">
          <h3 className="text-lg font-semibold text-white">
            Predictive Alerts
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Stay ahead of renewals and price changes.
          </p>
          <div className="mt-4">
            <PredictiveAlerts alerts={insights?.predictiveAlerts} />
          </div>
        </div>
        <div className="rounded-2xl border border-gray-700/40 bg-gradient-to-br from-gray-800/70 to-gray-900/70 p-6">
          <h3 className="text-lg font-semibold text-white">
            Smart Recommendations
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Personalized savings ideas based on your habits.
          </p>
          <div className="mt-4">
            <SmartRecommendations
              opportunities={insights?.savingsOpportunities}
              currency={insights?.currency}
            />
          </div>
        </div>
      </div>

      {insights?.categoryOptimization?.length > 0 && (
        <div className="rounded-2xl border border-gray-700/40 bg-gradient-to-br from-gray-800/70 to-gray-900/70 p-6">
          <h3 className="text-lg font-semibold text-white">
            Category Optimization Tips
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {insights.categoryOptimization.map((item) => (
              <div
                key={item.category}
                className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4"
              >
                <p className="text-sm font-semibold text-blue-200">
                  {item.category}
                </p>
                <p className="mt-2 text-xs text-blue-100/80">
                  {item.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {insights?.renewalClustering?.upcomingClusters?.length > 0 && (
        <div className="rounded-2xl border border-gray-700/40 bg-gradient-to-br from-gray-800/70 to-gray-900/70 p-6">
          <h3 className="text-lg font-semibold text-white">
            Upcoming Renewal Clusters
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Prepare for busy renewal weeks ahead.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {insights.renewalClustering.upcomingClusters.map((cluster) => (
              <div
                key={cluster.windowLabel}
                className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 p-4"
              >
                <p className="text-sm font-semibold text-purple-200">
                  {cluster.windowLabel}
                </p>
                <p className="mt-2 text-xs text-purple-100/80">
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
};

AnalyticsDashboard.defaultProps = {
  insights: null,
  isLoading: false,
  error: null,
  isRefreshing: false,
};

export default AnalyticsDashboard;
