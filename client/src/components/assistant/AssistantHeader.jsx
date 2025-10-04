import VoiceAssistant from "./VoiceAssistant";

const STATUS_CONFIG = {
  thinking: {
    label: "Thinking...",
    dotClass: "bg-yellow-500 animate-pulse",
  },
  responding: {
    label: "Online",
    dotClass: "bg-green-500",
  },
  idle: {
    label: "Idle",
    dotClass: "bg-gray-500",
  },
};

const getStatus = (assistantState) =>
  STATUS_CONFIG[assistantState] ?? STATUS_CONFIG.idle;

const AssistantHeader = ({
  isDark,
  assistantState,
  theme,
  toggleTheme,
  onTranscript,
  onClose,
  titleId,
}) => {
  const { label, dotClass } = getStatus(assistantState);
  const dotStyles = isDark
    ? dotClass
    : dotClass.replace("bg-gray-500", "bg-gray-300");

  const surfaceClasses = isDark
    ? "border-white/10 bg-gray-950/90 text-white md:border-gray-700/50 md:bg-transparent"
    : "border-slate-200/70 bg-white/95 text-gray-900 md:border-gray-200 md:bg-transparent";

  return (
    <div
      className={`sticky top-0 z-10 flex items-center justify-between gap-3 border-b px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] backdrop-blur-sm transition-all duration-300 md:px-5 md:pt-4 ${surfaceClasses}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
          <span className="text-lg text-white">🤖</span>
        </div>
        <div>
          <h3
            id={titleId}
            className={`font-semibold tracking-tight ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Finance Assistant
          </h3>
          <div
            className={`flex items-center gap-2 text-xs ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${dotStyles}`} />
            <span>{label}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className={`rounded-xl p-3 text-lg transition-all duration-300 ${
            isDark
              ? "bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
          }`}
          aria-label="Toggle assistant theme"
        >
          {isDark ? "🌙" : "☀️"}
        </button>
        <VoiceAssistant onTranscript={onTranscript} theme={theme} />
        <button
          onClick={onClose}
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all duration-300 ${
            isDark
              ? "bg-gray-800/70 text-gray-300 hover:bg-gray-700 hover:text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
          }`}
          aria-label="Close assistant"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default AssistantHeader;
