import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  GEMINI_API_KEY,
  LLM_PROVIDER,
  AI_ASSISTANT_MODEL,
} from "../../config/env.js";

const DEFAULT_MODEL = AI_ASSISTANT_MODEL || "gemini-2.5-pro";

const sanitize = (value) => {
  if (!value) return "N/A";
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
      .join("\n");
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

class GeminiProvider {
  constructor() {
    this.enabled = Boolean(GEMINI_API_KEY);
    if (this.enabled) {
      this.client = new GoogleGenerativeAI(GEMINI_API_KEY);
      this.model = this.client.getGenerativeModel({ model: DEFAULT_MODEL });
    }
  }

  async generateResponse(payload) {
    if (!this.enabled) {
      return null;
    }

    const {
      intent,
      query,
      userContext,
      persona,
      knowledgeBase,
      conversationHistory = [],
    } = payload;

    const historyText = conversationHistory
      .map((entry) => `${entry.role.toUpperCase()}: ${entry.content}`)
      .join("\n");

    const knowledgeSection = sanitize(knowledgeBase).slice(0, 6000);

    const prompt = [
      "You are Renewly's friendly AI financial assistant. Always answer using clear, concise language and focus on practical next steps.",
      `User intent: ${intent.intent} (confidence ${(
        intent.confidence * 100
      ).toFixed(1)}%).`,
      `User query: ${query}.`,
      `User persona: ${sanitize(persona)}.`,
      `Financial context: ${sanitize(userContext)}.`,
      "Renewly data snapshot (authoritative source):",
      knowledgeSection || "No additional snapshot provided.",
      "Recent conversation:",
      historyText || "(no prior messages)",
      "Respond with:",
      "1. A conversational paragraph that directly answers the question.",
      "2. Optional bullet points for specific recommendations.",
      "3. Keep the tone supportive and proactive.",
      "4. Limit the response to 180 words.",
      "5. Only use the information in the data snapshot and financial context. If the question cannot be answered with the provided data, explain what is missing and suggest the closest actionable insight instead of inventing numbers.",
    ].join("\n\n");

    try {
      const result = await this.model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      });

      const text = result?.response?.text();
      return text ?? null;
    } catch (error) {
      console.error("Gemini generation failed", error);
      return null;
    }
  }
}

export class FinancialLLMProvider {
  constructor() {
    const provider = (LLM_PROVIDER || "gemini").toLowerCase();
    this.provider = provider;
    if (provider === "gemini") {
      this.client = new GeminiProvider();
    } else {
      this.client = new GeminiProvider();
    }
  }

  async generate(payload) {
    const response = await this.client.generateResponse(payload);
    if (response) {
      return response;
    }

    return this.buildFallbackResponse(payload);
  }

  buildFallbackResponse(payload = {}) {
    const { intent, userContext, knowledgeBase, context = {} } = payload;
    const { entityType, entity } = context ?? {};

    if (entityType === "subscription" && entity) {
      const baseCurrency =
        entity.currency || userContext?.baseCurrency || "USD";

      const formatAmount = (value) => {
        try {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: baseCurrency,
          }).format(value ?? 0);
        } catch {
          const numeric = Number(value ?? 0);
          return Number.isFinite(numeric) ? `$${numeric.toFixed(2)}` : "$0.00";
        }
      };

      const frequencyCopy = {
        daily: "day",
        weekly: "week",
        monthly: "month",
        yearly: "year",
      };

      const renewalDate = entity.renewalDate
        ? new Date(entity.renewalDate).toLocaleDateString()
        : "Not scheduled";
      const startDate = entity.startDate
        ? new Date(entity.startDate).toLocaleDateString()
        : null;

      const cadenceLabel = frequencyCopy[entity.frequency] || "billing cycle";
      const statusLabel = entity.status || "unknown";
      const paymentMethod = entity.paymentMethod || "an unspecified method";
      const category = entity.category || "uncategorized";

      const statusParagraphParts = [
        `${entity.name} is marked as ${statusLabel}.`,
        `The next renewal is ${renewalDate} and charges through ${paymentMethod}.`,
      ];
      if (startDate) {
        statusParagraphParts.push(`It has been active since ${startDate}.`);
      }
      if (!entity.renewalDate) {
        statusParagraphParts.push(
          "No renewal date is stored yet, so add one to unlock proactive reminders."
        );
      }

      const spendParagraphParts = [
        `You currently spend ${formatAmount(
          entity.price
        )} every ${cadenceLabel} in the ${category} category.`,
      ];
      spendParagraphParts.push(
        entity.price
          ? `Based on this cadence, the normalized monthly cost is roughly ${formatAmount(
              entity.price
            )}.`
          : "The price is missing, so capture it to monitor spend accurately."
      );
      spendParagraphParts.push(
        entity.description
          ? `Usage notes on record state: "${entity.description}".`
          : "No usage notes have been logged yet."
      );

      const actionsParagraphParts = [];
      actionsParagraphParts.push(
        entity.renewalDate
          ? `Schedule a quick check-in a week before ${renewalDate} to confirm the subscription still earns its keep.`
          : "Add a renewal date so Renewly can surface reminders before charges land."
      );
      actionsParagraphParts.push(
        entity.description
          ? "Review the existing notes and update them if priorities have shifted."
          : "Capture a brief note about why the service is kept to guide future decisions."
      );
      actionsParagraphParts.push(
        `Confirm that ${paymentMethod} is still the preferred payment method and adjust if needed.`
      );

