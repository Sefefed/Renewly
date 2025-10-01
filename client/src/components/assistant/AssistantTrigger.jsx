import { useEffect, useState } from "react";

const AssistantTrigger = ({ onClick, unreadCount = 0 }) => {
  const [isPulsing, setIsPulsing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (unreadCount > 0) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="relative flex items-center justify-center">
        <button
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-2xl text-white shadow-2xl transition-all duration-500 hover:scale-110 hover:from-blue-700 hover:to-purple-700 ${
            isPulsing ? "animate-pulse ring-4 ring-blue-500/50" : ""
          }`}
          aria-label="Open financial assistant"
          title="AI Assistant"
        >
          🤖
          {unreadCount > 0 ? (
            <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </div>
          ) : null}
        </button>

        <span
          className={`pointer-events-none absolute -top-3 right-1/2 translate-y-[-100%] translate-x-1/2 rounded-full bg-gray-900/95 px-3 py-1 text-xs font-medium text-white shadow-lg transition-all duration-200 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          AI Assistant
        </span>
      </div>
    </div>
  );
};

export default AssistantTrigger;
