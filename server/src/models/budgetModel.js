import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    monthlyLimit: {
      type: Number,
      required: [true, "Monthly limit is required"],
      min: [0, "Monthly limit must be greater than 0"],
    },
    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP"],
      default: "USD",
    },
    categoryLimits: {
      entertainment: {
        type: Number,
        default: 0,
      },
      utilities: {
        type: Number,
        default: 0,
      },
      rent: {
        type: Number,
        default: 0,
      },
      insurance: {
        type: Number,
        default: 0,
      },
      phone: {
        type: Number,
        default: 0,
      },
      internet: {
        type: Number,
        default: 0,
      },
      other: {
        type: Number,
        default: 0,
      },
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      threshold: {
        type: Number,
        default: 80, // Percentage
        min: 0,
        max: 100,
      },
    },
  },
  { timestamps: true }
);

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;
