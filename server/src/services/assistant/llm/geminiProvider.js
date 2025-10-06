import { GoogleGenerativeAI } from "@google/generative-ai";

import { GEMINI_API_KEY, AI_ASSISTANT_MODEL } from "../../../config/env.js";

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

const buildPrompt = ({
  intent,
  query,
  userContext,
  persona,
  knowledgeBase,
  conversationHistory,
}) => {
  const historyText = (conversationHistory ?? [])
    .map((entry) => `${entry.role.toUpperCase()}: ${entry.content}`)
    .join("\n");

  const knowledgeSection = sanitize(knowledgeBase).slice(0, 6000);

  return [
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
};

export class GeminiProvider {
  constructor({ apiKey = GEMINI_API_KEY, model = DEFAULT_MODEL } = {}) {
    this.enabled = Boolean(apiKey);

    if (!this.enabled) {
      return;
    }

    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ model });
  }

  async generateResponse(payload) {
    if (!this.enabled) {
      return null;
    }

    try {
      const prompt = buildPrompt(payload);

      const result = await this.model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      });

      return result?.response?.text?.() ?? null;
    } catch (error) {
      console.error("Gemini generation failed", error);
      return null;
    }
  }
}

export const createGeminiProvider = (options) => new GeminiProvider(options);
