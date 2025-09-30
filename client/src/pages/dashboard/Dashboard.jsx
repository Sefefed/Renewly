import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "../../components/Navigation";
import { useApi } from "../../utils/api";
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
} from "../../components/dashboard";

const TIME_RANGE_FILTERS = [
  { label: "Last 6 months", value: "monthly" },
  { label: "Last 6 quarters", value: "quarterly" },
  { label: "Last 6 years", value: "yearly" },
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <p className="text-xl font-medium bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white flex items-center justify-center">
        <div className="text-center bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-2xl shadow-2xl border border-red-500/20 backdrop-blur-sm">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-xl font-semibold mb-4 bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
            {error}
          </p>
          <button
            onClick={fetchInsights}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 py-3 rounded-xl text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Try Again
          </button>
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

      <main className="mx-auto w-full max-w-7xl px-8 py-8 pt-24">
        <KpiGrid
          summary={insights.summary}
          savingsPotential={insights.savingsPotential}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <SpendingTrendCard
              filters={TIME_RANGE_FILTERS}
              activeFilter={timeRange}
              onFilterChange={setTimeRange}
              isLoading={enhancedLoading}
              error={enhancedError}
              data={enhancedInsights?.spendingTrend}
              onRetry={() => fetchEnhancedInsights(timeRange)}
            />

            <UpcomingRenewalsCard renewals={insights.upcomingRenewals} />

            <CategoryBreakdownCard
              breakdown={categoryBreakdown}
              isLoading={enhancedLoading}
            />
          </div>

          <div className="space-y-8">
            <MonthlyComparisonCard
              comparison={monthlyComparison}
              showInitialLoader={showComparisonLoader}
            />

            <BudgetStatusCard analysis={insights.budgetAnalysis} />

            <RecommendationsCard recommendations={insights.recommendations} />

            <QuickActionsCard actions={quickActions} />
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
