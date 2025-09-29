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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <p className="text-xl text-gray-300 font-medium bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent">
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
          <p className="text-red-400 text-xl font-semibold mb-4 bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
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
      
      {/* Enhanced Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md px-8 py-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Welcome back, <span className="text-blue-400 font-medium">{user?.name || "User"}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCalendar}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
            >
              <span>📅</span>
              Export Calendar
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
            >
              <span>⚙️</span>
              Settings
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-8 py-8 pt-24">
        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700/30 hover:border-blue-500/30 transition-all duration-500 hover:scale-105 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-medium">Monthly Spending</p>
                <p className="text-3xl font-bold text-green-400 mt-2 group-hover:scale-105 transition-transform duration-300">
                  {formatCurrency(insights.summary.monthlySpending)}
                </p>
              </div>
              <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700/30 hover:border-blue-500/30 transition-all duration-500 hover:scale-105 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-medium">Yearly Spending</p>
                <p className="text-3xl font-bold text-blue-400 mt-2 group-hover:scale-105 transition-transform duration-300">
                  {formatCurrency(insights.summary.yearlySpending)}
                </p>
              </div>
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700/30 hover:border-purple-500/30 transition-all duration-500 hover:scale-105 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-medium">Active Subscriptions</p>
                <p className="text-3xl font-bold text-purple-400 mt-2 group-hover:scale-105 transition-transform duration-300">
                  {insights.summary.activeSubscriptions}
                </p>
              </div>
              <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl">📱</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700/30 hover:border-yellow-500/30 transition-all duration-500 hover:scale-105 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-medium">Savings Potential</p>
                <p className="text-3xl font-bold text-yellow-400 mt-2 group-hover:scale-105 transition-transform duration-300">
                  {formatCurrency(insights.savingsPotential)}
                </p>
              </div>
              <div className="w-14 h-14 bg-yellow-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-2xl">💡</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Upcoming Renewals */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-7 shadow-2xl border border-gray-700/30 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Upcoming Renewals
                </h2>
                <span className="text-blue-400 text-sm font-medium">
                  {insights.upcomingRenewals.length} items
                </span>
              </div>
              {insights.upcomingRenewals.length > 0 ? (
                <div className="space-y-4">
                  {insights.upcomingRenewals.map((renewal, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 border border-gray-600/30 hover:border-blue-500/30 group cursor-pointer transform hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white text-lg">📅</span>
                        </div>
                        <div>
                          <p className="font-semibold text-lg text-white group-hover:text-blue-300 transition-colors">
                            {renewal.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {formatDate(renewal.renewalDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-blue-400">
                          {formatCurrency(renewal.price)}
                        </p>
                        <p className="text-sm text-gray-400 font-medium">
                          {renewal.frequency}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📅</span>
                  </div>
                  <p className="text-gray-400 text-lg">No upcoming renewals</p>
                </div>
              )}
            </div>

            {/* Enhanced Category Breakdown */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-7 shadow-2xl border border-gray-700/30 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Category Breakdown
              </h2>
              <div className="space-y-5">
                {Object.entries(insights.categoryBreakdown).map(
                  ([category, amount]) => (
                    <div
                      key={category}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-700/30 to-gray-800/30 rounded-xl hover:from-gray-700/50 hover:to-gray-800/50 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white text-sm">📊</span>
                        </div>
                        <span className="capitalize text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                          {category}
                        </span>
                      </div>
                      <span className="font-bold text-lg text-green-400 bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
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
            {/* Enhanced Budget Analysis */}
            {insights.budgetAnalysis && (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-7 shadow-2xl border border-gray-700/30 backdrop-blur-sm">
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Budget Status
                </h2>
                <div className="space-y-7">
                  <div>
                    <div className="flex justify-between text-base mb-3">
                      <span className="font-semibold text-gray-200">Monthly Budget</span>
                      <span className="text-gray-300 font-medium">
                        {formatCurrency(
                          insights.budgetAnalysis.currentSpending
                        )}{" "}
                        / {formatCurrency(insights.budgetAnalysis.monthlyLimit)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 shadow-lg"
                        style={{
                          width: `${Math.min(
                            insights.budgetAnalysis.percentageUsed,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-400 mt-3 font-medium">
                      {insights.budgetAnalysis.percentageUsed.toFixed(1)}% used
                    </p>
                  </div>

                  {insights.budgetAnalysis.categoryAnalysis.entertainment && (
                    <div>
                      <div className="flex justify-between text-base mb-3">
                        <span className="font-semibold text-gray-200">Entertainment</span>
                        <span className="text-gray-300 font-medium">
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
                      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className={`h-3 rounded-full transition-all duration-1000 shadow-lg ${
                            insights.budgetAnalysis.categoryAnalysis
                              .entertainment.overBudget
                              ? "bg-gradient-to-r from-red-500 to-red-600"
                              : "bg-gradient-to-r from-green-500 to-green-600"
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

            {/* Enhanced Recommendations */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-7 shadow-2xl border border-gray-700/30 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Recommendations
              </h2>
              <div className="space-y-4">
                {insights.recommendations.length > 0 ? (
                  insights.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="p-5 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-xl border-l-4 border-yellow-500 hover:from-yellow-500/20 hover:to-yellow-600/20 transition-all duration-300 group transform hover:scale-[1.02]"
                    >
                      <p className="text-base font-semibold text-white group-hover:text-yellow-100 transition-colors">
                        {rec.message}
                      </p>
                      {rec.potentialSavings && (
                        <p className="text-sm text-yellow-400 font-medium mt-3 bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                          💰 Potential savings:{" "}
                          {formatCurrency(rec.potentialSavings)}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">✅</span>
                    </div>
                    <p className="text-gray-400 text-lg">
                      No recommendations at this time
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Quick Actions */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-7 shadow-2xl border border-gray-700/30 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Quick Actions
              </h2>
              <div className="space-y-4">
                <button
                  onClick={() => navigate("/subscriptions/add")}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 py-4 px-5 rounded-xl text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3 group"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">➕</span>
                  Add Subscription
                </button>
                <button
                  onClick={() => navigate("/bills/add")}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 py-4 px-5 rounded-xl text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3 group"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">📄</span>
                  Add Bill
                </button>
                <button
                  onClick={() => navigate("/budgets")}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 py-4 px-5 rounded-xl text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3 group"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">💼</span>
                  Budget Settings
                </button>
                <button
                  onClick={() => navigate("/settings")}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 py-4 px-5 rounded-xl text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3 group"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">⚙️</span>
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