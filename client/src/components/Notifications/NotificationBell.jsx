import { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { useApi } from "../../utils/api";
import { getNotificationIcon } from "./utils";

const PRIORITY_STYLES = {
  urgent: "border-red-500 bg-red-500/10",
  high: "border-orange-500 bg-orange-500/10",
  medium: "border-blue-500 bg-blue-500/10",
  low: "border-gray-500 bg-gray-500/10",
};

const getPriorityStyles = (priority) =>
  PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium;

export default function NotificationBell({ token, onOpenCenter }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const api = useApi(token);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.getUnreadNotificationCount();
      setUnreadCount(response.data);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [api, token]);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await api.getNotifications({ limit: 10 });
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [api, token]);

  useEffect(() => {
    if (!token) return;

    fetchUnreadCount();
    fetchNotifications();

    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount, fetchNotifications, token]);

  useEffect(() => {
    if (!isOpen) return;
    fetchNotifications();
  }, [fetchNotifications, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await api.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    onOpenCenter?.();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => token && setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
        aria-label="Notifications"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="font-semibold text-white">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={fetchNotifications}
                className="text-gray-400 hover:text-gray-300 text-sm font-medium"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-80">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center p-8 text-gray-400">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  type="button"
                  key={notification._id}
                  onClick={() =>
                    !notification.isRead && markAsRead(notification._id)
                  }
                  className={`w-full text-left p-4 border-l-4 ${getPriorityStyles(
                    notification.priority
                  )} hover:bg-gray-750 transition-colors duration-200 ${
                    !notification.isRead ? "bg-gray-750" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center">
                      <span className="text-sm">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4
                          className={`font-medium ${
                            !notification.isRead
                              ? "text-white"
                              : "text-gray-300"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="p-3 border-t border-gray-700 bg-gray-800">
            <button
              type="button"
              onClick={handleViewAll}
              className="w-full text-center text-blue-400 hover:text-blue-300 text-sm font-medium py-2"
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

NotificationBell.propTypes = {
  token: PropTypes.string,
  onOpenCenter: PropTypes.func,
};

NotificationBell.defaultProps = {
  token: null,
  onOpenCenter: undefined,
};
