// Reusable filter tabs component
export default function FilterTabs({ filters, activeFilter, onFilterChange }) {
  return (
    <div className="flex gap-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-4 py-2 rounded text-sm ${
            activeFilter === filter.value
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
