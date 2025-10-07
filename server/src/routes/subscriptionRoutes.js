import { Router } from "express";
import authorize from "../middleware/authMiddleware.js";
import {
  createSubscription,
  getUserSubscriptions,
  deleteSubscription,
  sendTestReminder,
} from "../controllers/subscriptionController.js";
const subscriptionRouter = Router();

subscriptionRouter.use(authorize); // All subscription routes require authentication

subscriptionRouter
  .route("/")
  .post(createSubscription)
  .get(getUserSubscriptions);

subscriptionRouter.delete("/:id", deleteSubscription);
subscriptionRouter.post("/:id/reminders/test", sendTestReminder);

export default subscriptionRouter;
