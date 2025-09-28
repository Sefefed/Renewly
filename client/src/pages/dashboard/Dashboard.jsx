import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "../../components/Navigation";
import { useApi } from "../../utils/api";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const api = useApi(token);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const data = await api.getInsights();
      setInsights(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCalendar = async () => {
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={fetchInsights}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/70 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-gray-400">
              Welcome back, {user?.name || "User"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportCalendar}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
            >
              Export Calendar
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
            >
              Settings
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Monthly Spending</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(insights.summary.monthlySpending)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-green-400 text-xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Yearly Spending</p>
                <p className="text-2xl font-bold text-blue-400">
                  {formatCurrency(insights.summary.yearlySpending)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-400 text-xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Subscriptions</p>
                <p className="text-2xl font-bold text-purple-400">
                  {insights.summary.activeSubscriptions}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-purple-400 text-xl">📱</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Savings Potential</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {formatCurrency(insights.savingsPotential)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <span className="text-yellow-400 text-xl">💡</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Renewals */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Upcoming Renewals</h2>
              {insights.upcomingRenewals.length > 0 ? (
                <div className="space-y-3">
                  {insights.upcomingRenewals.map((renewal, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{renewal.name}</p>
                        <p className="text-sm text-gray-400">
                          {formatDate(renewal.renewalDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(renewal.price)}
                        </p>
                        <p className="text-sm text-gray-400">
                          {renewal.frequency}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No upcoming renewals</p>
              )}
            </div>

            {/* Category Breakdown */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Category Breakdown</h2>
              <div className="space-y-3">
                {Object.entries(insights.categoryBreakdown).map(
                  ([category, amount]) => (
                    <div
                      key={category}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="capitalize">{category}</span>
                      </div>
                      <span className="font-semibold">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Budget Analysis */}
            {insights.budgetAnalysis && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Budget Status</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Monthly Budget</span>
                      <span>
                        {formatCurrency(
                          insights.budgetAnalysis.currentSpending
                        )}{" "}
                        / {formatCurrency(insights.budgetAnalysis.monthlyLimit)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            insights.budgetAnalysis.percentageUsed,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {insights.budgetAnalysis.percentageUsed.toFixed(1)}% used
                    </p>
                  </div>

                  {insights.budgetAnalysis.categoryAnalysis.entertainment && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Entertainment</span>
                        <span>
                          {formatCurrency(
                            insights.budgetAnalysis.categoryAnalysis
                              .entertainment.spent
                          )}{" "}
                          /{" "}
                          {formatCurrency(
                            insights.budgetAnalysis.categoryAnalysis
                              .entertainment.limit
                          )}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            insights.budgetAnalysis.categoryAnalysis
                              .entertainment.overBudget
                              ? "bg-red-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              insights.budgetAnalysis.categoryAnalysis
                                .entertainment.percentage,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
              <div className="space-y-3">
                {insights.recommendations.length > 0 ? (
                  insights.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-700 rounded-lg border-l-4 border-yellow-500"
                    >
                      <p className="text-sm font-medium">{rec.message}</p>
                      {rec.potentialSavings && (
                        <p className="text-xs text-yellow-400 mt-1">
                          Potential savings:{" "}
                          {formatCurrency(rec.potentialSavings)}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">
                    No recommendations at this time
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/subscriptions/add")}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded text-sm"
                >
                  Add Subscription
                </button>
                <button
                  onClick={() => navigate("/bills/add")}
                  className="w-full bg-green-600 hover:bg-green-700 py-2 px-4 rounded text-sm"
                >
                  Add Bill
                </button>
                <button
                  onClick={() => navigate("/budgets")}
                  className="w-full bg-purple-600 hover:bg-purple-700 py-2 px-4 rounded text-sm"
                >
                  Budget Settings
                </button>
                <button
                  onClick={() => navigate("/settings")}
                  className="w-full bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded text-sm"
                >
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
