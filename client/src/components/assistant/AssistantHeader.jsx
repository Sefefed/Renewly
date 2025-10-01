import VoiceAssistant from "./VoiceAssistant";
import SpeechToggle from "./SpeechToggle";

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
  speechControls,
  onTranscript,
  onClose,
}) => {
  const { label, dotClass } = getStatus(assistantState);
  const dotStyles = isDark
    ? dotClass
    : dotClass.replace("bg-gray-500", "bg-gray-300");

  return (
    <div
      className={`flex items-center justify-between border-b p-4 ${
        isDark ? "border-gray-700/50" : "border-gray-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
          <span className="text-lg text-white">🤖</span>
        </div>
        <div>
          <h3
            className={`font-semibold ${
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
        <SpeechToggle
          theme={theme}
          isSupported={speechControls?.isSupported}
          isEnabled={speechControls?.isEnabled}
          isSpeaking={speechControls?.isSpeaking}
          onToggle={speechControls?.onToggle}
        />
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
          className={`text-xl transition-colors ${
            isDark
              ? "text-gray-400 hover:text-white"
              : "text-gray-500 hover:text-gray-700"
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
