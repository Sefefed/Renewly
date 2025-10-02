import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useApi } from "../../utils/api";
import { getNotificationIcon } from "./utils";

const PAGE_SIZE = 20;

export default function NotificationCenter({ token, isOpen, onClose }) {
  const api = useApi(token);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadNotifications = useCallback(
    async (pageNumber = 1, reset = false) => {
      if (!token) return;
      try {
        setLoading(true);
        const response = await api.getNotifications({
          limit: PAGE_SIZE,
          page: pageNumber,
        });
        const fetched = response.data.notifications;

        setNotifications((prev) => (reset ? fetched : [...prev, ...fetched]));
        setHasMore(fetched.length === PAGE_SIZE);
        setPage(pageNumber);
      } catch (error) {
        console.error("Error loading notifications:", error);
      } finally {
        setLoading(false);
      }
    },
    [api, token]
  );

  useEffect(() => {
    if (!isOpen) return;
    loadNotifications(1, true);
  }, [isOpen, loadNotifications]);

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
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== notificationId)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className="absolute right-0 top-0 h-full w-96 max-w-full bg-white shadow-2xl border-l border-gray-200">
        <header className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close notification center"
          >
            <span className="text-2xl">×</span>
          </button>
        </header>

        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={markAllAsRead}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white shadow-sm transition-colors"
            >
              Mark All Read
            </button>
            <button
              type="button"
              onClick={() => loadNotifications(1, true)}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="h-full overflow-y-auto">
          {notifications.length === 0 && !loading ? (
            <div className="text-center py-12 text-gray-500">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <article
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <span className="text-lg">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={`font-medium ${
                            !notification.isRead
                              ? "text-gray-900"
                              : "text-gray-600"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <div className="flex gap-2">
                          {!notification.isRead && (
                            <button
                              type="button"
                              onClick={() => markAsRead(notification._id)}
                              className="text-blue-600 hover:text-blue-500 text-sm"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => deleteNotification(notification._id)}
                            className="text-gray-400 hover:text-red-500 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            notification.priority === "urgent"
                              ? "bg-red-100 text-red-600"
                              : notification.priority === "high"
                              ? "bg-orange-100 text-orange-600"
                              : notification.priority === "medium"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {notification.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {hasMore && (
            <div className="p-4 text-center">
              <button
                type="button"
                onClick={() => loadNotifications(page + 1)}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}

          {loading && notifications.length === 0 && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

NotificationCenter.propTypes = {
  token: PropTypes.string,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

NotificationCenter.defaultProps = {
  token: null,
  isOpen: false,
  onClose: undefined,
};
