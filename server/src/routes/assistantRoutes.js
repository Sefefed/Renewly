import { Router } from "express";
import authorize from "../middleware/authMiddleware.js";
import {
  processAssistantQuery,
  getAssistantInsights,
  recordAssistantFeedback,
} from "../controllers/assistantController.js";

const assistantRouter = Router();

assistantRouter.use(authorize);

assistantRouter.post("/query", processAssistantQuery);
assistantRouter.get("/insights", getAssistantInsights);
assistantRouter.post("/feedback", recordAssistantFeedback);

export default assistantRouter;
