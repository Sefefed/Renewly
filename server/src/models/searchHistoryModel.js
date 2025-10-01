import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    query: {
      type: String,
      trim: true,
      default: "",
    },
    filters: {
      type: Object,
      default: {},
    },
    resultsCount: {
      type: Number,
      default: 0,
    },
    context: {
      type: String,
      trim: true,
      default: "subscriptions",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const SearchHistory = mongoose.model("SearchHistory", searchHistorySchema);

export default SearchHistory;
