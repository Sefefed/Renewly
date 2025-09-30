import express from "express";
import cors from "cors";
import { PORT, NODE_ENV } from "./config/env.js";
import userRouter from "./routes/userRoutes.js";
import authRouter from "./routes/authRoutes.js";
import subscriptionRouter from "./routes/subscriptionRoutes.js";
import billRouter from "./routes/billRoutes.js";
import budgetRouter from "./routes/budgetRoutes.js";
import insightsRouter from "./routes/insightsRoutes.js";
import calendarRouter from "./routes/calendarRoutes.js";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import notificationRouter from "./routes/notificationRoutes.js";
import backgroundNotificationService from "./services/notifications/backgroundNotificationService.js";
//import arcjetMiddleware from './middleware/ArcjetMiddleware.js';
import workflowRouter from "./routes/workflowRoutes.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow frontend dev origin (Vite)
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/bills", billRouter);
app.use("/api/v1/budgets", budgetRouter);
app.use("/api/v1/insights", insightsRouter);
app.use("/api/v1", calendarRouter);
app.use("/api/v1/workflows", workflowRouter);
app.use("/api/v1/notifications", notificationRouter);

app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("Welcome to the Renewly API!");
});

app.listen(PORT, async () => {
  console.log(`Renewly API is running on http://localhost:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  await connectToDatabase();
  backgroundNotificationService.start();
});
