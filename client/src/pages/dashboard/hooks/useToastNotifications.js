import { useCallback, useEffect, useRef, useState } from "react";

const useToastNotifications = ({ api, token }) => {
  const [toasts, setToasts] = useState([]);
  const displayedToastIdsRef = useRef(new Set());

  const addToast = useCallback((notification) => {
    if (!notification || !notification._id) return;
    if (displayedToastIdsRef.current.has(notification._id)) return;

    displayedToastIdsRef.current.add(notification._id);
    const toastId = `${notification._id}-${Date.now()}`;
    setToasts((prev) => [...prev, { ...notification, id: toastId }]);
  }, []);

  const removeToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
  }, []);

  const pollNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const unreadResponse = await api.getUnreadNotificationCount();
      if (!unreadResponse.data) {
        return;
      }
      const latestResponse = await api.getNotifications({
        limit: 1,
        unreadOnly: true,
      });
      const latestNotification = latestResponse.data.notifications?.[0];
      if (latestNotification) {
        addToast(latestNotification);
      }
    } catch (err) {
      console.error("Error polling notifications:", err);
    }
  }, [addToast, api, token]);

  useEffect(() => {
    if (!token) return;

    pollNotifications();
    const interval = setInterval(pollNotifications, 30000);
    return () => clearInterval(interval);
  }, [pollNotifications, token]);

  return {
    toasts,
    addToast,
    removeToast,
  };
};

export default useToastNotifications;
