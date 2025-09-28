import { Router } from "express";
import authorize from "../middleware/authMiddleware.js";
import {
  createSubscription,
  getUserSubscriptions,
} from "../controllers/subscriptionController.js";
const subscriptionRouter = Router();

subscriptionRouter.use(authorize); // All subscription routes require authentication

subscriptionRouter.post("/", createSubscription);
subscriptionRouter.get("/", getUserSubscriptions);

export default subscriptionRouter;
