import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { useApi } from "../../utils/api";
import { getNotificationIcon } from "./utils";
import BellIcon from "../../assets/bell-icon.png";

const PRIORITY_STYLES = {
  urgent: "border-rose-200 bg-rose-50",
  high: "border-amber-200 bg-amber-50",
  medium: "border-blue-200 bg-blue-50",
  low: "border-slate-200 bg-slate-50",
};

const getPriorityStyles = (priority) =>
  PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium;

export default function NotificationBell({ token, onOpenCenter }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [menuStyles, setMenuStyles] = useState(null);
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
    if (!isOpen) {
      return undefined;
    }

    const handleInteraction = (event) => {
      const target = event.target;
      if (buttonRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleInteraction);
    document.addEventListener("touchstart", handleInteraction);

    return () => {
      document.removeEventListener("mousedown", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, [isOpen]);

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

  const updateMenuPosition = useCallback(() => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 16;
    const preferredWidth = 384; // 24rem
    const width = Math.min(preferredWidth, viewportWidth - margin * 2);
    const availableHeight = Math.max(200, viewportHeight - margin * 2);
    let estimatedHeight = Math.min(560, availableHeight);

    let left = rect.right - width;
    left = Math.max(margin, left);
    left = Math.min(left, viewportWidth - width - margin);

    const spaceBelow = viewportHeight - rect.bottom - margin;
    const topCandidate = rect.bottom + 12;
    let top = topCandidate;

    if (spaceBelow < estimatedHeight) {
      top = Math.max(margin, viewportHeight - estimatedHeight - margin);
    }

    const remaining = Math.max(120, viewportHeight - top - margin);
    estimatedHeight = Math.min(estimatedHeight, remaining);

    setMenuStyles({
      width: `${width}px`,
      left: `${left}px`,
      top: `${top}px`,
      maxHeight: `${estimatedHeight}px`,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setMenuStyles(null);
      return undefined;
    }

    updateMenuPosition();

    const handleResize = () => updateMenuPosition();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [isOpen, updateMenuPosition]);

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={() => token && setIsOpen((prev) => !prev)}
        className="relative inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition-all duration-200 hover:border-blue-200 hover:text-blue-600 hover:shadow-lg"
        aria-label="Notifications"
        ref={buttonRef}
      >
        <span className="text-xl">
          <img
            src={BellIcon}
            alt="Notification"
            className="w-6 h-6 inline-block"
          />
        </span>{" "}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen &&
        menuStyles &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[80] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
            style={menuStyles}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="font-semibold text-primary">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-500"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={fetchNotifications}
                  className="text-sm font-medium  bg-green-500 hover:bg-green-600 text-white"
                >
                  Refresh
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[60vh]">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-500" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-secondary">
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
                    className={`w-full border-l-4 text-left transition-colors duration-200 ${getPriorityStyles(
                      notification.priority
                    )} ${
                      !notification.isRead ? "bg-white" : "bg-white"
                    } hover:bg-blue-50`}
                  >
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        <span className="text-sm">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4
                            className={`font-bold ${
                              !notification.isRead
                                ? "text-primary"
                                : "text-secondary"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="mt-1 text-base text-black">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-base text-tertiary">
                          {new Date(
                            notification.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="border-t border-slate-200 bg-slate-50/80 p-3">
              <button
                type="button"
                onClick={handleViewAll}
                className="w-full py-2 text-center text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                View All Notifications
              </button>
            </div>
          </div>,
          document.body
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
