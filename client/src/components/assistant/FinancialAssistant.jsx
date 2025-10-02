import { useCallback, useEffect, useRef } from "react";
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
    isSpeaking,
    speak,
    stop,
    toggleSpeech,
  } = useAssistantSpeech();

  const lastSpokenRef = useRef(null);
  const lastQueuedPromptRef = useRef(null);

  const { containerRef, containerLayoutClasses } = useAssistantLayout({
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

  if (!isOpen) {
    return null;
  }

  const surfaceClasses = isDark
    ? "border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900 text-white"
    : "border-gray-200 bg-gradient-to-br from-white to-gray-50 text-gray-900";

  return (
    <div
      ref={containerRef}
      className={`fixed right-6 z-50 flex w-[24rem] max-w-[90vw] flex-col rounded-3xl border shadow-2xl backdrop-blur-sm transition-all duration-500 ease-out lg:w-[26rem] ${surfaceClasses} ${containerLayoutClasses}`}
    >
      <AssistantHeader
        isDark={isDark}
        assistantState={assistantState}
        theme={theme}
        toggleTheme={toggleTheme}
        speechControls={{
          isSupported: isSpeechSupported,
          isEnabled: isSpeechEnabled,
          isSpeaking,
          onToggle: toggleSpeech,
        }}
        onTranscript={handleTranscript}
        onClose={handleClose}
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
  );
};

export default FinancialAssistant;
