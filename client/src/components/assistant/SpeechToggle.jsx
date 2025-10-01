const SpeechToggle = ({
  theme = "dark",
  isSupported,
  isEnabled,
  isSpeaking,
  onToggle,
}) => {
  if (!isSupported) {
    return null;
  }

  const isDark = theme === "dark";

  const baseClasses = isDark
    ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
    : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800";

  const activeClasses = isDark
    ? "bg-blue-600/30 text-blue-200"
    : "bg-blue-100 text-blue-700";

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-xl p-3 transition-all duration-300 ${
        isEnabled
          ? `${activeClasses} ${isSpeaking ? "animate-pulse" : ""}`
          : baseClasses
      }`}
      aria-pressed={isEnabled}
      aria-label={
        isEnabled ? "Disable assistant voice" : "Enable assistant voice"
      }
      title={isEnabled ? "Disable voice responses" : "Enable voice responses"}
    >
      <span className="text-xl">{isEnabled ? "🔊" : "🔈"}</span>
    </button>
  );
};

export default SpeechToggle;
