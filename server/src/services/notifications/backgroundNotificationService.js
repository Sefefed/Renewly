import cron from "node-cron";
import Subscription from "../../models/subscriptionModel.js";
import Budget from "../../models/budgetModel.js";
import Bill from "../../models/billModel.js";
import Notification from "../../models/notificationModel.js";
import {
  createRenewalReminder,
  createBudgetAlert,
  createBillReminder,
  createSavingsRecommendation,
} from "./notificationService.js";
import { buildCategorySpending } from "../insights/helpers/categoryMetrics.js";
import { normalizeSubscriptionAmount } from "../insights/helpers/subscriptionMetrics.js";

class BackgroundNotificationService {
  constructor() {
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      return;
    }

    cron.schedule("0 8 * * *", () => {
      this.checkUpcomingRenewals().catch((error) =>
        console.error("Error checking upcoming renewals:", error)
      );
    });

    cron.schedule("15 8 * * *", () => {
      this.checkUpcomingBills().catch((error) =>
        console.error("Error checking upcoming bills:", error)
      );
    });

    cron.schedule("0 9 * * *", () => {
      this.checkBudgetAlerts().catch((error) =>
        console.error("Error checking budget alerts:", error)
      );
    });

    cron.schedule("0 10 * * 1", () => {
      this.checkSavingsOpportunities().catch((error) =>
        console.error("Error checking savings opportunities:", error)
      );
    });

    cron.schedule("0 3 * * 0", () => {
      this.cleanupOldNotifications().catch((error) =>
        console.error("Error cleaning up notifications:", error)
      );
    });

    this.isRunning = true;
    console.log("Background notification service started");

