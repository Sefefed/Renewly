import { formatCurrency, formatDate } from "../../../utils/formatters";
import {
  FREQUENCY_LABELS,
  FREQUENCY_TO_MONTHLY_MULTIPLIER,
} from "../constants/frequency";

const MS_IN_DAY = 86_400_000;

export const calculateMonthlyPrice = (subscription) => {
  if (!subscription?.price) return null;
  const multiplier =
    FREQUENCY_TO_MONTHLY_MULTIPLIER[subscription.frequency] ?? 1;
  return subscription.price * multiplier;
};

export const buildPaymentSchedule = (subscription, defaultCurrency) => {
  if (!subscription?.renewalDate) return [];

  const currencyCode = subscription.currency || defaultCurrency;
  const schedule = [];
  const now = Date.now();
  let cursor = new Date(subscription.renewalDate);

  if (Number.isNaN(cursor.getTime())) {
    return [];
  }

  while (cursor.getTime() < now) {
    const nextCursor = addInterval(cursor, subscription.frequency);
    if (!nextCursor) return [];
    cursor = nextCursor;
  }

  for (let index = 0; index < 3; index += 1) {
    schedule.push({
      id: `${subscription._id ?? "subscription"}-payment-${index}`,
      date: cursor.toISOString(),
      formattedDate: formatDate(cursor),
      relative: formatRelativeToToday(cursor),
      amount: formatCurrency(subscription.price, currencyCode),
    });

    const next = addInterval(cursor, subscription.frequency);
    if (!next) break;
    cursor = next;
  }

  return schedule;
};

const addInterval = (date, frequency) => {
  const next = new Date(date.getTime());

  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      return null;
  }

  return next;
};

const formatRelativeToToday = (date) => {
  const diffDays = Math.round((date.getTime() - Date.now()) / MS_IN_DAY);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffDays) >= 14) {
    const diffWeeks = Math.round(diffDays / 7);
    return formatter.format(diffWeeks, "week");
  }

  return formatter.format(diffDays, "day");
};

export const computeRiskProfile = (
  subscription,
  paymentSchedule,
  monthlyPrice,
  defaultCurrency
) => {
  if (!subscription) return null;

  const currencyCode = subscription.currency || defaultCurrency;
  const nextPaymentDate = paymentSchedule[0]?.date
    ? new Date(paymentSchedule[0].date)
    : subscription.renewalDate
    ? new Date(subscription.renewalDate)
    : null;

  let score = 35;

  if (subscription.status !== "active") {
    score += 25;
  }

  if (subscription.price >= 150) {
    score += 25;
  } else if (subscription.price >= 80) {
    score += 15;
  } else if (subscription.price >= 40) {
    score += 8;
  }

  if (typeof monthlyPrice === "number" && monthlyPrice > 80) {
    score += 10;
  }

  if (nextPaymentDate && !Number.isNaN(nextPaymentDate.getTime())) {
    const diffDays = Math.round(
      (nextPaymentDate.getTime() - Date.now()) / MS_IN_DAY
    );

    if (diffDays < 0) {
      score += 15;
    } else if (diffDays <= 7) {
      score += 20;
    } else if (diffDays <= 14) {
      score += 12;
    }
  } else {
    score += 5;
  }

  score = Math.max(5, Math.min(95, Math.round(score)));

  const level =
    score >= 70
      ? "Attention needed"
      : score >= 45
      ? "Monitor closely"
      : "Steady";
  const accent = score >= 70 ? "#f97316" : score >= 45 ? "#38bdf8" : "#34d399";

  const narrative =
    level === "Attention needed"
      ? "This subscription is trending toward higher spend soon. Review usage or negotiate before the next renewal."
      : level === "Monitor closely"
      ? "Keep an eye on utilization and payment cadence to stay ahead of potential surprises."
      : "No immediate risks detected. Maintain current strategy and keep monitoring engagement.";

  const signals = [];

  if (nextPaymentDate && !Number.isNaN(nextPaymentDate.getTime())) {
    const diffDays = Math.round(
      (nextPaymentDate.getTime() - Date.now()) / MS_IN_DAY
    );
    signals.push({
      label: "Renewal window",
      detail:
        diffDays >= 0
          ? `Next charge in ${diffDays} day${
              diffDays === 1 ? "" : "s"
            } (${formatDate(nextPaymentDate)}).`
          : `Last charged ${Math.abs(diffDays)} day${
              Math.abs(diffDays) === 1 ? "" : "s"
            } ago.`,
    });
  } else {
    signals.push({
      label: "Renewal window",
      detail: "No renewal date stored. Set one to unlock proactive reminders.",
    });
  }

  signals.push({
    label: "Spend intensity",
    detail: `Currently budgeted at ${formatCurrency(
      subscription.price,
      currencyCode
    )} per ${
      FREQUENCY_LABELS[subscription.frequency] ?? subscription.frequency
    }.`,
  });

  signals.push({
    label: "Status",
    detail: `Marked as ${subscription.status}.`,
  });

  return { score, level, accent, narrative, signals };
};
