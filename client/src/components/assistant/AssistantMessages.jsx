import ChatMessage from "./ChatMessage";

const EmptyState = ({ isDark }) => (
  <div
    className={`flex h-full items-center justify-center text-center ${
      isDark ? "text-gray-400" : "text-gray-500"
    }`}
  >
    <div>
      <div
        className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl ${
          isDark ? "bg-gray-700/50" : "bg-gray-100"
        }`}
      >
        💬
      </div>
      <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
        Ask about your spending, savings, or trends to get started.
      </p>
    </div>
  </div>
);

const LoadingIndicator = ({ isDark }) => (
  <div
    className={`flex items-center gap-3 ${
      isDark ? "text-gray-400" : "text-gray-500"
    }`}
  >
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-full text-lg ${
        isDark ? "bg-gray-700/50" : "bg-gray-200"
      }`}
    >
      🤖
    </div>
    <div className="flex gap-1">
      {[0, 0.1, 0.2].map((delay) => (
        <span
          key={delay}
          className={`h-2 w-2 animate-bounce rounded-full ${
            isDark ? "bg-gray-500" : "bg-gray-400"
          }`}
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </div>
  </div>
);

const AssistantMessages = ({
  conversation,
  theme,
  isDark,
  isLoading,
  onAction,
}) => (
  <div className="flex-1 space-y-4 overflow-y-auto p-4">
    {conversation.length === 0 ? (
      <EmptyState isDark={isDark} />
    ) : (
      conversation.map((message, index) => (
        <ChatMessage
          key={`${message.timestamp}-${index}`}
          message={message}
          theme={theme}
          onAction={onAction}
        />
      ))
    )}

    {isLoading ? <LoadingIndicator isDark={isDark} /> : null}
  </div>
);

export default AssistantMessages;
