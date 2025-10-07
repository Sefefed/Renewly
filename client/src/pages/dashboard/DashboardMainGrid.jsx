import FadeIn from "../../components/ui/FadeIn";
import KpiGrid from "../../components/dashboard/KpiGrid";
import AnalyticsDashboard from "../../components/dashboard/analytics/AnalyticsDashboard";
import DashboardPrimaryColumn from "./DashboardPrimaryColumn";
import DashboardSecondaryColumn from "./DashboardSecondaryColumn";

const DashboardMainGrid = ({
  insights,
  smartInsights,
  smartInsightsLoading,
  smartInsightsError,
  smartPeriod,
  setSmartPeriod,
  refetchSmartInsights,
  smartInsightsRefreshing,
  primaryColumnProps,
  secondaryColumnProps,
  onAssistantPrompt,
}) => (
  <main className="space-y-10">
    <section
      id="financial-insights"
      className="space-y-6 scroll-mt-28"
      aria-label="Financial insights overview"
    >
      <FadeIn delay={0.12} className="block">
        <KpiGrid
          summary={insights.summary}
          savingsPotential={insights.savingsPotential}
        />
      </FadeIn>

      <FadeIn delay={0.16} className="block">
        <AnalyticsDashboard
          insights={smartInsights}
          isLoading={smartInsightsLoading}
          error={smartInsightsError}
          timeframe={smartPeriod}
          onTimeframeChange={setSmartPeriod}
          onRefresh={refetchSmartInsights}
          isRefreshing={smartInsightsRefreshing}
          onAssistantPrompt={onAssistantPrompt}
        />
      </FadeIn>
    </section>

    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <DashboardPrimaryColumn {...primaryColumnProps} />
      <DashboardSecondaryColumn {...secondaryColumnProps} />
    </div>
  </main>
);

export default DashboardMainGrid;
