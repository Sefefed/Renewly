import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "../../components/Navigation";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import StatusBadge from "../../components/ui/StatusBadge";
import FilterTabs from "../../components/ui/FilterTabs";
import EmptyState from "../../components/ui/EmptyState";
import { useApi } from "../../utils/api";
import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
} from "../../utils/formatters";

export default function SubscriptionsList() {
  const { token } = useAuth();
  const api = useApi(token);
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const DELAY_MS = 400;

  const filters = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "cancelled", label: "Cancelled" },
    { value: "expired", label: "Expired" },
  ];

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await api.getSubscriptions();
      setSubscriptions(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (filter === "all") return true;
    return sub.status === filter;
  });

  const handleTestReminder = async (subscriptionId) => {
    try {
      await api.sendReminder(subscriptionId, true);
      alert("Test reminder sent successfully!");
    } catch (err) {
      alert("Failed to send reminder: " + err.message);
    }
  };

  const handleDelayedNav = (e, path) => {
    e.preventDefault();
    setTimeout(() => navigate(path), DELAY_MS);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner text="Loading subscriptions..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <ErrorMessage error={error} onRetry={fetchSubscriptions} />
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
            <h1 className="text-2xl font-semibold">Subscriptions</h1>
            <p className="text-sm text-gray-400">
              Manage your subscription services
            </p>
          </div>
          <Link
            to="/subscriptions/add"
            onClick={(e) => handleDelayedNav(e, '/subscriptions/add')}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
          >
            Add Subscription
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        {/* Filters */}
        <div className="mb-6">
          <FilterTabs
            filters={filters.map((f) => ({
              ...f,
              label: `${f.label} (${subscriptions.filter((sub) =>
                f.value === "all" ? true : sub.status === f.value
              ).length})`,
            }))}
            activeFilter={filter}
            onFilterChange={setFilter}
          />
        </div>

        {/* Subscriptions List */}
        <div className="space-y-4">
          {filteredSubscriptions.length > 0 ? (
            filteredSubscriptions.map((subscription) => (
              <div
                key={subscription._id}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-xl">
                        {subscription.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {subscription.name}
                      </h3>
                      <p className="text-sm text-gray-400 capitalize">
                        {subscription.category} • {subscription.frequency}
                      </p>
                      <p className="text-sm text-gray-400">
                        Next renewal: {formatDate(subscription.renewalDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold">
                        {formatCurrency(subscription.price)}
                      </p>
                      <StatusBadge status={subscription.status} />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTestReminder(subscription._id)}
                        className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm"
                        disabled={subscription.status !== "active"}
                      >
                        Test Reminder
                      </button>
                      <button className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm">
                        Assist Cancel
                      </button>
                      <Link
                        to={`/subscriptions/${subscription._id}`}
                        onClick={(e) => handleDelayedNav(e, `/subscriptions/${subscription._id}`)}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="No subscriptions found"
              description={
                filter === "all"
                  ? "Add your first subscription to get started"
                  : `No ${filter} subscriptions found`
              }
              actionText={filter === "all" ? "Add Subscription" : null}
              onAction={filter === "all" ? () => setTimeout(() => navigate('/subscriptions/add'), DELAY_MS) : null}
              icon="📱"
            />
          )}
        </div>
      </main>
    </div>
  );
}
