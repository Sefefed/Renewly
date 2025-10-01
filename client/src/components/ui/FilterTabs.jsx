import PropTypes from "prop-types";

const FilterTabs = ({ filters, activeFilter, onFilterChange, isLoading }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.value;
        const isBusy = isLoading && isActive;

        return (
          <button
            key={filter.value}
            onClick={() => {
              if (!isLoading || !isActive) {
                onFilterChange(filter.value);
              }
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
              isActive
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-900/40"
                : "bg-gray-800/70 text-gray-300 hover:bg-gray-700 hover:text-white"
            } ${isBusy ? "opacity-60 cursor-not-allowed" : ""}`}
            disabled={isBusy}
          >
            {isBusy ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent"></div>
            ) : (
              filter.icon && <span className="text-base">{filter.icon}</span>
            )}
            <span>{isBusy ? "Loading..." : filter.label}</span>
          </button>
        );
      })}
    </div>
  );
};

FilterTabs.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
    })
  ).isRequired,
  activeFilter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

FilterTabs.defaultProps = {
  isLoading: false,
};

export default FilterTabs;
