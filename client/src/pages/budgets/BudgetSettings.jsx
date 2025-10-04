import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Navigation from "../../components/Navigation";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { useApi } from "../../utils/api";
import { useCurrency } from "../../hooks/useCurrency";
import { SUPPORTED_CURRENCIES } from "../../constants/preferences";

export default function BudgetSettings() {
  const { token } = useAuth();
  const api = useApi(token);
  const { currency: selectedCurrency, setCurrency } = useCurrency();
  const currencyLabel = useMemo(() => {
    const match = SUPPORTED_CURRENCIES.find(
      (option) => option.value === selectedCurrency
    );
    return match ? match.label : selectedCurrency;
  }, [selectedCurrency]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    monthlyLimit: 0,
    currency: selectedCurrency,
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

  const fetchBudget = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getBudget();
      const payload = data.data;
      setForm((prev) => ({
        ...prev,
        ...payload,
        currency: selectedCurrency,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [api, selectedCurrency]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      currency: selectedCurrency,
    }));
  }, [selectedCurrency]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("categoryLimits.")) {
      const category = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        categoryLimits: {
          ...prev.categoryLimits,
          [category]: Number.parseFloat(value) || 0,
        },
      }));
    } else if (name.startsWith("notifications.")) {
      const notificationKey = name.split(".")[1];
      setForm((prev) => {
        const parsedValue = Number.parseInt(value, 10);
        return {
          ...prev,
          notifications: {
            ...prev.notifications,
            [notificationKey]:
              type === "checkbox"
                ? checked
                : Number.isNaN(parsedValue)
                ? prev.notifications[notificationKey]
                : parsedValue,
          },
        };
      });
    } else {
      let nextValue;
      if (type === "checkbox") {
        nextValue = checked;
      } else {
        const numericValue = Number(value);
        nextValue = Number.isNaN(numericValue) ? value : numericValue;
      }

      setForm((prev) => ({
        ...prev,
        [name]: nextValue,
      }));

      if (name === "currency" && value !== selectedCurrency) {
        setCurrency(String(value));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.updateBudget(form);
      setCurrency(form.currency);
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
    <div className="min-h-screen bg-gray-50 text-white">
      <Navigation />

      {/* Header */}
      <header className="border-b border-gray-200 bg-gray-50 backdrop-blur-sm px-6 py-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Budget Settings
            </h1>
            <p className="text-sm text-gray-500 mt-1">
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
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Overall Monthly Budget
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Monthly Limit *
                </label>
                <input
                  type="number"
                  name="monthlyLimit"
                  value={form.monthlyLimit}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Currency
                </label>
                <div className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 flex items-center justify-between">
                  <span>{currencyLabel}</span>
                  <Link
                    to="/settings"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Manage in Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Category Limits */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Category Limits
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(form.categoryLimits).map(([category, limit]) => (
                <div key={category}>
                  <label className="block text-sm font-bold text-gray-700 mb-2 capitalize">
                    {category} Limit
                  </label>
                  <input
                    type="number"
                    name={`categoryLimits.${category}`}
                    value={limit}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Notification Settings
            </h2>

            <div className="space-y-4">
              {/* Email Notifications Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="notifications.email"
                  checked={form.notifications.email}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700 font-bold">
                  Enable email notifications
                </label>
              </div>

              {/* Alert Threshold Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Alert Threshold (%)
                </label>
                <input
                  type="number"
                  name="notifications.threshold"
                  value={form.notifications.threshold}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-base font-medium text-gray-500 mt-1">
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
              className="flex-1 bg-red-500 hover:bg-red-600 py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-800 py-3 px-4 rounded-lg font-medium transition-colors"
            >
              {saving ? "Saving..." : "Save Budget"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
