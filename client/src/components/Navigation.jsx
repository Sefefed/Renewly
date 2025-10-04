import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import DelayedLink from "./ui/DelayedLink";

export default function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const DELAY_MS = 400;

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex items-center flex-shrink-0">
              <DelayedLink
                to="/dashboard"
                delay={DELAY_MS}
                className="text-xl font-bold text-primary"
              >
                Renewly
              </DelayedLink>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              <DelayedLink
                to="/dashboard"
                delay={DELAY_MS}
                className={`inline-flex items-center border-b-2 px-2 pt-1 text-sm font-medium transition-all duration-200 ${
                  isActive("/dashboard")
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                Dashboard
              </DelayedLink>

              <DelayedLink
                to="/subscriptions"
                delay={DELAY_MS}
                className={`inline-flex items-center border-b-2 px-2 pt-1 text-sm font-medium transition-all duration-200 ${
                  isActive("/subscriptions")
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                Subscriptions
              </DelayedLink>

              <DelayedLink
                to="/bills"
                delay={DELAY_MS}
                className={`inline-flex items-center border-b-2 px-2 pt-1 text-sm font-medium transition-all duration-200 ${
                  isActive("/bills")
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                Bills
              </DelayedLink>

              <DelayedLink
                to="/budgets"
                delay={DELAY_MS}
                className={`inline-flex items-center border-b-2 px-2 pt-1 text-sm font-medium transition-all duration-200 ${
                  isActive("/budgets")
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                Budgets
              </DelayedLink>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="relative ml-3">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Welcome,{" "}
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {user?.name}
                  </span>
                </span>
                <button
                  onClick={logout}
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-red-600"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
