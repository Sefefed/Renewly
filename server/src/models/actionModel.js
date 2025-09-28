import mongoose from "mongoose";

const actionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "cancel_subscription",
        "mark_bill_paid",
        "update_budget",
        "send_reminder",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    entityType: {
      type: String,
      enum: ["subscription", "bill", "budget"],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailContent: {
      type: String,
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

const Action = mongoose.model("Action", actionSchema);

export default Action;
