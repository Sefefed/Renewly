import express from "express";
import { PORT, NODE_ENV } from './config/env.js';
import userRouter from './routes/userRoutes.js';
import authRouter from "./routes/authRoutes.js";
import subscriptionRouter from "./routes/subscriptionRoutes.js";
import connectToDatabase from './database/mongodb.js';
const app = express();

app.use(express.json());
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the Subscription Tracker API!");
}); 


app.listen(PORT, async () => {
  console.log(`Subscription tracker API is running on http://localhost:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  await connectToDatabase();
});
