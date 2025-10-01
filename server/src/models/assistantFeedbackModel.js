import mongoose from "mongoose";

const assistantFeedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    query: {
      type: String,
      required: true,
      trim: true,
    },
    response: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    helpful: {
      type: Boolean,
      default: true,
    },
    feedback: {
      type: String,
      trim: true,
      default: "",
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

assistantFeedbackSchema.index({ user: 1, createdAt: -1 });

const AssistantFeedback = mongoose.model(
  "AssistantFeedback",
  assistantFeedbackSchema
);

export default AssistantFeedback;
