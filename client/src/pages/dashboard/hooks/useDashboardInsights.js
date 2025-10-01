import { useCallback, useEffect, useMemo, useState } from "react";
import { TIME_RANGE_FILTERS } from "../dashboardConstants";

const useDashboardInsights = ({ api, token, navigate }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enhancedInsights, setEnhancedInsights] = useState(null);
  const [enhancedLoading, setEnhancedLoading] = useState(true);
  const [enhancedError, setEnhancedError] = useState(null);
  const [timeRange, setTimeRange] = useState("monthly");

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

  useEffect(() => {
    if (!token) return;
    fetchInsights();
  }, [fetchInsights, token]);

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
    fetchEnhancedInsights(timeRange);
  }, [fetchEnhancedInsights, timeRange, token]);

  const categoryBreakdown = useMemo(
    () =>
      enhancedInsights?.categoryBreakdown ?? insights?.categoryBreakdown ?? {},
    [enhancedInsights, insights]
  );

  const monthlyComparison = useMemo(
    () => enhancedInsights?.monthlyComparison ?? null,
    [enhancedInsights]
  );

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
    if (!token) return;
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

  return {
    insights,
    loading,
    error,
    fetchInsights,
    enhancedInsights,
    enhancedLoading,
    enhancedError,
    fetchEnhancedInsights,
    timeRange,
    setTimeRange,
    categoryBreakdown,
    monthlyComparison,
    showComparisonLoader,
    quickActions,
    handleExportCalendar,
    TIME_RANGE_FILTERS,
  };
};

export default useDashboardInsights;
