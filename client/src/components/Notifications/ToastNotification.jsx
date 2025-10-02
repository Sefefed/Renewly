import { useEffect } from "react";
import PropTypes from "prop-types";
import { getNotificationIcon } from "./utils";

const DEFAULT_AUTO_HIDE = 5000;

const getContainerStyles = (type, priority) => {
  const base =
    "pointer-events-auto w-full max-w-sm rounded-xl border-l-4 bg-white shadow-xl";
  const priorityStyles = {
    renewal: "border-blue-400",
    budget: priority === "urgent" ? "border-rose-400" : "border-amber-400",
    recommendation: "border-emerald-400",
    warning: "border-amber-400",
    system: "border-slate-300",
    bill: priority === "urgent" ? "border-rose-400" : "border-teal-400",
  };

  return `${base} ${priorityStyles[type] || "border-slate-300"}`;
};

export default function ToastNotification({
  notification,
  onClose,
  autoHideDuration,
}) {
  useEffect(() => {
    if (!autoHideDuration) return undefined;

    const timer = setTimeout(onClose, autoHideDuration);
    return () => clearTimeout(timer);
  }, [autoHideDuration, onClose]);

  return (
    <div
      className={getContainerStyles(notification.type, notification.priority)}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-lg">
              {getNotificationIcon(notification.type)}
            </span>
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-semibold text-primary">
              {notification.title}
            </p>
            <p className="mt-1 text-sm text-secondary">
              {notification.message}
            </p>
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex rounded-md border border-slate-200 bg-white px-1 text-tertiary transition-colors hover:border-blue-200 hover:text-blue-600 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <span className="text-lg">×</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ToastNotification.propTypes = {
  notification: PropTypes.shape({
    type: PropTypes.string,
    priority: PropTypes.string,
    title: PropTypes.string,
    message: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  autoHideDuration: PropTypes.number,
};

ToastNotification.defaultProps = {
  autoHideDuration: DEFAULT_AUTO_HIDE,
};
