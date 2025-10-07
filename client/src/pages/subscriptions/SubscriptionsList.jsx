import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "../../components/Navigation";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import StatusBadge from "../../components/ui/StatusBadge";
import FilterTabs from "../../components/ui/FilterTabs";
import EmptyState from "../../components/ui/EmptyState";
import { useApi } from "../../utils/api";
import { useCurrency } from "../../hooks/useCurrency";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function SubscriptionsList() {
  const { token } = useAuth();
  const api = useApi(token);
  const navigate = useNavigate();
  const { currency } = useCurrency();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [cancellingIds, setCancellingIds] = useState(() => new Set());
  const [reminderIds, setReminderIds] = useState(() => new Set());
  const DELAY_MS = 400;

  const filters = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "cancelled", label: "Cancelled" },
    { value: "expired", label: "Expired" },
  ];

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getSubscriptions();
      setSubscriptions(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (filter === "all") return true;
    return sub.status === filter;
  });

  const handleTestReminder = useCallback(
    async (subscriptionId) => {
      setReminderIds((prev) => {
        const next = new Set(prev);
        next.add(subscriptionId);
        return next;
      });

      try {
        await api.sendReminder(subscriptionId, true);
        alert("Test reminder sent successfully!");
      } catch (err) {
        alert("Failed to send reminder: " + err.message);
      } finally {
        setReminderIds((prev) => {
          const next = new Set(prev);
          next.delete(subscriptionId);
          return next;
        });
      }
    },
    [api]
  );

  const handleAssistCancel = useCallback(
    async (subscriptionId) => {
      setCancellingIds((prev) => {
        const next = new Set(prev);
        next.add(subscriptionId);
        return next;
      });

      try {
        await api.deleteSubscription(subscriptionId);
        setSubscriptions((prev) =>
          prev.filter((item) => item._id !== subscriptionId)
        );
      } catch (err) {
        alert("Failed to cancel subscription: " + err.message);
      } finally {
        setCancellingIds((prev) => {
          const next = new Set(prev);
          next.delete(subscriptionId);
          return next;
        });
      }
    },
    [api]
  );

  const handleDelayedNav = (e, path) => {
    e.preventDefault();
    setTimeout(() => navigate(path), DELAY_MS);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner text="Loading subscriptions..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <ErrorMessage error={error} onRetry={fetchSubscriptions} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navigation />
      {/* Header */}
      <header className=" bg-blue-900 px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
            <p className="text-base text-gray-300">
              Manage your subscription services
            </p>
          </div>
          <Link
            to="/subscriptions/add"
            onClick={(e) => handleDelayedNav(e, "/subscriptions/add")}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm text-white w-full text-center sm:w-auto"
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
              label: `${f.label} (${
                subscriptions.filter((sub) =>
                  f.value === "all" ? true : sub.status === f.value
                ).length
              })`,
            }))}
            activeFilter={filter}
            onFilterChange={setFilter}
          />
        </div>

        {/* Subscriptions List */}
        <div className="space-y-4">
          {filteredSubscriptions.length > 0 ? (
            filteredSubscriptions.map((subscription) => {
              const isCancelling = cancellingIds.has(subscription._id);
              const isSendingReminder = reminderIds.has(subscription._id);

              return (
                <div
                  key={subscription._id}
                  className="bg-white rounded-lg p-6 transition-colors hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4 sm:items-center">
                      <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                        <span className="text-xl">
                          {subscription.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {subscription.name}
                        </h3>
                        <p className="text-sm text-gray-900 capitalize">
                          {subscription.category} • {subscription.frequency}
                        </p>
                        <p className="text-sm text-gray-900">
                          Next renewal: {formatDate(subscription.renewalDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end md:gap-6">
                      <div className="text-left md:text-right">
                        <p className="text-xl font-bold">
                          {formatCurrency(
                            subscription.price,
                            subscription.currency || currency
                          )}
                        </p>
                        <StatusBadge status={subscription.status} />
                      </div>

                      <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:justify-end">
                        <button
                          onClick={() => handleTestReminder(subscription._id)}
                          className={`bg-sky-500 text-white px-3 py-1 rounded text-sm w-full sm:w-auto transition-colors ${
                            subscription.status !== "active" ||
                            isSendingReminder
                              ? "cursor-not-allowed opacity-70"
                              : "hover:bg-sky-600"
                          }`}
                          disabled={
                            subscription.status !== "active" ||
                            isSendingReminder
                          }
                        >
                          {isSendingReminder ? "Sending..." : "Test Reminder"}
                        </button>
                        <button
                          onClick={() => handleAssistCancel(subscription._id)}
                          className={`bg-red-500 text-white px-3 py-1 rounded text-sm w-full sm:w-auto transition-colors ${
                            isCancelling
                              ? "cursor-not-allowed opacity-70"
                              : "hover:bg-red-600"
                          }`}
                          disabled={isCancelling}
                        >
                          {isCancelling ? "Cancelling..." : "Assist Cancel"}
                        </button>
                        <Link
                          to={`/subscriptions/${subscription._id}`}
                          onClick={(e) =>
                            handleDelayedNav(
                              e,
                              `/subscriptions/${subscription._id}`
                            )
                          }
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm text-white w-full sm:w-auto"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState
              title="No subscriptions found"
              description={
                filter === "all"
                  ? "Add your first subscription to get started"
                  : `No ${filter} subscriptions found`
              }
              actionText={filter === "all" ? "Add Subscription" : null}
              onAction={
                filter === "all"
                  ? () =>
                      setTimeout(() => navigate("/subscriptions/add"), DELAY_MS)
                  : null
              }
              icon="📱"
            />
          )}
        </div>
      </main>
    </div>
  );
}
