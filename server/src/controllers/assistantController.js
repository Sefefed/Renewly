import financialAssistant from "../services/assistant/financialAssistantService.js";
import personalizationEngine from "../services/assistant/personalizationEngine.js";
import AssistantFeedback from "../models/assistantFeedbackModel.js";

export const processAssistantQuery = async (req, res, next) => {
  try {
    const { query, context = {} } = req.body;
    if (!query || !query.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Query text is required." });
    }

    const persona = await personalizationEngine.getUserPersona(req.user._id);
    const result = await financialAssistant.processUserQuery(
      req.user._id,
      query,
      {
        ...context,
        persona,
      }
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getAssistantInsights = async (req, res, next) => {
  try {
    const [alerts, tips, persona] = await Promise.all([
      financialAssistant.generateSmartAlerts(req.user._id),
      personalizationEngine.generatePersonalizedTips(req.user._id),
      personalizationEngine.getUserPersona(req.user._id),
    ]);

    res.status(200).json({
      success: true,
      data: {
        alerts,
        tips,
        persona,
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const recordAssistantFeedback = async (req, res, next) => {
  try {
    const {
      query,
      response,
      helpful = true,
      feedback = "",
      metadata = {},
    } = req.body ?? {};

    if (!query || !response) {
      return res.status(400).json({
        success: false,
        message: "Both query and response are required to record feedback.",
      });
    }

    await AssistantFeedback.create({
      user: req.user._id,
      query,
      response,
      helpful,
      feedback,
      metadata,
      timestamp: new Date(),
    });

    res
      .status(201)
      .json({ success: true, message: "Feedback recorded successfully." });
  } catch (error) {
    next(error);
  }
};
