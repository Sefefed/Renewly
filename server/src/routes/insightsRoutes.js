import { Router } from "express";
import {
  getEnhancedInsights,
  getInsights,
  getSmartInsights,
} from "../controllers/insightsController.js";
import authorize from "../middleware/authMiddleware.js";

const insightsRouter = Router();

insightsRouter.use(authorize); // All insights routes require authentication

insightsRouter.get("/", getInsights);
insightsRouter.get("/enhanced", getEnhancedInsights);
insightsRouter.get("/smart", getSmartInsights);

export default insightsRouter;
