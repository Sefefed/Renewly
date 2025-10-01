import FadeIn from "../../components/ui/FadeIn";
import ProactiveInsights from "../../components/assistant/ProactiveInsights";
import MonthlyComparisonCard from "../../components/dashboard/MonthlyComparisonCard";
import BudgetStatusCard from "../../components/dashboard/BudgetStatusCard";
import RecommendationsCard from "../../components/dashboard/RecommendationsCard";
import QuickActionsCard from "../../components/dashboard/QuickActionsCard";

const DashboardSecondaryColumn = ({
  api,
  insights,
  monthlyComparison,
  showComparisonLoader,
  handleAssistantInsightsLoaded,
  quickActions,
}) => (
  <div className="space-y-8">
    <FadeIn delay={0.18} className="w-full">
      <ProactiveInsights
        api={api}
        onInsightsLoaded={handleAssistantInsightsLoaded}
      />
    </FadeIn>

    <FadeIn delay={0.24} className="w-full">
      <MonthlyComparisonCard
        comparison={monthlyComparison}
        showInitialLoader={showComparisonLoader}
      />
    </FadeIn>

    <FadeIn delay={0.3} className="w-full">
      <BudgetStatusCard analysis={insights.budgetAnalysis} />
    </FadeIn>

    <FadeIn delay={0.36} className="w-full">
      <RecommendationsCard recommendations={insights.recommendations} />
    </FadeIn>

    <FadeIn delay={0.42} className="w-full">
      <QuickActionsCard actions={quickActions} />
    </FadeIn>
  </div>
);

export default DashboardSecondaryColumn;
