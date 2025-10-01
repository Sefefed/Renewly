import { Router } from "express";
import authorize from "../middleware/authMiddleware.js";
import {
  searchSubscriptions,
  subscriptionSuggestions,
  popularSubscriptionSearches,
} from "../controllers/searchController.js";

const searchRouter = Router();

searchRouter.use(authorize);

searchRouter.get("/subscriptions", searchSubscriptions);
searchRouter.get("/subscriptions/suggestions", subscriptionSuggestions);
searchRouter.get("/subscriptions/popular", popularSubscriptionSearches);

export default searchRouter;
