import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
} from "../../../utils/formatters";

const MS_IN_DAY = 86_400_000;

export const buildPaymentTimeline = (bill, defaultCurrency) => {
  if (!bill) return [];

  const items = [];
  const currencyCode = bill.currency || defaultCurrency;

  if (bill.dueDate) {
    items.push({
      id: `${bill._id ?? "bill"}-due`,
      primary: formatDate(bill.dueDate),
      secondary: formatRelativeDate(bill.dueDate),
      value: bill.status === "overdue" ? "Overdue" : "Scheduled",
    });
  }

  if (bill.paidDate) {
    items.push({
      id: `${bill._id ?? "bill"}-paid`,
      primary: formatDate(bill.paidDate),
      secondary: `Paid ${formatRelativeDate(bill.paidDate)}`,
      value: "Last payment",
    });
  }

  items.push({
    id: `${bill._id ?? "bill"}-amount`,
    primary: "Cycle amount",
    secondary: bill.category ? `Category · ${bill.category}` : null,
    value: formatCurrency(bill.amount, currencyCode),
  });

  items.push({
    id: `${bill._id ?? "bill"}-automation`,
    primary: bill.paymentMethod || "Funding method pending",
    secondary: bill.autoPay
      ? "Auto pay active—confirm the funding account has capacity"
      : "Manual payment required—consider enabling auto pay to avoid fees",
    value: bill.autoPay ? "Auto pay" : "Manual",
  });

  return items;
};

export const computeRiskProfile = (bill, paymentTimeline, defaultCurrency) => {
  if (!bill) return null;

  const now = Date.now();
  const nextDueDate = bill.dueDate ? new Date(bill.dueDate) : null;
  const currencyCode = bill.currency || defaultCurrency;

  let score = 35;

  if (bill.status === "overdue") {
    score += 30;
  } else if (bill.status === "pending") {
    score += 10;
  }

  if (!bill.autoPay) {
    score += 15;
  }

  if (bill.amount >= 250) {
    score += 20;
  } else if (bill.amount >= 120) {
    score += 12;
  } else if (bill.amount >= 60) {
    score += 6;
  }

  if (nextDueDate && !Number.isNaN(nextDueDate.getTime())) {
    const diffDays = Math.round((nextDueDate.getTime() - now) / MS_IN_DAY);

    if (diffDays <= 0) {
      score += 25;
    } else if (diffDays <= 3) {
      score += 18;
    } else if (diffDays <= 7) {
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
  const accent = score >= 70 ? "#f97316" : score >= 45 ? "#fcd34d" : "#34d399";

  const narrative =
    level === "Attention needed"
      ? "This bill is in a risky window. Confirm payment status or accelerate repayment to avoid fees."
      : level === "Monitor closely"
      ? "Keep an eye on due timing and automation settings so nothing slips through."
      : "No urgent risks detected. Maintain your current cadence and keep monitoring.";

  const signals = [];

  if (nextDueDate && !Number.isNaN(nextDueDate.getTime())) {
    const diffDays = Math.round((nextDueDate.getTime() - now) / MS_IN_DAY);
    signals.push({
      label: "Due window",
      detail:
        diffDays >= 0
          ? `Next payment in ${diffDays} day${
              diffDays === 1 ? "" : "s"
            } (${formatDate(nextDueDate)}).`
          : `Past due by ${Math.abs(diffDays)} day${
              Math.abs(diffDays) === 1 ? "" : "s"
            } (${formatDate(nextDueDate)}).`,
    });
  } else {
    signals.push({
      label: "Due window",
      detail: "No due date stored. Add one to unlock proactive reminders.",
    });
  }

  signals.push({
    label: "Automation",
    detail: bill.autoPay
      ? "Auto pay enabled—verify the funding account has capacity."
      : "Manual payment required—set a reminder or enable auto pay to stay protected.",
  });

  signals.push({
    label: "Spend impact",
    detail: `This cycle’s amount is ${formatCurrency(
      bill.amount,
      currencyCode
    )}.`,
  });

  const timelineNote = paymentTimeline.find((item) => item.id.includes("paid"));

  if (timelineNote) {
    signals.push({
      label: "Recent activity",
      detail:
        timelineNote.secondary || "Track last payment to keep history fresh.",
    });
  }

  return { score, level, accent, narrative, signals };
};
