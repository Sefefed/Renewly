// Reusable empty state component
export default function EmptyState({
  title,
  description,
  actionText,
  onAction,
  icon = "📋",
}) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <p className="text-gray-400 text-lg">{title}</p>
      <p className="text-gray-500 text-sm mt-2">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
