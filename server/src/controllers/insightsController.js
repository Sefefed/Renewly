import {
  buildEnhancedInsights,
  buildStandardInsights,
  fetchActiveInsightsData,
  fetchFullFinancialData,
} from "../services/insights/index.js";

export const getInsights = async (req, res, next) => {
  try {
    const { subscriptions, bills, budget } = await fetchActiveInsightsData(
      req.user._id
    );
    const data = buildStandardInsights(subscriptions, bills, budget);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getEnhancedInsights = async (req, res, next) => {
  try {
    const { timeRange = "monthly" } = req.query;
    const { subscriptions, bills } = await fetchFullFinancialData(req.user._id);
    const data = buildEnhancedInsights(subscriptions, bills, timeRange);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
