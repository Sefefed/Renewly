import mongoose from "mongoose";
import { config } from "dotenv";
import User from "./src/models/userModel.js";
import Subscription from "./src/models/subscriptionModel.js";
import Bill from "./src/models/billModel.js";
import Budget from "./src/models/budgetModel.js";
import Action from "./src/models/actionModel.js";

// Load environment variables
config({ path: ".env.development.local" });

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("✅ Connected to MongoDB for seeding");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

const seedDemoData = async () => {
  try {
    console.log("🌱 Starting demo data seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Subscription.deleteMany({});
    await Bill.deleteMany({});
    await Budget.deleteMany({});
    await Action.deleteMany({});
    console.log("🧹 Cleared existing data");

    // Create demo user
    const demoUser = await User.create({
      name: "Demo User",
      email: "demo@renewly.com",
      password: "password123", // This will be hashed by the model
    });
    console.log("👤 Created demo user");

    // Create subscriptions
    const subscriptions = [
      {
        name: "Netflix",
        price: 15.99,
        currency: "USD",
        frequency: "monthly",
        category: "entertainment",
        paymentMethod: "Credit Card ****1234",
        status: "active",
        startDate: new Date("2024-01-01"),
        renewalDate: new Date("2024-12-15"), // 10 days from now
        user: demoUser._id,
      },
      {
        name: "Spotify Premium",
        price: 9.99,
        currency: "USD",
        frequency: "monthly",
        category: "entertainment",
        paymentMethod: "Credit Card ****1234",
        status: "active",
        startDate: new Date("2024-02-01"),
        renewalDate: new Date("2024-12-20"),
        user: demoUser._id,
      },
      {
        name: "Disney+",
        price: 7.99,
        currency: "USD",
        frequency: "monthly",
        category: "entertainment",
        paymentMethod: "Credit Card ****1234",
        status: "active",
        startDate: new Date("2024-03-01"),
        renewalDate: new Date("2024-12-25"),
        user: demoUser._id,
      },
      {
        name: "VS Code Pro",
        price: 4.99,
        currency: "USD",
        frequency: "monthly",
        category: "technology",
        paymentMethod: "PayPal",
        status: "active",
        startDate: new Date("2024-04-01"),
        renewalDate: new Date("2025-01-01"),
        user: demoUser._id,
      },
      {
        name: "Notion Pro",
        price: 8.0,
        currency: "USD",
        frequency: "monthly",
        category: "technology",
        paymentMethod: "Credit Card ****5678",
        status: "active",
        startDate: new Date("2024-05-01"),
        renewalDate: new Date("2025-01-05"),
        user: demoUser._id,
      },
    ];

    const createdSubscriptions = await Subscription.insertMany(subscriptions);
    console.log("📱 Created 5 subscriptions");

    // Create bills
    const bills = [
      {
        name: "Rent",
        amount: 1200.0,
        currency: "USD",
        dueDate: new Date("2024-12-01"), // 1st of month
        category: "rent",
        paymentMethod: "Bank Transfer",
        autoPay: true,
        status: "paid",
        paidDate: new Date("2024-11-30"),
        user: demoUser._id,
      },
      {
        name: "Internet",
        amount: 79.99,
        currency: "USD",
        dueDate: new Date("2024-12-03"), // 3rd of month
        category: "internet",
        paymentMethod: "Credit Card ****1234",
        autoPay: true,
        status: "pending",
        user: demoUser._id,
      },
      {
        name: "Electricity",
        amount: 85.5,
        currency: "USD",
        dueDate: new Date("2024-12-12"), // 12th of month
        category: "utilities",
        paymentMethod: "Bank Transfer",
        autoPay: false,
        status: "pending",
        user: demoUser._id,
      },
    ];

    const createdBills = await Bill.insertMany(bills);
    console.log("💳 Created 3 bills");

    // Create budget
    const budget = await Budget.create({
      user: demoUser._id,
      monthlyLimit: 300.0,
      currency: "USD",
      categoryLimits: {
        entertainment: 70.0,
        utilities: 100.0,
        rent: 1200.0,
        insurance: 50.0,
        phone: 60.0,
        internet: 80.0,
        other: 50.0,
      },
      notifications: {
        email: true,
        threshold: 80,
      },
    });
    console.log("💰 Created budget");

    // Create some actions
    const actions = [
      {
        type: "cancel_subscription",
        status: "completed",
        entityType: "subscription",
        entityId: createdSubscriptions[2]._id, // Disney+
        details: {
          reason: "Overlap with Netflix",
          suggestedAlternative: "Keep Netflix, cancel Disney+",
        },
        emailSent: true,
        emailContent: "Cancellation email sent to Disney+ support",
        user: demoUser._id,
      },
      {
        type: "send_reminder",
        status: "completed",
        entityType: "subscription",
        entityId: createdSubscriptions[0]._id, // Netflix
        details: {
          reminderType: "1 days before reminder",
          sentAt: new Date(),
        },
        emailSent: true,
        user: demoUser._id,
      },
    ];

    await Action.insertMany(actions);
    console.log("📋 Created 2 actions");

    console.log("🎉 Demo data seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`- 1 demo user (demo@renewly.com)`);
    console.log(
      `- 5 subscriptions (Netflix, Spotify, Disney+, VS Code, Notion)`
    );
    console.log(`- 3 bills (Rent, Internet, Electricity)`);
    console.log(`- 1 budget with category limits`);
    console.log(`- 2 actions (cancellation, reminder)`);
    console.log("\n🔑 Demo login: demo@renewly.com / password123");
  } catch (error) {
    console.error("❌ Error seeding demo data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

// Run the seeding
connectToDatabase().then(seedDemoData);
