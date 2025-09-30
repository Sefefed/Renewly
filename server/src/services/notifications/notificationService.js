import Notification from "../../models/notificationModel.js";

const DEFAULT_LIMIT = 20;

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount) || 0);

export const createNotification = async (userId, notificationData) => {
  const notification = new Notification({
    userId,
    ...notificationData,
  });

  return notification.save();
};

export const getUserNotifications = async (
  userId,
  { limit = DEFAULT_LIMIT, page = 1, unreadOnly = false } = {}
) => {
  const parsedLimit = Math.min(Math.max(Number(limit) || DEFAULT_LIMIT, 1), 50);
  const parsedPage = Math.max(Number(page) || 1, 1);

  const query = { userId };
  if (unreadOnly) {
    query.isRead = false;
  }

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parsedLimit)
      .skip((parsedPage - 1) * parsedLimit),
    Notification.countDocuments(query),
  ]);

  return {
    notifications,
    total,
    page: parsedPage,
    totalPages: Math.ceil(total / parsedLimit) || 1,
  };
};

export const markNotificationAsRead = async (notificationId, userId) =>
  Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );

export const markAllNotificationsAsRead = async (userId) =>
  Notification.updateMany({ userId, isRead: false }, { isRead: true });

export const deleteNotification = async (notificationId, userId) =>
  Notification.findOneAndDelete({ _id: notificationId, userId });

export const getUnreadNotificationCount = async (userId) =>
  Notification.countDocuments({ userId, isRead: false });

export const createRenewalReminder = async (
  userId,
  subscription,
  daysUntilRenewal
) => {
  const messages = {
    1: `"${subscription.name}" renews tomorrow for ${formatCurrency(
      subscription.price
    )}`,
    3: `"${subscription.name}" renews in 3 days for ${formatCurrency(
      subscription.price
    )}`,
    7: `"${subscription.name}" renews in 7 days for ${formatCurrency(
      subscription.price
    )}`,
  };

  return createNotification(userId, {
    type: "renewal",
    title: "Upcoming Renewal",
    message: messages[daysUntilRenewal] || `"${subscription.name}" renews soon`,
    data: {
      subscriptionId: subscription._id,
      amount: subscription.price,
      date: subscription.renewalDate,
    },
    priority: daysUntilRenewal <= 3 ? "high" : "medium",
  });
};

export const createBudgetAlert = async (
  userId,
  category,
  spent,
  limit,
  { period, context, threshold } = {}
) => {
  if (!limit) {
    return createNotification(userId, {
      type: "budget",
      title: "Budget Alert",
      message: `Spending recorded in ${category}. Set a category limit to receive precise alerts.`,
      data: { category, spent, period, context, threshold },
      priority: "medium",
    });
  }

  const percentage = (Number(spent) / Number(limit)) * 100;
  let priority = "medium";
  let title = "Budget Alert";

  if (percentage >= 100) {
    priority = "urgent";
    title = "Budget Exceeded!";
  } else if (percentage >= 90) {
    priority = "high";
    title = "Budget Warning";
  }

  return createNotification(userId, {
    type: "budget",
    title,
    message: `You've spent ${formatCurrency(spent)} of ${formatCurrency(
      limit
    )} in ${category} (${percentage.toFixed(1)}%)`,
    data: { category, spent, limit, percentage, period, context, threshold },
    priority,
  });
};

export const createBillReminder = async (
  userId,
  bill,
  { daysUntilDue, overdueByDays } = {}
) => {
  const isOverdue = typeof overdueByDays === "number" && overdueByDays > 0;
  const isUpcoming = typeof daysUntilDue === "number";

  const priority = isOverdue
    ? "urgent"
    : isUpcoming && daysUntilDue <= 2
    ? "high"
    : "medium";

  let title = "Upcoming Bill";
  let message = `${bill.name} has a payment of ${formatCurrency(
    bill.amount
  )} due on ${new Date(bill.dueDate).toLocaleDateString()}`;

  if (isOverdue) {
    title = "Bill Overdue";
    message = `${bill.name} is overdue by ${overdueByDays} day${
      overdueByDays === 1 ? "" : "s"
    }. Amount due: ${formatCurrency(bill.amount)}`;
  } else if (isUpcoming && daysUntilDue === 0) {
    title = "Bill Due Today";
    message = `${bill.name} is due today for ${formatCurrency(bill.amount)}`;
  } else if (isUpcoming && daysUntilDue === 1) {
    message = `${bill.name} is due tomorrow for ${formatCurrency(bill.amount)}`;
  } else if (isUpcoming && daysUntilDue > 1) {
    message = `${bill.name} is due in ${daysUntilDue} days for ${formatCurrency(
      bill.amount
    )}`;
  }

  return createNotification(userId, {
    type: "bill",
    title,
    message,
    data: {
      billId: bill._id,
      amount: bill.amount,
      date: bill.dueDate,
      category: bill.category,
      daysUntilDue,
      overdueByDays,
    },
    priority,
  });
};

export const createSavingsRecommendation = async (
  userId,
  subscription,
  potentialSavings,
  { period, context } = {}
) =>
  createNotification(userId, {
    type: "recommendation",
    title: "Savings Opportunity",
    message: `You could save ${formatCurrency(
      potentialSavings
    )} by canceling "${subscription.name}"`,
    data: {
      subscriptionId: subscription._id,
      potentialSavings,
      period,
      context,
    },
    priority: "low",
  });

export default {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount,
  createRenewalReminder,
  createBudgetAlert,
  createBillReminder,
  createSavingsRecommendation,
};
