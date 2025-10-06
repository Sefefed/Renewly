import { formatCurrency, formatDate } from "../../../utils/formatters";
import { FREQUENCY_LABELS } from "../constants/frequency";

const buildLensText = (angle) =>
  angle
    ? `${angle.label}. ${angle.prompt}`
    : "Default briefing – feel free to surface any high-leverage insight.";

export const buildSubscriptionPrompt = ({
  subscription,
  defaultCurrency,
  angle,
  followUp,
}) => {
  if (!subscription) return "";

  const frequencyLabel =
    FREQUENCY_LABELS[subscription.frequency] ?? subscription.frequency;

  const base = `You are Renewly's embedded finance co-pilot. Create a thorough, user-friendly briefing for the subscription below using ONLY the data supplied. Respond with exactly four short paragraphs in this order:
1. **Status & Renewal Outlook** – two to three sentences about current status, renewal timing, payment method, and any gaps in the data.
2. **Spend & Utilization Lens** – two to three sentences about cost cadence, category impact, usage notes, and whether the spend trajectory looks healthy.
3. **Actionable Moves** – two to three sentences describing concrete, subscription-specific actions or safeguards. If data is missing, call it out and suggest how to fill the gap instead of guessing.
4. **Clarifications & Watchpoints** – two to three sentences summarizing assumptions, missing fields that need attention, and what signals to monitor next.

Keep the tone supportive yet direct, reference only this subscription, avoid lists or bullet formatting, and do not compare to other services.

Current analysis lens: ${buildLensText(angle)}
Unique briefing token: ${`${Date.now()}-${angle?.id ?? "core"}`}.

Subscription: ${subscription.name}. Price: ${formatCurrency(
    subscription.price,
    subscription.currency || defaultCurrency
  )} (${frequencyLabel}). Status: ${subscription.status}. Renewal date: ${
    subscription.renewalDate ? formatDate(subscription.renewalDate) : "Unknown"
  }. Payment method: ${
    subscription.paymentMethod || "Unspecified"
  }. Category: ${subscription.category || "Uncategorized"}. Description: ${
    subscription.description || "No description provided"
  }. Notes: ${subscription.notes || "None provided"}.`;

  if (followUp) {
    return `${base} The user specifically wants to know: ${followUp}`;
  }

  return base;
};
