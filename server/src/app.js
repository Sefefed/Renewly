import express from "express";
import { PORT, NODE_ENV } from './config/env.js';
import userRouter from './routes/userRoutes.js';
import authRouter from "./routes/authRoutes.js";
import subscriptionRouter from "./routes/subscriptionRoutes.js";
import connectToDatabase from './database/mongodb.js';
import errorMiddleware from './middleware/errorMiddleware.js';
//import arcjetMiddleware from './middleware/ArcjetMiddleware.js';
import workflowRouter from './routes/workflowRoutes.js';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(arcjetMiddleware);

app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/workflows', workflowRouter);

app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("Welcome to the Renewly API!");
}); 


app.listen(PORT, async () => {
  console.log(`Renewly API is running on http://localhost:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  await connectToDatabase();
});
