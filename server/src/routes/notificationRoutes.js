import { Router } from "express";
import authorize from "../middleware/authMiddleware.js";
import {
  createManualNotification,
  getUnreadCount,
  listNotifications,
  markAllRead,
  markNotificationRead,
  removeNotification,
} from "../controllers/notificationController.js";

const notificationRouter = Router();

notificationRouter.get("/", authorize, listNotifications);
notificationRouter.get("/unread-count", authorize, getUnreadCount);
notificationRouter.patch("/mark-all-read", authorize, markAllRead);
notificationRouter.patch("/:id/read", authorize, markNotificationRead);
notificationRouter.delete("/:id", authorize, removeNotification);
notificationRouter.post("/", authorize, createManualNotification);

export default notificationRouter;
