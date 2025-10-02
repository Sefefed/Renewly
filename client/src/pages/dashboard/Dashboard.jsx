import { useCallback, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../utils/api";
import useSmartInsights from "../../hooks/useSmartInsights";
import DashboardSkeleton from "../../components/dashboard/DashboardSkeleton";
import DashboardErrorState from "./DashboardErrorState";
import DashboardEmptyState from "./DashboardEmptyState";
import DashboardContent from "./DashboardContent";
import useDashboardInsights from "./hooks/useDashboardInsights";
import useAssistantPanel from "./hooks/useAssistantPanel";
import useToastNotifications from "./hooks/useToastNotifications";

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const api = useApi(token);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  const insightsState = useDashboardInsights({ api, token, navigate });
  const assistant = useAssistantPanel();
  const {
    dashboardStyle,
    isAssistantOpen,
    setIsAssistantOpen,
    assistantUnread,
    setAssistantUnread,
    handleAssistantLayoutChange,
    toastsStyle,
  } = assistant;
  const [assistantPrompt, setAssistantPrompt] = useState(null);
  const { toasts, removeToast } = useToastNotifications({ api, token });
  const {
    insights: smartInsights,
    loading: smartInsightsLoading,
    error: smartInsightsError,
    period: smartPeriod,
    setPeriod: setSmartPeriod,
    refetch: refetchSmartInsights,
    isRefreshing: smartInsightsRefreshing,
  } = useSmartInsights(api);

  const handleAssistantInsightsLoaded = useCallback(
    (data) => {
      const alertCount = data?.alerts?.length ?? 0;
      if (!isAssistantOpen && alertCount > 0) {
        setAssistantUnread((prev) => Math.max(prev, alertCount));
      }
    },
    [isAssistantOpen, setAssistantUnread]
  );

  const handleAssistantPrompt = useCallback(
    (message) => {
      if (!message) {
        return;
      }

      setAssistantPrompt({ id: Date.now(), text: message });
      setIsAssistantOpen(true);
    },
    [setIsAssistantOpen]
  );

  if (insightsState.loading) {
    return <DashboardSkeleton />;
  }

  if (insightsState.error) {
    return (
      <DashboardErrorState
        onRetry={insightsState.fetchInsights}
        onNavigateSubscriptions={() => navigate("/subscriptions")}
      />
    );
  }

  if (!insightsState.insights) {
    return <DashboardEmptyState />;
  }

  const mainGridProps = {
    insights: insightsState.insights,
    smartInsights,
    smartInsightsLoading,
    smartInsightsError,
    smartPeriod,
    setSmartPeriod,
    refetchSmartInsights,
    smartInsightsRefreshing,
    onAssistantPrompt: handleAssistantPrompt,
    primaryColumnProps: {
      insights: insightsState.insights,
      api,
      timeRange: insightsState.timeRange,
      setTimeRange: insightsState.setTimeRange,
      filters: insightsState.TIME_RANGE_FILTERS,
      enhancedLoading: insightsState.enhancedLoading,
      enhancedError: insightsState.enhancedError,
      enhancedInsights: insightsState.enhancedInsights,
      fetchEnhancedInsights: insightsState.fetchEnhancedInsights,
      categoryBreakdown: insightsState.categoryBreakdown,
    },
    secondaryColumnProps: {
      api,
      insights: insightsState.insights,
      monthlyComparison: insightsState.monthlyComparison,
      showComparisonLoader: insightsState.showComparisonLoader,
      handleAssistantInsightsLoaded,
      quickActions: insightsState.quickActions,
    },
  };

  return (
    <DashboardContent
      userName={user?.name || "User"}
      token={token}
      api={api}
      dashboardStyle={dashboardStyle}
      handleExportCalendar={insightsState.handleExportCalendar}
      onOpenSettings={() => navigate("/settings")}
      setShowNotificationCenter={setShowNotificationCenter}
      showNotificationCenter={showNotificationCenter}
      isAssistantOpen={isAssistantOpen}
      setIsAssistantOpen={setIsAssistantOpen}
      assistantUnread={assistantUnread}
      setAssistantUnread={setAssistantUnread}
      handleAssistantLayoutChange={handleAssistantLayoutChange}
      toasts={toasts}
      removeToast={removeToast}
      toastsStyle={toastsStyle}
      mainGridProps={mainGridProps}
      assistantPrompt={assistantPrompt}
      onAssistantPromptConsumed={() => setAssistantPrompt(null)}
    />
  );
}
