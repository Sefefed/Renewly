import PropTypes from "prop-types";
import { useState } from "react";

export default function DashboardHeader({
  userName,
  onExportCalendar,
  onOpenSettings,
  onOpenNotificationCenter,
  notificationSlot,
}) {
  const [activeButton, setActiveButton] = useState(null);

  const handleButtonClick = (buttonName, callback) => {
    setActiveButton(buttonName);
    
    // Reset the active state after 300ms to show the click effect
    setTimeout(() => {
      setActiveButton(null);
    }, 300);
    
    // Call the original callback function
    if (callback) callback();
  };

  const getButtonClass = (buttonName, baseClasses, hoverClasses) => {
    const isActive = activeButton === buttonName;
    
    if (isActive) {
      return `inline-flex items-center gap-2 rounded-2xl border border-gray-800 bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 transform scale-95`;
    }
    
    return `${baseClasses} ${hoverClasses}`;
  };

  return (
    <header className="dashboard-card dashboard-card--compact flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between px-4 sm:px-6">
      <div className="space-y-2 text-center lg:text-left">
        <div className="badge-soft w-max mx-auto lg:mx-0">Overview</div>
        <h1 className="dashboard-page-title text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Dashboard
        </h1>
        <p className="dashboard-subtitle text-base sm:text-lg text-gray-600 font-medium">
          Welcome back,{" "}
          <span className="text-primary font-semibold">{userName}</span>
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">
        {notificationSlot}
        <button
          onClick={() => handleButtonClick('notification', onOpenNotificationCenter)}
          className={getButtonClass(
            'notification',
            "inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 sm:px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200",
            "hover:border-blue-200 hover:text-blue-600 hover:shadow-lg"
          )}
          type="button"
        >
          <span></span>
          Notification Center
        </button>
        <button
          onClick={() => handleButtonClick('export', onExportCalendar)}
          className={getButtonClass(
            'export',
            "inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50/60 px-4 sm:px-5 py-2.5 text-sm font-semibold text-blue-600 shadow-sm transition-all duration-200",
            "hover:bg-blue-100 hover:shadow-lg"
          )}
          type="button"
        >
          <span></span>
          Export Calendar
        </button>
        <button
          onClick={() => handleButtonClick('settings', onOpenSettings)}
          className={getButtonClass(
            'settings',
            "inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 sm:px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200",
            "hover:border-slate-300 hover:shadow-lg"
          )}
          type="button"
        >
          <span></span>
          Settings
        </button>
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