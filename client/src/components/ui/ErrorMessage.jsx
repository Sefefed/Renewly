// Reusable error message component
export default function ErrorMessage({ error, onRetry, retryText = "Retry" }) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-rose-200/60 bg-white p-6 text-center shadow-sm">
      <p className="text-rose-500 mb-4 font-medium">Error: {error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          {retryText}
        </button>
      )}
    </div>
  );
}
