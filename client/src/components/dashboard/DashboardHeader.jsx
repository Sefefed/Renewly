import PropTypes from "prop-types";

export default function DashboardHeader({
  userName,
  onExportCalendar,
  onOpenSettings,
  onOpenNotificationCenter,
  notificationSlot,
}) {
  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md px-8 py-6 sticky top-0 z-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Welcome back,{" "}
            <span className="text-blue-400 font-medium">{userName}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {notificationSlot}
          <button
            onClick={onOpenNotificationCenter}
            className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
            type="button"
          >
            <span>🗂️</span>
            Notification Center
          </button>
          <button
            onClick={onExportCalendar}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
            type="button"
          >
            <span>📅</span>
            Export Calendar
          </button>
          <button
            onClick={onOpenSettings}
            className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
            type="button"
          >
            <span>⚙️</span>
            Settings
          </button>
        </div>
      </div>
    </header>
  );
}

DashboardHeader.propTypes = {
  userName: PropTypes.string,
  onExportCalendar: PropTypes.func.isRequired,
  onOpenSettings: PropTypes.func.isRequired,
  onOpenNotificationCenter: PropTypes.func,
  notificationSlot: PropTypes.node,
};

DashboardHeader.defaultProps = {
  userName: "User",
  onOpenNotificationCenter: () => {},
  notificationSlot: null,
};
