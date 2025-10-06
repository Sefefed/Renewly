import { LLM_PROVIDER } from "../../config/env.js";

import { createGeminiProvider } from "./llm/geminiProvider.js";
import { buildFallbackResponse } from "./llm/fallbackBuilders.js";

const PROVIDER_FACTORIES = {
  gemini: () => createGeminiProvider(),
};

const resolveFactory = (providerKey) =>
  PROVIDER_FACTORIES[providerKey] || PROVIDER_FACTORIES.gemini;

export class FinancialLLMProvider {
  constructor() {
    const providerKey = (LLM_PROVIDER || "gemini").toLowerCase();
    this.providerKey = providerKey;
    this.client = resolveFactory(providerKey)();
  }

  async generate(payload) {
    const response = await this.client.generateResponse(payload);
    if (response) {
      return response;
    }

    return buildFallbackResponse(payload);
  }
}

const llmProvider = new FinancialLLMProvider();

export default llmProvider;
