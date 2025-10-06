import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const createEmptyAiState = () => ({
  summary: null,
  suggestions: [],
  actions: [],
  version: 0,
});

const extractSummaryText = (summary) => {
  if (!summary) return "";
  if (typeof summary === "string") return summary;
  if (typeof summary?.text === "string") return summary.text;
  return "";
};

export const useAiBriefing = ({
  entity,
  buildPrompt,
  api,
  entityType,
  pickAngle,
}) => {
  const [aiState, setAiState] = useState(createEmptyAiState);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [displayedLines, setDisplayedLines] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [analysisAngle, setAnalysisAngle] = useState(null);

  const angleRef = useRef(null);
  const summaryTimerRef = useRef(null);

  const resetTyping = useCallback(() => {
    if (summaryTimerRef.current) {
      clearTimeout(summaryTimerRef.current);
      summaryTimerRef.current = null;
    }

    setDisplayedLines([]);
    setIsTyping(false);
  }, []);

  const clearAngle = useCallback(() => {
    angleRef.current = null;
    setAnalysisAngle(null);
  }, []);

  useEffect(() => {
    clearAngle();
    setAiState(createEmptyAiState());
    setAiError(null);
  }, [entity?._id, clearAngle]);

  const refresh = useCallback(
    async ({ followUp, silent } = {}) => {
      if (!entity || !buildPrompt || !api) return;

      let angleToUse = angleRef.current;
      if (pickAngle && (!followUp || !angleToUse)) {
        angleToUse = pickAngle(angleToUse?.id);
        angleRef.current = angleToUse;
        setAnalysisAngle(angleToUse);
      }

      setAiError(null);
      if (!silent) {
        setAiLoading(true);
      }

      try {
        const prompt = buildPrompt(entity, followUp, angleToUse);
        const response = await api.assistantQuery(prompt, {
          entityType,
          entityId: entity._id,
          entity,
          followUp,
          analysisAngle: angleToUse,
        });

        setAiState({
          summary: response?.data?.response ?? null,
          suggestions: response?.data?.suggestions ?? [],
          actions: response?.data?.actions ?? [],
          version: Date.now(),
        });
      } catch (err) {
        setAiError(err.message ?? "Unable to generate AI insights right now");
        setAiState(createEmptyAiState());
      } finally {
        setAiLoading(false);
      }
    },
    [api, buildPrompt, entity, entityType, pickAngle]
  );

  useEffect(() => {
    if (entity) {
      refresh();
    }
  }, [entity, refresh]);

  useEffect(() => {
    if (aiLoading) {
      resetTyping();
    }
  }, [aiLoading, resetTyping]);

  const summaryText = useMemo(
    () => extractSummaryText(aiState.summary),
    [aiState.summary]
  );

  useEffect(() => {
    resetTyping();

    if (!summaryText) {
      return undefined;
    }

    const paragraphs = summaryText
      .split(/\n+/)
      .map((segment) => segment.trim())
      .filter(Boolean);

    const normalized =
      paragraphs.length > 0 ? paragraphs : [summaryText.trim()];
    const wordsByParagraph = normalized.map((paragraph) =>
      paragraph.split(/\s+/).filter(Boolean)
    );

    setDisplayedLines(normalized.map(() => ""));
    setIsTyping(true);

    let paragraphIndex = 0;
    let wordIndex = 0;

    const typeNextWord = () => {
      const words = wordsByParagraph[paragraphIndex];

      if (!words || words.length === 0) {
        paragraphIndex += 1;
        wordIndex = 0;
      } else {
        const nextWord = words[wordIndex];
        setDisplayedLines((prev) => {
          const next = [...prev];
          const existing = next[paragraphIndex];
          next[paragraphIndex] = existing
            ? `${existing} ${nextWord}`
            : nextWord;
          return next;
        });

        wordIndex += 1;

        if (wordIndex >= words.length) {
          paragraphIndex += 1;
          wordIndex = 0;
        }
      }

      if (paragraphIndex < wordsByParagraph.length) {
        summaryTimerRef.current = setTimeout(typeNextWord, 120);
      } else {
        setIsTyping(false);
        summaryTimerRef.current = null;
      }
    };

    summaryTimerRef.current = setTimeout(typeNextWord, 220);

    return () => {
      if (summaryTimerRef.current) {
        clearTimeout(summaryTimerRef.current);
        summaryTimerRef.current = null;
      }
    };
  }, [summaryText, aiState.version, resetTyping]);

  useEffect(
    () => () => {
      if (summaryTimerRef.current) {
        clearTimeout(summaryTimerRef.current);
      }
    },
    []
  );

  return {
    aiState,
    aiLoading,
    aiError,
    displayedLines,
    isTyping,
    refresh,
    analysisAngle,
  };
};

export const aiHelpers = {
  createEmptyAiState,
  extractSummaryText,
};
