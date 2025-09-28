import { Router } from "express";
import { getBudget, updateBudget } from "../controllers/budgetController.js";
import authorize from "../middleware/authMiddleware.js";

const budgetRouter = Router();

budgetRouter.use(authorize); // All budget routes require authentication

budgetRouter.get("/", getBudget);
budgetRouter.put("/", updateBudget);

export default budgetRouter;
