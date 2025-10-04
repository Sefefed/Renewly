const AssistantComposer = ({
  input,
  isDark,
  isLoading,
  error,
  onInputChange,
  onInputKeyDown,
  onSend,
}) => {
  const textareaClasses = isDark
    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
    : "border-gray-200 bg-white text-gray-800 placeholder-gray-400";

  const disabledGradient = isDark
    ? "disabled:from-gray-600 disabled:to-gray-700"
    : "disabled:from-gray-300 disabled:to-gray-400";

  return (
    <div
      className={`border-t p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-sm ${
        isDark
          ? "border-gray-700/50 bg-gray-900/60"
          : "border-gray-200 bg-white/85"
      }`}
    >
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="Ask about your finances..."
          className={`h-12 flex-1 resize-none rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${textareaClasses}`}
        />
        <button
          onClick={onSend}
          disabled={!input.trim() || isLoading}
          className={`rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 text-lg font-medium text-white transition-all duration-300 hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed ${disabledGradient}`}
          aria-label="Send message"
        >
          ↑
        </button>
      </div>
      {error ? (
        <p
          className={`mt-2 text-xs ${isDark ? "text-red-400" : "text-red-500"}`}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default AssistantComposer;
