import Subscription from "../../models/subscriptionModel.js";
import Bill from "../../models/billModel.js";
import Budget from "../../models/budgetModel.js";

export const fetchActiveInsightsData = async (userId) => {
  const [subscriptions, bills, budget] = await Promise.all([
    Subscription.find({ user: userId, status: "active" }),
    Bill.find({ user: userId }),
    Budget.findOne({ user: userId }),
  ]);

  return { subscriptions, bills, budget };
};

export const fetchFullFinancialData = async (userId) => {
  const [subscriptions, bills] = await Promise.all([
    Subscription.find({ user: userId }),
    Bill.find({ user: userId }),
  ]);

  return { subscriptions, bills };
};
