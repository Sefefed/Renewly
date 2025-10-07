import PropTypes from "prop-types";
import useTypingParagraphs from "../hooks/useTypingParagraphs";

const AssistantResponse = ({
  title,
  responseText,
  isLoading,
  error,
  emptyMessage,
}) => {
  const { paragraphs, displayedParagraphs, isTyping } =
    useTypingParagraphs(responseText);

  const caretVisible = isTyping && !isLoading && !error;
  const showEmptyState = !isLoading && !error && paragraphs.length === 0;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            AI Perspective
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            {title}
          </h2>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="space-y-3">
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
          </div>
        )}

        {!isLoading && !error && displayedParagraphs.length > 0 && (
          <div className="space-y-3 text-base leading-relaxed text-slate-800">
            {displayedParagraphs.map((paragraph, index) => (
              <p key={`paragraph-${index}`} className="relative">
                {paragraph}
                {caretVisible && index === displayedParagraphs.length - 1 && (
                  <span
                    aria-hidden
                    className="ml-1 inline-block h-5 w-1 animate-pulse rounded bg-slate-400 align-middle"
                  />
                )}
              </p>
            ))}
          </div>
        )}

        {showEmptyState && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
};

AssistantResponse.propTypes = {
  title: PropTypes.string,
  responseText: PropTypes.string,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  emptyMessage: PropTypes.string,
};

AssistantResponse.defaultProps = {
  title: "Alert guidance",
  responseText: "",
  isLoading: false,
  error: null,
  emptyMessage:
    "The assistant didn’t return detailed guidance. Try again later or reach out through the assistant for more context.",
};

export default AssistantResponse;
