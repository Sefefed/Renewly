import { Router } from "express";
import { getInsights } from "../controllers/insightsController.js";
import authorize from "../middleware/authMiddleware.js";

const insightsRouter = Router();

insightsRouter.use(authorize); // All insights routes require authentication

insightsRouter.get("/", getInsights);

export default insightsRouter;
