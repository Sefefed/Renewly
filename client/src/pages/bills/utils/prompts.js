import { formatCurrency, formatDate } from "../../../utils/formatters";

const buildLensText = (angle) =>
  angle
    ? `${angle.label}. ${angle.prompt}`
    : "Default briefing – emphasize the most actionable findings you see.";

export const buildBillPrompt = ({ bill, defaultCurrency, angle, followUp }) => {
  if (!bill) return "";

  const formattedDueDate = bill.dueDate
    ? formatDate(bill.dueDate)
    : "Unknown due date";

  const basePrompt = `You are Renewly's embedded finance co-pilot. Generate a thorough, user-friendly briefing for the bill below using ONLY the data supplied. Respond with exactly four short paragraphs in this order:
1. **Payment status & urgency** – two to three sentences on current status, due timing, payment method, and any gaps in the data.
2. **Budget & variance lens** – two to three sentences on amount impact, cadence, historical payment signals, and whether the trend looks healthy.
3. **Action checklist** – two to three sentences with concrete, bill-specific actions or safeguards. If data is missing, surface what needs verification instead of guessing.
4. **Clarifications & watchpoints** – two to three sentences highlighting assumptions, fields needing updates, and what indicators to monitor next.

Keep the tone supportive yet direct, reference only this bill, avoid lists or bullet formatting, and do not compare to other bills.

Current analysis lens: ${buildLensText(angle)}
Unique briefing token: ${`${Date.now()}-${angle?.id ?? "core"}`}.

Bill: ${bill.name}. Amount: ${formatCurrency(
    bill.amount,
    bill.currency || defaultCurrency
  )}. Status: ${bill.status}. Due date: ${formattedDueDate}. Payment method: ${
    bill.paymentMethod || "Unspecified"
  }. Auto pay: ${bill.autoPay ? "enabled" : "disabled"}. Category: ${
    bill.category || "Uncategorized"
  }. Notes: ${bill.notes || "None provided"}. Last paid: ${
    bill.paidDate ? formatDate(bill.paidDate) : "Unknown"
  }.`;

  if (followUp) {
    return `${basePrompt} User follow-up question: ${followUp}`;
  }

  return basePrompt;
};
