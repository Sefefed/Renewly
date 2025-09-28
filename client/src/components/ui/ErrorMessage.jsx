// Reusable error message component
export default function ErrorMessage({ error, onRetry, retryText = "Retry" }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-4">Error: {error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
}
