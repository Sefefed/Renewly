import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-white">
                Renewly
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/dashboard")
                    ? "border-blue-500 text-white"
                    : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/subscriptions"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/subscriptions")
                    ? "border-blue-500 text-white"
                    : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                }`}
              >
                Subscriptions
              </Link>
              <Link
                to="/bills"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/bills")
                    ? "border-blue-500 text-white"
                    : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                }`}
              >
                Bills
              </Link>
              <Link
                to="/budgets"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/budgets")
                    ? "border-blue-500 text-white"
                    : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                }`}
              >
                Budgets
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">
                  Welcome, {user?.name}
                </span>
                <button
                  onClick={logout}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium"
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
