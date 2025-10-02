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
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              isActive
                ? "border-blue-300 bg-blue-50 text-blue-600 shadow-sm"
                : "border-transparent bg-white text-secondary hover:border-blue-200 hover:text-blue-600"
            } ${isBusy ? "cursor-not-allowed opacity-60" : ""}`}
            disabled={isBusy}
          >
            {isBusy ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400/70 border-t-transparent"></div>
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
