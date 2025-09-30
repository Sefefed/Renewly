import {
  createNotification,
  deleteNotification,
  getUnreadNotificationCount,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notifications/notificationService.js";

export const listNotifications = async (req, res, next) => {
  try {
    const { limit = 20, page = 1, unreadOnly } = req.query;
    const data = await getUserNotifications(req.user._id, {
      limit,
      page,
      unreadOnly: unreadOnly === "true",
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await getUnreadNotificationCount(req.user._id);
    res.status(200).json({ success: true, data: count });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await markNotificationAsRead(
      req.params.id,
      req.user._id
    );

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    await markAllNotificationsAsRead(req.user._id);
    res
      .status(200)
      .json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};

export const removeNotification = async (req, res, next) => {
  try {
    const notification = await deleteNotification(req.params.id, req.user._id);

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const createManualNotification = async (req, res, next) => {
  try {
    const notification = await createNotification(req.user._id, req.body);
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};
