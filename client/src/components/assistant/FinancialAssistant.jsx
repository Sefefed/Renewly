import AssistantComposer from "./AssistantComposer";
import AssistantHeader from "./AssistantHeader";
import AssistantMessages from "./AssistantMessages";
import AssistantSuggestions from "./AssistantSuggestions";
import useAssistantConversation from "./hooks/useAssistantConversation";
import useAssistantLayout from "./hooks/useAssistantLayout";
import useAssistantTheme from "./hooks/useAssistantTheme";

const FinancialAssistant = ({
  api,
  isOpen,
  onClose,
  onUnreadChange,
  onLayoutChange,
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

  const { containerRef, containerLayoutClasses } = useAssistantLayout({
    isOpen,
    onLayoutChange,
  });

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
        onTranscript={handleTranscript}
        onClose={onClose}
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
