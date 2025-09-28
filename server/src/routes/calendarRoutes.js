import { Router } from "express";
import { exportCalendar } from "../controllers/calendarController.js";
import authorize from "../middleware/authMiddleware.js";

const calendarRouter = Router();

calendarRouter.use(authorize); // All calendar routes require authentication

calendarRouter.get("/calendar.ics", exportCalendar);

export default calendarRouter;
