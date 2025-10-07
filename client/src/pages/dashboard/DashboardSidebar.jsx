import PropTypes from "prop-types";
import { useMemo } from "react";

const DASHBOARD_ITEMS = [
  { id: "financial-insights", label: "Financial Insights" },
  { id: "predictive-alerts", label: "Predictive Alerts" },
  { id: "smart-recommendations", label: "Smart Recommendations" },
  { id: "spending-trends", label: "Spending Trends" },
  { id: "personalized-tips", label: "Personalized Tips" },
  { id: "upcoming-renewals", label: "Upcoming Renewals" },
  { id: "category-breakdown", label: "Category Breakdown" },
  { id: "monthly-comparison", label: "Monthly Comparison" },
  { id: "budget-status", label: "Budget Status" },
];

const ROUTE_ITEMS = [
  { id: "route:/subscriptions", label: "Subscriptions" },
  { id: "route:/bills", label: "Bills" },
  { id: "route:/settings", label: "Settings" },
];

const DashboardSidebar = ({ isOpen, onClose, onNavigate }) => {
  const dashboardNavigation = useMemo(() => DASHBOARD_ITEMS, []);
  const routeNavigation = useMemo(() => ROUTE_ITEMS, []);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isOpen
            ? "pointer-events-auto bg-slate-900/20 backdrop-blur-sm opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isOpen}
        onClick={onClose}
      />

      <aside
        id="dashboard-sidebar"
        className={`fixed left-0 top-0 z-50 flex h-full w-72 max-w-[80vw] flex-col border-r border-slate-200 bg-gradient-to-b from-blue-50 to-blue-100 p-6 shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="complementary"
        aria-label="Dashboard section navigation"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Dashboard
            </p>
            <h2 className="text-lg font-semibold text-gray-800 mt-1">
              Quick Navigation
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center bg-gradient-to-b from-blue-50 to-blue-100 justify-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="sr-only">Close navigation</span>
            <span
              aria-hidden="true"
              className="flex items-center gap-2 bg-transparent text-gray-900 font-extrabold px-4 py-2 rounded-xl transition-all duration-300"
            >
              ←
            </span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {dashboardNavigation.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className="w-full py-2 px-4 bg-white text-gray-800 rounded-xl shadow-sm hover:bg-black hover:text-white font-medium text-sm transition"
                >
                  <span className="text-base  rounded-md px-4 py-2 cursor-pointer">
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="border-t border-slate-200 pt-2">
            <ul className="space-y-1">
              {routeNavigation.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className="w-full py-2 px-4 bg-white text-gray-800 rounded-xl shadow-sm hover:bg-slate-900 hover:text-white font-medium text-sm transition"
                  >
                    <span className="text-base rounded-md px-4 py-2 cursor-pointer">
                      {item.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <p className="mt-6 text-sm text-slate-600">
          Use the links above to move around the dashboard quickly.
        </p>
      </aside>
    </>
  );
};

DashboardSidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default DashboardSidebar;