    this.checkUpcomingRenewals().catch((error) =>
      console.error("Initial renewal check failed:", error)
    );
    this.checkUpcomingBills().catch((error) =>
      console.error("Initial bill check failed:", error)
    );
    this.checkBudgetAlerts().catch((error) =>
      console.error("Initial budget check failed:", error)
    );
    this.checkSavingsOpportunities().catch((error) =>
      console.error("Initial savings check failed:", error)
    );
  }

  async checkUpcomingRenewals() {
    const today = new Date();
    const leadTimes = [1, 3, 7];

    for (const days of leadTimes) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + days);

      const startOfDay = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
        0,
        0,
        0,
        0
      );
      const endOfDay = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
        23,
        59,
        59,
        999
      );

      const subscriptions = await Subscription.find({
        renewalDate: { $gte: startOfDay, $lte: endOfDay },
        status: "active",
      }).populate("user");

      await Promise.all(
        subscriptions.map((subscription) =>
          createRenewalReminder(subscription.user._id, subscription, days)
        )
      );
    }
  }

  async checkUpcomingBills() {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
      0
    );

    const leadTimes = [0, 2, 5];

    for (const days of leadTimes) {
      const windowDate = new Date(today);
      windowDate.setDate(today.getDate() + days);

      const windowStart = new Date(
        windowDate.getFullYear(),
        windowDate.getMonth(),
        windowDate.getDate(),
        0,
        0,
        0,
        0
      );
      const windowEnd = new Date(
        windowDate.getFullYear(),
        windowDate.getMonth(),
        windowDate.getDate(),
        23,
        59,
        59,
        999
      );

      const bills = await Bill.find({
        dueDate: { $gte: windowStart, $lte: windowEnd },
        status: { $in: ["pending", "overdue"] },
      }).populate("user");

      await Promise.all(
        bills.map(async (bill) => {
          const exists = await Notification.exists({
            userId: bill.user._id,
            type: "bill",
            "data.billId": bill._id,
            "data.daysUntilDue": days,
          });

          if (!exists) {
            await createBillReminder(bill.user._id, bill, {
              daysUntilDue: days,
            });
          }
        })
      );
    }

    const overdueBills = await Bill.find({
      dueDate: { $lt: startOfToday },
      status: "overdue",
    }).populate("user");

    const reminderDays = new Set([1, 3, 7, 14, 30]);

    await Promise.all(
      overdueBills.map(async (bill) => {
        const diffTime =
          startOfToday.getTime() - new Date(bill.dueDate).setHours(0, 0, 0, 0);
        const overdueByDays = Math.max(
          1,
          Math.ceil(diffTime / (24 * 60 * 60 * 1000))
        );

        if (!reminderDays.has(overdueByDays)) {
          return;
        }

        const exists = await Notification.exists({
          userId: bill.user._id,
          type: "bill",
          "data.billId": bill._id,
          "data.overdueByDays": overdueByDays,
        });

        if (!exists) {
          await createBillReminder(bill.user._id, bill, { overdueByDays });
        }
      })
    );
  }

  async checkBudgetAlerts() {
    const today = new Date();
    const periodStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
      0,
      0,
      0,
      0
    );
    const periodEnd = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    const periodKey = `${periodStart.getFullYear()}-${String(
      periodStart.getMonth() + 1
    ).padStart(2, "0")}`;

    const budgets = await Budget.find({});

    await Promise.all(
      budgets.map(async (budget) => {
        const userId = budget.user;

        const [subscriptions, bills] = await Promise.all([
          Subscription.find({ user: userId, status: "active" }),
          Bill.find({
            user: userId,
            dueDate: { $gte: periodStart, $lte: periodEnd },
          }),
        ]);

        if (!subscriptions.length && !bills.length) {
          return;
        }

        const categorySpending = buildCategorySpending(subscriptions, bills);
        const totalMonthlySpend = Object.values(categorySpending).reduce(
          (sum, amount) => sum + amount,
          0
        );

        const monthlyLimit = budget.monthlyLimit || 0;
        const threshold = budget.notifications?.threshold ?? 80;

        if (
          monthlyLimit > 0 &&
          totalMonthlySpend >= (monthlyLimit * threshold) / 100
        ) {
          const exists = await Notification.exists({
            userId,
            type: "budget",
            "data.context": "overall",
            "data.period": periodKey,
          });

          if (!exists) {
            await createBudgetAlert(
              userId,
              "overall budget",
              totalMonthlySpend,
              monthlyLimit,
              {
                period: periodKey,
                context: "overall",
                threshold,
              }
            );
          }
        }

        const categoryLimits = budget.categoryLimits || {};

        await Promise.all(
          Object.entries(categoryLimits).map(async ([category, limit]) => {
            if (!limit) {
              return;
            }

            const spent = categorySpending[category] || 0;
            if (spent === 0) {
              return;
            }

            if (spent >= (limit * threshold) / 100) {
              const exists = await Notification.exists({
                userId,
                type: "budget",
                "data.context": `category:${category}`,
                "data.period": periodKey,
              });

              if (!exists) {
                await createBudgetAlert(userId, category, spent, limit, {
                  period: periodKey,
                  context: `category:${category}`,
                  threshold,
                });
              }
            }
          })
        );
      })
    );
  }

  async checkSavingsOpportunities() {
    const subscriptions = await Subscription.find({ status: "active" });
    if (!subscriptions.length) {
      return;
    }

    const today = new Date();
    const periodKey = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}`;

    const byUser = new Map();

    subscriptions.forEach((subscription) => {
      const userId = subscription.user.toString();
      if (!byUser.has(userId)) {
        byUser.set(userId, []);
      }
      byUser.get(userId).push(subscription);
    });

    await Promise.all(
      Array.from(byUser.entries()).map(async ([, userSubscriptions]) => {
        const userId = userSubscriptions[0].user;
        const byCategory = new Map();

        userSubscriptions.forEach((subscription) => {
          const category = subscription.category || "other";
          const monthlyCost = normalizeSubscriptionAmount(subscription);

          if (!byCategory.has(category)) {
            byCategory.set(category, []);
          }

          byCategory.get(category).push({ subscription, monthlyCost });
        });

        await Promise.all(
          Array.from(byCategory.entries()).map(async ([category, entries]) => {
            if (entries.length < 2) {
              return;
            }

            const total = entries.reduce(
              (sum, entry) => sum + entry.monthlyCost,
              0
            );
            const sorted = entries.sort(
              (a, b) => b.monthlyCost - a.monthlyCost
            );
            const cheapest = sorted[sorted.length - 1];
            const potentialSavings = total - cheapest.monthlyCost;

            if (potentialSavings < 5) {
              return;
            }

            const target = sorted[0].subscription;

            const exists = await Notification.exists({
              userId,
              type: "recommendation",
              "data.subscriptionId": target._id,
              "data.context": `overlap:${category}`,
              "data.period": periodKey,
            });

            if (!exists) {
              await createSavingsRecommendation(
                userId,
                target,
                potentialSavings,
                {
                  period: periodKey,
                  context: `overlap:${category}`,
                }
              );
            }
          })
        );
      })
    );
  }

  async cleanupOldNotifications() {
    // TTL index on expiresAt handles cleanup automatically; hook provided for future custom logic.
    console.log("Notification cleanup completed");
  }
}

const backgroundNotificationService = new BackgroundNotificationService();

export default backgroundNotificationService;
export const notificationBackgroundService = backgroundNotificationService;