      const clarificationsParagraphParts = [];
      if (!entity.renewalDate) {
        clarificationsParagraphParts.push(
          "Because the renewal date is missing, the assistant cannot schedule proactive reminders yet."
        );
      }
      if (!entity.price) {
        clarificationsParagraphParts.push(
          "Cost data is incomplete, so trend tracking will stay limited until an amount is recorded."
        );
      }
      if (!entity.description) {
        clarificationsParagraphParts.push(
          "Adding usage context will help the assistant distinguish essential versus optional spend."
        );
      }
      clarificationsParagraphParts.push(
        "Monitor upcoming statements for unexpected increases and update this record whenever plan terms shift."
      );

      const paragraphs = [
        statusParagraphParts.join(" "),
        spendParagraphParts.join(" "),
        actionsParagraphParts.join(" "),
        clarificationsParagraphParts.join(" "),
      ];

      return paragraphs.join("\n\n");
    }

    if (entityType === "bill" && entity) {
      const baseCurrency =
        entity.currency || userContext?.baseCurrency || "USD";

      const formatAmount = (value) => {
        try {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: baseCurrency,
          }).format(value ?? 0);
        } catch {
          const numeric = Number(value ?? 0);
          return Number.isFinite(numeric) ? `$${numeric.toFixed(2)}` : "$0.00";
        }
      };

      const formatDate = (value) => {
        if (!value) return null;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return null;
        return date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      };

      const dueDate = formatDate(entity.dueDate) || "Not scheduled";
      const paidDate = formatDate(entity.paidDate);
      const statusLabel = entity.status || "unknown";
      const paymentMethod = entity.paymentMethod || "an unspecified method";
      const category = entity.category || "uncategorized";
      const autoPayCopy = entity.autoPay
        ? "Auto pay is enabled"
        : "Auto pay is disabled";

      const statusParagraphParts = [
        `${entity.name} is marked as ${statusLabel}.`,
        `The next amount is due ${dueDate} and is paid via ${paymentMethod}.`,
      ];

      if (!entity.dueDate) {
        statusParagraphParts.push(
          "No due date is stored yet, so set one to unlock proactive reminders."
        );
      }

      const spendParagraphParts = [
        `This bill is budgeted at ${formatAmount(
          entity.amount
        )} in the ${category} category.`,
        `${autoPayCopy.toLowerCase()} and the last recorded payment ${
          paidDate ? `was on ${paidDate}` : "hasn't been logged yet"
        }.`,
      ];

      const actionsParagraphParts = [
        entity.autoPay
          ? "Double-check the funding account so the automatic payment clears without surprises."
          : "Schedule a manual reminder or consider enabling auto pay to avoid late fees.",
        entity.dueDate
          ? `Plan a quick status review two to three days before ${dueDate} to confirm nothing changed.`
          : "Record the due date to give Renewly enough lead time for alerts.",
        `Verify that ${paymentMethod} is still the best funding path and update it if necessary.`,
      ];

      const clarificationsParagraphParts = [];
      if (!entity.dueDate) {
        clarificationsParagraphParts.push(
          "The assistant can't forecast urgency accurately until a due date is captured."
        );
      }
      if (!entity.amount) {
        clarificationsParagraphParts.push(
          "Amount data is missing, so budget variance tracking will remain limited."
        );
      }
      if (!entity.paymentMethod) {
        clarificationsParagraphParts.push(
          "Adding a payment method will highlight which account experiences the charge."
        );
      }
      clarificationsParagraphParts.push(
        "Watch upcoming statements for rate changes or fees and update this record whenever terms shift."
      );

      const dataParagraphParts = [];
      if (!entity.notes) {
        dataParagraphParts.push(
          "No contextual notes are stored yet. Capture any vendor communications or invoice details to keep the history straight."
        );
      } else {
        dataParagraphParts.push(
          `Current notes mention: "${entity.notes}". Refresh them after each payment so future reviews stay grounded in real activity.`
        );
      }
      dataParagraphParts.push(
        "If supporting documents or receipts exist, attach them in your records so any discrepancies can be resolved quickly."
      );
      dataParagraphParts.push(
        "Confirm contact information for the provider is on file in case a charge dispute or assistance request is needed."
      );

      const paragraphs = [
        statusParagraphParts.join(" "),
        spendParagraphParts.join(" "),
        actionsParagraphParts.join(" "),
        clarificationsParagraphParts.join(" "),
        dataParagraphParts.join(" "),
      ];

      return paragraphs.join("\n\n");
    }

    const formattedSpend = userContext?.monthlySpending
      ? `$${Number(userContext.monthlySpending).toFixed(2)}`
      : "your recent spending";

    const intentCopy = {
      spending: `You're tracking ${formattedSpend}. Look at your top categories to spot where costs are creeping up.`,
      savings: `Focus on the biggest subscriptions first. Cancel or downgrade one high-cost service to free up budget this month.`,
      trends: `Check your trends chart to see whether spending is rising or falling. Consistency week over week is a good sign.`,
      alerts: `Review any high-priority alerts in your dashboard so you can act before renewals hit your account.`,
      comparison: `Compare the highest monthly services side-by-side. Switching to annual plans can unlock quick savings.`,
      general: `Try asking about your top spending categories, ways to save this month, or upcoming renewals.`,
    };

    const key = intent?.intent ?? "general";
    const base = intentCopy[key] || intentCopy.general;
    const contextNote = knowledgeBase
      ? `\n\nAvailable Renewly data:\n${knowledgeBase}`
      : "";
    return `${base}${contextNote}`;
  }
}

const llmProvider = new FinancialLLMProvider();

export default llmProvider;
