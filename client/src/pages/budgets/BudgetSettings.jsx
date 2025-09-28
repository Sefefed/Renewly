import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Navigation from "../../components/Navigation";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { useApi } from "../../utils/api";
import { formatCurrency } from "../../utils/formatters";

export default function BudgetSettings() {
  const { token } = useAuth();
  const api = useApi(token);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    monthlyLimit: 0,
    currency: "USD",
    categoryLimits: {
      entertainment: 0,
      utilities: 0,
      rent: 0,
      insurance: 0,
      phone: 0,
      internet: 0,
      other: 0,
    },
    notifications: {
      email: true,
      threshold: 80,
    },
  });

  useEffect(() => {
    fetchBudget();
  }, []);

  const fetchBudget = async () => {
    try {
      setLoading(true);
      const data = await api.getBudget();
      setBudget(data.data);
      setForm(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("categoryLimits.")) {
      const category = name.split(".")[1];
      setForm({
        ...form,
        categoryLimits: {
          ...form.categoryLimits,
          [category]: parseFloat(value) || 0,
        },
      });
    } else if (name.startsWith("notifications.")) {
      const notificationKey = name.split(".")[1];
      setForm({
        ...form,
        notifications: {
          ...form.notifications,
          [notificationKey]: type === "checkbox" ? checked : parseInt(value),
        },
      });
    } else {
      setForm({
        ...form,
        [name]: type === "checkbox" ? checked : parseFloat(value) || value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.updateBudget(form);
      await fetchBudget(); // Refresh data
      alert("Budget updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner text="Loading budget settings..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <ErrorMessage error={error} onRetry={fetchBudget} />
        </div>
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
            <h1 className="text-2xl font-semibold">Budget Settings</h1>
            <p className="text-sm text-gray-400">
              Set your monthly spending limits and category budgets
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Overall Budget */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              Overall Monthly Budget
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Monthly Limit *
                </label>
                <input
                  type="number"
                  name="monthlyLimit"
                  value={form.monthlyLimit}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Limits */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Category Limits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(form.categoryLimits).map(([category, limit]) => (
                <div key={category}>
                  <label className="block text-sm font-medium mb-2 capitalize">
                    {category} Limit
                  </label>
                  <input
                    type="number"
                    name={`categoryLimits.${category}`}
                    value={limit}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              Notification Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="notifications.email"
                  checked={form.notifications.email}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label className="text-sm">Enable email notifications</label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Alert Threshold (%)
                </label>
                <input
                  type="number"
                  name="notifications.threshold"
                  value={form.notifications.threshold}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Get notified when spending reaches this percentage of your
                  budget
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 py-3 px-4 rounded-lg font-medium transition-colors"
            >
              {saving ? "Saving..." : "Save Budget"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
