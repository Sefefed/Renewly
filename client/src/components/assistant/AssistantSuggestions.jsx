const AssistantSuggestions = ({
  suggestions,
  assistantState,
  isDark,
  onSuggestionClick,
}) => {
  if (suggestions.length === 0 || assistantState !== "responding") {
    return null;
  }

  const baseClasses = isDark
    ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800";

  return (
    <div className="px-4 pb-2">
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={`${suggestion}-${index}`}
            onClick={() => onSuggestionClick(suggestion)}
            className={`transform rounded-full px-3 py-2 text-sm transition-all duration-200 hover:scale-105 ${baseClasses}`}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AssistantSuggestions;
