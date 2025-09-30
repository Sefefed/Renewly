import { useEffect } from "react";
import PropTypes from "prop-types";
import { getNotificationIcon } from "./utils";

const DEFAULT_AUTO_HIDE = 5000;

const getContainerStyles = (type, priority) => {
  const base =
    "max-w-sm w-full bg-gray-800 shadow-lg rounded-xl pointer-events-auto border-l-4";
  const priorityStyles = {
    renewal: "border-blue-500",
    budget: priority === "urgent" ? "border-red-500" : "border-orange-500",
    recommendation: "border-green-500",
    warning: "border-yellow-500",
    system: "border-gray-500",
    bill: priority === "urgent" ? "border-red-500" : "border-teal-500",
  };

  return `${base} ${priorityStyles[type] || "border-gray-500"}`;
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
            <p className="text-sm font-medium text-white">
              {notification.title}
            </p>
            <p className="mt-1 text-sm text-gray-400">{notification.message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-300 focus:outline-none"
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
