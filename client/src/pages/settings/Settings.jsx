import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Navigation from "../../components/Navigation";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { useCurrency } from "../../hooks/useCurrency";
import { SUPPORTED_CURRENCIES } from "../../constants/preferences";

export default function Settings() {
  const { user, token, logout, updateUser } = useAuth();
  const { currency: selectedCurrency, setCurrency } = useCurrency();
  const [form, setForm] = useState(() => ({
    name: user?.name || "",
    email: user?.email || "",
    currency: selectedCurrency,
    timezone:
      user?.timezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "UTC",
    notifications: {
      email: user?.notifications?.email ?? true,
      reminders: user?.notifications?.reminders ?? true,
      budgetAlerts: user?.notifications?.budgetAlerts ?? true,
    },
  }));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      currency: selectedCurrency,
    }));
  }, [selectedCurrency]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: user?.name || "",
      email: user?.email || "",
      timezone:
        user?.timezone ||
        prev.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        "UTC",
      notifications: {
        email: user?.notifications?.email ?? true,
        reminders: user?.notifications?.reminders ?? true,
        budgetAlerts: user?.notifications?.budgetAlerts ?? true,
      },
    }));
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("notifications.")) {
      const notificationKey = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [notificationKey]: checked,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));

      if (name === "currency") {
        setCurrency(value);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // In a real app, you'd have a user update endpoint
      // For now, we'll just simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCurrency(form.currency);
      updateUser({
        name: form.name,
        email: form.email,
        timezone: form.timezone,
        notifications: { ...form.notifications },
        currency: form.currency,
      });
      setSuccess("Settings updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExportCalendar = async () => {
    try {
      setLoading(true);
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
      setError("Failed to export calendar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-white">
      <Navigation />

      {/* Header */}
      <header className="border-b border-gray-200 bg-white backdrop-blur-md px-6 py-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-gray-900 mt-1">
              Manage your account preferences and notifications
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-8">
        <div className="space-y-8">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
              <p className="text-green-400">{success}</p>
            </div>
          )}

          {/* Profile Settings */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Profile Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {SUPPORTED_CURRENCIES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    name="timezone"
                    value={form.timezone}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Notification Preferences
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">
                    Receive email updates about your subscriptions and bills
                  </p>
                </div>
                <input
                  type="checkbox"
                  name="notifications.email"
                  checked={form.notifications.email}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-1"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">Renewal Reminders</p>
                  <p className="text-sm text-gray-500">
                    Get reminded before subscriptions renew
                  </p>
                </div>
                <input
                  type="checkbox"
                  name="notifications.reminders"
                  checked={form.notifications.reminders}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-1"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">Budget Alerts</p>
                  <p className="text-sm text-gray-500">
                    Get notified when approaching budget limits
                  </p>
                </div>
                <input
                  type="checkbox"
                  name="notifications.budgetAlerts"
                  checked={form.notifications.budgetAlerts}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-1"
                />
              </div>
            </div>
          </div>

          {/* Data & Export */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Data & Export
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Export Calendar</p>
                  <p className="text-sm text-gray-500">
                    Download your subscriptions and bills as a calendar file
                  </p>
                </div>
                <button
                  onClick={handleExportCalendar}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Exporting..." : "Export ICS"}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-800 py-3 px-4 rounded-lg font-medium transition-colors"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
            <button
              onClick={logout}
              className="flex-1 bg-red-500 hover:bg-red-600 py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
