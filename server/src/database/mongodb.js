import mongoose from "mongoose";

import { DB_URI, NODE_ENV } from "../config/env.js";

if (!DB_URI) {
  console.error("Database URI is not defined");
  process.exit(1);
}

const connectToDatabase = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log(`Connected to MongoDB at ${NODE_ENV} Environment`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    // Fail fast so we notice immediately and nodemon retries
    process.exit(1);
  }
};

export default connectToDatabase;
