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

  buildFallbackResponse({ intent, userContext, knowledgeBase }) {
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
