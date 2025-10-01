import mongoose from "mongoose";
import Subscription from "../../models/subscriptionModel.js";
import SearchHistory from "../../models/searchHistoryModel.js";

const ALLOWED_SORT_FIELDS = new Set(["name", "price", "renewalDate", "createdAt", "status"]);

const parsePositiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const sanitizeSort = (sortBy, sortOrder, queryProvided) => {
  if (queryProvided && sortBy === "relevance") {
    return { field: "textScore", direction: { $meta: "textScore" } };
  }

  const field = ALLOWED_SORT_FIELDS.has(sortBy) ? sortBy : "name";
  const direction = sortOrder === "desc" ? -1 : 1;

  return { field, direction };
};

export const advancedSubscriptionSearch = async (userId, query, filters = {}) => {
  const {
    category,
    priceRange,
    status,
    renewalDate,
    sortBy = "name",
    sortOrder = "asc",
    page = 1,
    limit = 20,
  } = filters;

  const normalizedPage = parsePositiveNumber(page, 1);
  const normalizedLimit = parsePositiveNumber(limit, 20);

  const matchStage = {
    user: new mongoose.Types.ObjectId(userId),
  };

  if (query) {
    matchStage.$text = { $search: query };
  }

  if (Array.isArray(category) && category.length > 0) {
    matchStage.category = { $in: category };
  }

  if (Array.isArray(status) && status.length > 0) {
    matchStage.status = { $in: status };
  }

  if (priceRange) {
    const { min, max } = priceRange;
    const priceQuery = {};

    if (min !== undefined && min !== "") {
      priceQuery.$gte = Number(min);
    }
    if (max !== undefined && max !== "") {
      priceQuery.$lte = Number(max);
    }

    if (Object.keys(priceQuery).length > 0) {
      matchStage.price = priceQuery;
    }
  }

  if (renewalDate?.start || renewalDate?.end) {
    const dateQuery = {};

    if (renewalDate.start) {
      dateQuery.$gte = new Date(renewalDate.start);
    }
    if (renewalDate.end) {
      dateQuery.$lte = new Date(renewalDate.end);
    }

    matchStage.renewalDate = dateQuery;
  }

  const pipeline = [{ $match: matchStage }];

  if (query) {
    pipeline.push({ $addFields: { textScore: { $meta: "textScore" } } });
  }

  const { field, direction } = sanitizeSort(sortBy, sortOrder, Boolean(query));

  const sortStage =
    field === "textScore"
      ? { $sort: { textScore: { $meta: "textScore" }, name: 1 } }
      : { $sort: { [field]: direction, name: 1 } };

  const projection = {
    _id: 1,
    name: 1,
    category: 1,
    price: 1,
    status: 1,
    renewalDate: 1,
    frequency: 1,
    currency: 1,
    description: 1,
    createdAt: 1,
    updatedAt: 1,
  };

  if (query) {
    projection.score = "$textScore";
  }

  pipeline.push({
    $facet: {
      results: [
        sortStage,
        { $skip: (normalizedPage - 1) * normalizedLimit },
        { $limit: normalizedLimit },
        { $project: projection },
      ],
      totalCount: [{ $count: "count" }],
      categoryBreakdown: [
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            total: { $sum: "$price" },
          },
        },
        { $sort: { count: -1 } },
      ],
      priceStats: [
        {
          $group: {
            _id: null,
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
            avgPrice: { $avg: "$price" },
          },
        },
      ],
    },
  });

  const [aggregated = {}] = await Subscription.aggregate(pipeline);

  const total = aggregated.totalCount?.[0]?.count ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / normalizedLimit) : 1;

  return {
    results: aggregated.results ?? [],
    totalCount: total,
    facets: {
      categories: aggregated.categoryBreakdown ?? [],
      price: aggregated.priceStats?.[0] ?? null,
    },
    meta: {
      page: normalizedPage,
      limit: normalizedLimit,
      totalPages,
      query: query ?? "",
      sortBy,
      sortOrder,
    },
  };
};

export const getSubscriptionSuggestions = async (userId, query) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  return Subscription.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        $text: { $search: query },
      },
    },
    {
      $addFields: {
        textScore: { $meta: "textScore" },
      },
    },
    {
      $project: {
        name: 1,
        category: 1,
        price: 1,
        status: 1,
        renewalDate: 1,
        score: "$textScore",
      },
    },
    { $sort: { textScore: { $meta: "textScore" }, name: 1 } },
    { $limit: 5 },
  ]);
};

export const recordSearchHistory = async (userId, query, filters, resultsCount) => {
  try {
    await SearchHistory.create({
      user: userId,
      query,
      filters,
      resultsCount,
      context: "subscriptions",
    });
  } catch (error) {
    console.error("Failed to record search history", error);
  }
};

export const getPopularSearches = async (userId, limit = 5) => {
  return SearchHistory.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        context: "subscriptions",
        query: { $nin: [null, ""] },
      },
    },
    {
      $group: {
        _id: "$query",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
};
