import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useApi } from "../../utils/api";
import { useCurrency } from "../../hooks/useCurrency";
import { SUPPORTED_CURRENCIES } from "../../constants/preferences";

export default function AddSubscription() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const api = useApi(token);
  const { currency: selectedCurrency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(() => ({
    name: "",
    price: "",
    currency: selectedCurrency,
    frequency: "monthly",
    category: "entertainment",
    paymentMethod: "",
    startDate: new Date().toISOString().split("T")[0],
    renewalDate: "",
  }));

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      currency: selectedCurrency,
    }));
  }, [selectedCurrency]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.createSubscription({
        ...form,
        price: parseFloat(form.price),
      });
      navigate("/subscriptions");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-white">
      {/* Header */}
      <header
        className="border-b bg-blue-900
 px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Add Subscription</h1>
            <p className="text-base text-gray-300">
              Add a new subscription service
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4 text-green-700 ">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-900">
                  Subscription Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-400 text-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 "
                  placeholder="e.g., Netflix"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-900">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full bg-gray-50 text-gray-900 border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 "
                  placeholder="15.99"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  className="w-full bg-gray-50 text-gray-900 border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 "
                >
                  {SUPPORTED_CURRENCIES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-900">
                  Frequency
                </label>
                <select
                  name="frequency"
                  value={form.frequency}
                  onChange={handleChange}
                  className="w-full bg-gray-50 text-gray-900 border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 "
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category and Payment */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-bold text-green-700 mb-4">
              Category & Payment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full bg-gray-50 text-gray-900 border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="entertainment">Entertainment</option>
                  <option value="technology">Technology</option>
                  <option value="sports">Sports</option>
                  <option value="news">News</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="finance">Finance</option>
                  <option value="politics">Politics</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Payment Method
                </label>
                <input
                  type="text"
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  className="w-full bg-gray-50 text-gray-900 border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 "
                  placeholder="e.g., Credit Card ****1234"
                  required
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-bold text-green-700 mb-4">Dates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full bg-gray-50 text-gray-900 border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 "
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Next Renewal Date
                </label>
                <input
                  type="date"
                  name="renewalDate"
                  value={form.renewalDate}
                  onChange={handleChange}
                  className="w-full bg-gray-50 text-gray-900 border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 "
                />
                <p className="text-sm text-blue-400 mt-1">
                  Leave empty to auto-calculate based on frequency
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/subscriptions")}
              className="flex-1 bg-red-600 hover:bg-red-700 py-3 px-4 rounded-lg font-medium transition-colors text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-blue-800 py-3 px-4 rounded-lg font-medium transition-colors text-white"
            >
              {loading ? "Creating..." : "Create Subscription"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
