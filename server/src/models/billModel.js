import mongoose from "mongoose";
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCY_CODES,
} from "../constants/currencies.js";

const billSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Bill name is required"],
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    amount: {
      type: Number,
      required: [true, "Bill amount is required"],
      min: [0, "Amount must be greater than 0"],
    },
    currency: {
      type: String,
      enum: SUPPORTED_CURRENCY_CODES,
      default: DEFAULT_CURRENCY,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    category: {
      type: String,
      enum: ["utilities", "rent", "insurance", "phone", "internet", "other"],
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
    autoPay: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "overdue"],
      default: "pending",
    },
    paidDate: {
      type: Date,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Auto-update status based on due date
billSchema.pre("save", function (next) {
  const now = new Date();

  if (this.status === "paid" && this.paidDate) {
    // Bill is paid
    return next();
  }

  if (this.dueDate < now) {
    this.status = "overdue";
  } else {
    this.status = "pending";
  }

  next();
});

billSchema.index({ user: 1, dueDate: 1 });
billSchema.index({ user: 1, category: 1 });

const Bill = mongoose.model("Bill", billSchema);

export default Bill;
