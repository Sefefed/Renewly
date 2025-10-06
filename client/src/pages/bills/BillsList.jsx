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
import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
} from "../../utils/formatters";

export default function BillsList() {
  const { token } = useAuth();
  const api = useApi(token);
  const navigate = useNavigate();
  const { currency } = useCurrency();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const DELAY_MS = 400;

  const filters = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "overdue", label: "Overdue" },
  ];

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getBills();
      setBills(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handleMarkPaid = async (billId) => {
    try {
      await api.markBillPaid(billId);
      await fetchBills(); // Refresh the list
    } catch (err) {
      alert("Failed to mark bill as paid: " + err.message);
    }
  };

  const handleDelayedNav = (e, path) => {
    e.preventDefault();
    setTimeout(() => navigate(path), DELAY_MS);
  };

  const filteredBills = bills.filter((bill) => {
    if (filter === "all") return true;
    return bill.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner text="Loading bills..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <ErrorMessage error={error} onRetry={fetchBills} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-white">
      <Navigation />

      {/* Header */}
      <header className="border-b bg-blue-900 px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Bills</h1>
            <p className="text-sm text-gray-300">
              Manage your household bills and recurring payments
            </p>
          </div>
          <Link
            to="/bills/add"
            onClick={(e) => handleDelayedNav(e, "/bills/add")}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm text-white w-full text-center sm:w-auto"
          >
            Add Bill
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
                bills.filter((bill) =>
                  f.value === "all" ? true : bill.status === f.value
                ).length
              })`,
            }))}
            activeFilter={filter}
            onFilterChange={setFilter}
          />
        </div>

        {/* Bills List */}
        <div className="space-y-4">
          {filteredBills.length > 0 ? (
            filteredBills.map((bill) => (
              <div
                key={bill._id}
                className="bg-white rounded-lg border border-gray-200 p-6 transition-colors hover:bg-gray-50"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4 sm:items-center">
                    <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                      <span className="text-base font-bold text-white">
                        {bill.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {bill.name}
                      </h3>
                      <p className="text-sm text-gray-900 capitalize">
                        {bill.category} • {bill.paymentMethod}
                      </p>
                      <p className="text-sm text-gray-900">
                        Due: {formatDate(bill.dueDate)} (
                        {formatRelativeDate(bill.dueDate)})
                      </p>
                      {bill.autoPay && (
                        <span className="inline-block mt-1 px-2 py-1 bg-blue-500/20 text-blue-600 text-xs rounded-3xl">
                          Auto Pay
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end md:gap-6">
                    <div className="text-left md:text-right">
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(bill.amount, bill.currency || currency)}
                      </p>
                      <StatusBadge status={bill.status} />
                    </div>

                    <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:justify-end">
                      {bill.status === "pending" && (
                        <button
                          onClick={() => handleMarkPaid(bill._id)}
                          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm text-white w-full sm:w-auto"
                        >
                          Mark Paid
                        </button>
                      )}
                      <Link
                        to={`/bills/${bill._id}`}
                        onClick={(e) =>
                          handleDelayedNav(e, `/bills/${bill._id}`)
                        }
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm text-white w-full sm:w-auto"
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
              title="No bills found"
              description={
                filter === "all"
                  ? "Add your first bill to get started"
                  : `No ${filter} bills found`
              }
              actionText={filter === "all" ? "Add Bill" : null}
              onAction={
                filter === "all"
                  ? () => setTimeout(() => navigate("/bills/add"), DELAY_MS)
                  : null
              }
              icon="💳"
            />
          )}
        </div>
      </main>
    </div>
  );
}
