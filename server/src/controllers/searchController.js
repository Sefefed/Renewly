import {
  advancedSubscriptionSearch,
  getSubscriptionSuggestions,
  getPopularSearches,
  recordSearchHistory,
} from "../services/search/searchService.js";

const parseArrayQuery = (value) => {
  if (!value) return undefined;
  return value.split(",").map((item) => item.trim()).filter(Boolean);
};

export const searchSubscriptions = async (req, res, next) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      page = 1,
      limit = 20,
    } = req.query;

    const filters = {
      sortBy,
      sortOrder,
      page: Number(page),
      limit: Number(limit),
    };

    const categories = parseArrayQuery(category);
    if (categories) {
      filters.category = categories;
    }

    const statuses = parseArrayQuery(status);
    if (statuses) {
      filters.status = statuses;
    }

    if (minPrice || maxPrice) {
      filters.priceRange = {
        min: minPrice !== undefined ? minPrice : undefined,
        max: maxPrice !== undefined ? maxPrice : undefined,
      };
    }

    if (startDate || endDate) {
      filters.renewalDate = {
        start: startDate || undefined,
        end: endDate || undefined,
      };
    }

    const results = await advancedSubscriptionSearch(req.user._id, q, filters);

    await recordSearchHistory(
      req.user._id,
      q ?? "",
      filters,
      results.totalCount
    );

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

export const subscriptionSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    const suggestions = await getSubscriptionSuggestions(req.user._id, q ?? "");
    res.json({ success: true, data: suggestions });
  } catch (error) {
    next(error);
  }
};

export const popularSubscriptionSearches = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const parsedLimit = Number(limit) || 5;
    const popular = await getPopularSearches(req.user._id, parsedLimit);
    res.json({ success: true, data: popular });
  } catch (error) {
    next(error);
  }
};
