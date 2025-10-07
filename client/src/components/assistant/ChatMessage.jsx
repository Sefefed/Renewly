import { useEffect, useMemo, useState } from "react";
import { renderDataBlock } from "./chatMessageBlocks";
import { useCurrency } from "../../hooks/useCurrency";

const toDate = (value) => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  return new Date(value);
};

const getAvatarClass = (isAssistant, isDark) =>
  isAssistant
    ? "bg-gradient-to-r from-blue-500 to-purple-600"
    : isDark
    ? "bg-gradient-to-r from-gray-600 to-gray-700"
    : "bg-gradient-to-r from-gray-200 to-gray-300";

const getBubbleClass = (isAssistant, isDark) => {
  if (!isAssistant) {
    return "rounded-tr-none bg-gradient-to-r from-blue-600 to-blue-700 text-white";
  }

  return isDark
    ? "rounded-tl-none bg-gray-700/50 text-white"
    : "rounded-tl-none border border-gray-200 bg-gray-100 text-gray-900";
};

const getActionClasses = (isDark) =>
  isDark
    ? "border border-blue-500/30 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30"
    : "border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100";

const buildTokens = (text) => {
  if (!text) return [];
  return text.match(/\S+\s*/g) ?? [text];
};

const ChatMessage = ({ message, onAction, theme = "dark" }) => {
  const { currency } = useCurrency();
  const isAssistant = message.type === "assistant";
  const timestamp = toDate(message.timestamp);
  const isDark = theme === "dark";
  const avatarClass = getAvatarClass(isAssistant, isDark);
  const bubbleClass = getBubbleClass(isAssistant, isDark);
  const timeColor = isDark ? "text-gray-500" : "text-gray-400";
  const content = useMemo(() => {
    if (typeof message.content === "string") {
      return { text: message.content };
    }
    return message.content ?? { text: "" };
  }, [message]);

  const baseText = content.text ?? "";
  const tokens = useMemo(() => buildTokens(baseText), [baseText]);
  const shouldAnimate = Boolean(
    isAssistant && message.animate && tokens.length > 0
  );

  const [displayText, setDisplayText] = useState(shouldAnimate ? "" : baseText);
  const [isAnimating, setIsAnimating] = useState(shouldAnimate);

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayText(baseText);
      setIsAnimating(false);
      return;
    }

    let index = 0;
    setDisplayText("");
    setIsAnimating(true);

    const interval = setInterval(() => {
      setDisplayText((prev) => prev + (tokens[index] ?? ""));
      index += 1;

      if (index >= tokens.length) {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, Math.min(140, Math.max(60, 900 / tokens.length)));

    return () => {
      clearInterval(interval);
    };
  }, [shouldAnimate, tokens, baseText, message.id]);

  const dataBlock = useMemo(() => {
    if (content?.dataBlock) {
      return content.dataBlock;
    }
    if (content?.data) {
      return { type: content.type, data: content.data };
    }
    return null;
  }, [content]);

  const hasDataBlock = Boolean(dataBlock);
  const showDataBlock = hasDataBlock && !isAnimating;
  const textClassName = `text-sm leading-relaxed whitespace-pre-wrap${
    hasDataBlock ? " mb-2" : ""
  }`;

  return (
    <div className={`flex gap-3 ${isAssistant ? "" : "flex-row-reverse"}`}>
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${avatarClass}`}
      >
        <span className="text-sm text-white">{isAssistant ? "🤖" : "👤"}</span>
      </div>

      <div className={`flex-1 ${isAssistant ? "" : "text-right"}`}>
        <div
          className={`inline-block max-w-[80%] rounded-2xl px-4 py-3 ${bubbleClass}`}
        >
          {content ? (
            <div>
              <p className={textClassName}>
                {displayText}
                {isAnimating ? (
                  <span className="ml-0.5 inline-block animate-pulse opacity-70">
                    ▍
                  </span>
                ) : null}
              </p>
              {showDataBlock
                ? renderDataBlock(
                    dataBlock?.type,
                    dataBlock?.data,
                    isDark,
                    currency
                  )
                : null}
            </div>
          ) : null}
        </div>

        {isAssistant && message.actions?.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.actions.map((action, index) => (
              <button
                key={`${action.label}-${index}`}
                onClick={() => onAction?.(action.query)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${getActionClasses(
                  isDark
                )}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}

        <div
          className={`mt-1 text-xs ${
            isAssistant ? "" : "text-right"
          } ${timeColor}`}
        >
          {timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
