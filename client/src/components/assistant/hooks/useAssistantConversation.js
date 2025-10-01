import { useCallback, useEffect, useMemo, useState } from "react";

const buildErrorMessage = () => ({
  type: "assistant",
  content: {
    text: "I'm having trouble processing that right now. Try again shortly.",
    type: "error",
  },
  timestamp: new Date(),
});

const extractHistory = (conversation) =>
  conversation.slice(-10).map((message) => ({
    type: message.type,
    content: message.content,
  }));

const useAssistantConversation = ({ api, isOpen, onUnreadChange }) => {
  const [conversation, setConversation] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [assistantState, setAssistantState] = useState("idle");
  const [error, setError] = useState(null);

  const previousMessages = useMemo(
    () => extractHistory(conversation),
    [conversation]
  );

  useEffect(() => {
    if (isOpen) {
      onUnreadChange?.(0);
    }
  }, [conversation.length, isOpen, onUnreadChange]);

  const appendMessage = useCallback(
    (message) => {
      setConversation((prev) => [...prev, message]);
      if (message.type === "assistant" && !isOpen) {
        onUnreadChange?.((count) => Math.min(9, (count ?? 0) + 1));
      }
    },
    [isOpen, onUnreadChange]
  );

  const handleError = useCallback(() => {
    appendMessage(buildErrorMessage());
  }, [appendMessage]);

  const sendMessage = useCallback(
    async (payload) => {
      const userMessage = {
        type: "user",
        content: payload,
        timestamp: new Date(),
      };

      appendMessage(userMessage);
      setInput("");
      setIsLoading(true);
      setAssistantState("thinking");
      setError(null);

      try {
        const response = await api.assistantQuery(payload, {
          conversationHistory: previousMessages,
        });

        const assistantMessage = {
          type: "assistant",
          content: response.data.response,
          actions: response.data.actions,
          timestamp: new Date(),
        };

        appendMessage(assistantMessage);
        setSuggestions(response.data.suggestions ?? []);
        setAssistantState("responding");
        onUnreadChange?.(0);

        setTimeout(() => setAssistantState("idle"), 4000);
      } catch (err) {
        console.error("Assistant query failed", err);
        setError(err.message);
        handleError();
        setAssistantState("idle");
      } finally {
        setIsLoading(false);
      }
    },
    [api, appendMessage, handleError, onUnreadChange, previousMessages]
  );

  const handleSendMessage = useCallback(
    (messageText) => {
      const trimmed = (messageText ?? input).trim();
      if (!trimmed || isLoading) {
        return;
      }
      void sendMessage(trimmed);
    },
    [input, isLoading, sendMessage]
  );

  const handleTranscript = useCallback(
    (transcript) => {
      setInput(transcript);
      handleSendMessage(transcript);
    },
    [handleSendMessage]
  );

  const handleInputChange = useCallback((value) => {
    setInput(value);
  }, []);

  const handleInputKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  return {
    conversation,
    input,
    isLoading,
    suggestions,
    assistantState,
    error,
    handleSendMessage,
    handleTranscript,
    handleInputChange,
    handleInputKeyDown,
  };
};

export default useAssistantConversation;
