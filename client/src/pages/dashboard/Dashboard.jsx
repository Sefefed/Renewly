import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "../../components/Navigation";
import { useApi } from "../../utils/api";
import FadeIn from "../../components/ui/FadeIn";
import {
  NotificationBell,
  ToastNotification,
  NotificationCenter,
} from "../../components/Notifications";
import {
  DashboardHeader,
  KpiGrid,
  SpendingTrendCard,
  UpcomingRenewalsCard,
  CategoryBreakdownCard,
  MonthlyComparisonCard,
  BudgetStatusCard,
  RecommendationsCard,
  QuickActionsCard,
  AnalyticsDashboard,
} from "../../components/dashboard";
import DashboardSkeleton from "../../components/dashboard/DashboardSkeleton";
import useSmartInsights from "../../hooks/useSmartInsights";

const TIME_RANGE_FILTERS = [
  { label: "Last 6 months", value: "monthly", icon: "📅" },
  { label: "Last 6 quarters", value: "quarterly", icon: "📈" },
  { label: "Last 6 years", value: "yearly", icon: "🗓️" },
];

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const api = useApi(token);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enhancedInsights, setEnhancedInsights] = useState(null);
  const [enhancedLoading, setEnhancedLoading] = useState(true);
  const [enhancedError, setEnhancedError] = useState(null);
  const [timeRange, setTimeRange] = useState("monthly");
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [toasts, setToasts] = useState([]);
  const displayedToastIdsRef = useRef(new Set());

  const {
    insights: smartInsights,
    loading: smartInsightsLoading,
    error: smartInsightsError,
    period: smartPeriod,
    setPeriod: setSmartPeriod,
    refetch: refetchSmartInsights,
    isRefreshing: smartInsightsRefreshing,
  } = useSmartInsights(api);

  const addToast = useCallback((notification) => {
    if (!notification || !notification._id) return;
    if (displayedToastIdsRef.current.has(notification._id)) return;

    displayedToastIdsRef.current.add(notification._id);
    const toastId = `${notification._id}-${Date.now()}`;
    setToasts((prev) => [...prev, { ...notification, id: toastId }]);
  }, []);

  const removeToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
  }, []);

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getInsights();
      setInsights(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const fetchEnhancedInsights = useCallback(
    async (range) => {
      try {
        setEnhancedLoading(true);
        setEnhancedError(null);
        const response = await api.getEnhancedInsights(range ?? timeRange);
        setEnhancedInsights(response.data);
      } catch (err) {
        setEnhancedError(err.message);
        setEnhancedInsights(null);
      } finally {
        setEnhancedLoading(false);
      }
    },
    [api, timeRange]
  );

  useEffect(() => {
    if (!token) return;
    fetchInsights();
  }, [fetchInsights, token]);

  useEffect(() => {
    if (!token) return;
    fetchEnhancedInsights(timeRange);
  }, [fetchEnhancedInsights, timeRange, token]);

  const pollNotifications = useCallback(async () => {
    if (!token) return;

    try {
      const unreadResponse = await api.getUnreadNotificationCount();
      if (!unreadResponse.data) {
        return;
      }

      const latestResponse = await api.getNotifications({
        limit: 1,
        unreadOnly: true,
      });
      const latestNotification = latestResponse.data.notifications?.[0];
      if (latestNotification) {
        addToast(latestNotification);
      }
    } catch (err) {
      console.error("Error polling notifications:", err);
    }
  }, [addToast, api, token]);

  useEffect(() => {
    if (!token) return;

    pollNotifications();
    const interval = setInterval(pollNotifications, 30000);
    return () => clearInterval(interval);
  }, [pollNotifications, token]);

  const categoryBreakdown =
    enhancedInsights?.categoryBreakdown ?? insights?.categoryBreakdown ?? {};
  const monthlyComparison = enhancedInsights?.monthlyComparison ?? null;
  const showComparisonLoader = enhancedLoading && !enhancedInsights;

  const quickActions = useMemo(
    () => [
      {
        label: "Add Subscription",
        icon: "➕",
        gradient:
          "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
        onClick: () => navigate("/subscriptions/add"),
      },
      {
        label: "Add Bill",
        icon: "📄",
        gradient:
          "from-green-600 to-green-700 hover:from-green-700 hover:to-green-800",
        onClick: () => navigate("/bills/add"),
      },
      {
        label: "Budget Settings",
        icon: "💼",
        gradient:
          "from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800",
        onClick: () => navigate("/budgets"),
      },
      {
        label: "Settings",
        icon: "⚙️",
        gradient:
          "from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600",
        onClick: () => navigate("/settings"),
      },
    ],
    [navigate]
  );

  const handleExportCalendar = useCallback(async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }/api/v1/calendar.ics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to export calendar");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "renewly-calendar.ics";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Failed to export calendar: " + err.message);
    }
  }, [token]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center px-4 text-white">
        <div className="max-w-md w-full rounded-3xl border border-red-500/20 bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-12 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/20 animate-gentle-bounce">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="mb-4 text-2xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
            Oops! Something went wrong
          </h2>
          <p className="mb-10 text-sm leading-relaxed text-gray-300">
            We couldn&apos;t load your dashboard data. This is usually
            temporary. Try refreshing the data or revisit your subscriptions to
            make sure everything looks good.
          </p>
          <div className="space-y-4">
            <button
              onClick={fetchInsights}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-4 text-base font-semibold shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:scale-[1.02]"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/subscriptions")}
              className="w-full rounded-xl border border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 py-4 text-base font-semibold text-gray-200 transition-all duration-300 hover:border-gray-500 hover:text-white"
            >
              Go to Subscriptions
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white flex items-center justify-center">
        <div className="text-center bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700/50">
          <p className="text-gray-300 text-lg font-medium">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white">
      <Navigation />

      <FadeIn delay={0.05}>
        <DashboardHeader
          userName={user?.name || "User"}
          onExportCalendar={handleExportCalendar}
          onOpenSettings={() => navigate("/settings")}
          onOpenNotificationCenter={() => setShowNotificationCenter(true)}
          notificationSlot={
            <NotificationBell
              token={token}
              onOpenCenter={() => setShowNotificationCenter(true)}
            />
          }
        />
      </FadeIn>

      <main className="mx-auto w-full max-w-7xl px-8 py-8 pt-24">
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
          />
        </FadeIn>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <FadeIn delay={0.22} className="w-full">
              <SpendingTrendCard
                filters={TIME_RANGE_FILTERS}
                activeFilter={timeRange}
                onFilterChange={setTimeRange}
                isLoading={enhancedLoading}
                error={enhancedError}
                data={enhancedInsights?.spendingTrend}
                onRetry={() => fetchEnhancedInsights(timeRange)}
              />
            </FadeIn>

            <FadeIn delay={0.28} className="w-full">
              <UpcomingRenewalsCard
                renewals={insights.upcomingRenewals}
                api={api}
              />
            </FadeIn>

            <FadeIn delay={0.34} className="w-full">
              <CategoryBreakdownCard
                breakdown={categoryBreakdown}
                isLoading={enhancedLoading}
              />
            </FadeIn>
          </div>

          <div className="space-y-8">
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
        </div>
      </main>

      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            notification={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      <NotificationCenter
        token={token}
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
      />
    </div>
  );
}
