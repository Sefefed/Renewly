import mongoose from "mongoose";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.development.local" });

const testConnection = async () => {
  try {
    console.log("Testing MongoDB connection...");
    console.log("DB_URI:", process.env.DB_URI ? "Set" : "Not set");

    if (!process.env.DB_URI) {
      console.error("❌ DB_URI is not defined in .env.development.local");
      return;
    }

    await mongoose.connect(process.env.DB_URI);
    console.log("✅ Successfully connected to MongoDB Atlas!");

    // Test a simple operation
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      "📋 Available collections:",
      collections.map((c) => c.name)
    );

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    if (error.message.includes("ETIMEOUT")) {
      console.log(
        "💡 This is a DNS timeout - check your network or Atlas IP whitelist"
      );
    } else if (error.message.includes("authentication")) {
      console.log("💡 Authentication failed - check your username/password");
    }
  }
};

testConnection();
