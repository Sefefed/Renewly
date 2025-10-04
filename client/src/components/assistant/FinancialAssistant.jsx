import { useCallback, useEffect, useId, useRef } from "react";
import AssistantComposer from "./AssistantComposer";
import AssistantHeader from "./AssistantHeader";
import AssistantMessages from "./AssistantMessages";
import AssistantSuggestions from "./AssistantSuggestions";
import useAssistantConversation from "./hooks/useAssistantConversation";
import useAssistantLayout from "./hooks/useAssistantLayout";
import useAssistantTheme from "./hooks/useAssistantTheme";
import useAssistantSpeech from "./hooks/useAssistantSpeech";

const FinancialAssistant = ({
  api,
  isOpen,
  onClose,
  onUnreadChange,
  onLayoutChange,
  queuedPrompt,
  onPromptConsumed,
}) => {
  const { theme, isDark, toggleTheme } = useAssistantTheme();
  const {
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
  } = useAssistantConversation({ api, isOpen, onUnreadChange });

  const {
    isSupported: isSpeechSupported,
    isEnabled: isSpeechEnabled,
    speak,
    stop,
  } = useAssistantSpeech();

  const lastSpokenRef = useRef(null);
  const lastQueuedPromptRef = useRef(null);

  const { isExpanded, containerRef, containerLayoutClasses } =
    useAssistantLayout({
      isOpen,
      onLayoutChange,
    });

  useEffect(() => {
    if (!isOpen) {
      stop();
      lastSpokenRef.current = null;
      lastQueuedPromptRef.current = null;
    }
  }, [isOpen, stop]);

  useEffect(() => {
    if (!isSpeechEnabled) {
      stop();
      lastSpokenRef.current = null;
    }
  }, [isSpeechEnabled, stop]);

  useEffect(() => {
    if (!isOpen || !isSpeechSupported || !isSpeechEnabled) {
      return;
    }

    const latestAssistantMessage = [...conversation]
      .reverse()
      .find((message) => message.type === "assistant");

    if (!latestAssistantMessage) {
      return;
    }

    const timestamp = latestAssistantMessage.timestamp;
    const messageId = (() => {
      if (timestamp instanceof Date) {
        return timestamp.getTime();
      }
      if (typeof timestamp === "number") {
        return timestamp;
      }
      if (typeof timestamp === "string") {
        const parsed = Date.parse(timestamp);
        return Number.isNaN(parsed) ? conversation.length : parsed;
      }
      return conversation.length;
    })();

    if (lastSpokenRef.current === messageId) {
      return;
    }

    const textContent =
      typeof latestAssistantMessage.content === "string"
        ? latestAssistantMessage.content
        : latestAssistantMessage.content?.text;

    if (!textContent) {
      return;
    }

    lastSpokenRef.current = messageId;
    speak(textContent);
  }, [conversation, isOpen, isSpeechEnabled, isSpeechSupported, speak]);

  const handleClose = useCallback(() => {
    stop();
    lastSpokenRef.current = null;
    lastQueuedPromptRef.current = null;
    onClose?.();
  }, [onClose, stop]);

  useEffect(() => {
    if (!isOpen || !queuedPrompt?.text) {
      return;
    }

    if (lastQueuedPromptRef.current === queuedPrompt.id) {
      return;
    }

    handleSendMessage(queuedPrompt.text);
    lastQueuedPromptRef.current = queuedPrompt.id;
    onPromptConsumed?.(queuedPrompt.id);
  }, [handleSendMessage, isOpen, onPromptConsumed, queuedPrompt]);

  const titleId = useId();

  if (!isOpen) {
    return null;
  }

  const surfaceClasses = isDark
    ? "bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white md:border-gray-700/50"
    : "bg-gradient-to-br from-white via-white to-gray-100 text-gray-900 md:border-gray-200";

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/50 transition-opacity duration-500 ${
          isExpanded ? "opacity-100" : "opacity-0"
        } ${isExpanded ? "pointer-events-auto" : "pointer-events-none"}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Finance assistant chat"
        aria-labelledby={titleId}
        className={`fixed inset-0 z-50 flex w-full flex-col overflow-hidden rounded-none border-0 shadow-none transition-all duration-500 ease-out md:inset-auto md:right-6 md:top-6 md:bottom-6 md:h-auto md:w-[24rem] md:max-h-[calc(100vh-3rem)] md:max-w-[90vw] md:rounded-3xl md:border md:shadow-2xl lg:w-[26rem] ${surfaceClasses} ${containerLayoutClasses}`}
      >
        <AssistantHeader
          isDark={isDark}
          assistantState={assistantState}
          theme={theme}
          toggleTheme={toggleTheme}
          onTranscript={handleTranscript}
          onClose={handleClose}
          titleId={titleId}
        />

        <AssistantMessages
          conversation={conversation}
          theme={theme}
          isDark={isDark}
          isLoading={isLoading}
          onAction={handleSendMessage}
        />

        <AssistantSuggestions
          suggestions={suggestions}
          assistantState={assistantState}
          isDark={isDark}
          onSuggestionClick={handleSendMessage}
        />

        <AssistantComposer
          input={input}
          isDark={isDark}
          isLoading={isLoading}
          error={error}
          onInputChange={handleInputChange}
          onInputKeyDown={handleInputKeyDown}
          onSend={() => handleSendMessage()}
        />
      </div>
    </>
  );
};

export default FinancialAssistant;
