import PropTypes from "prop-types";

const FilterTabs = ({
  filters,
  activeFilter,
  onFilterChange,
  isLoading,
  variant,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.value;
        const isBusy = isLoading && isActive;
        const buttonBaseClass =
          "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200";

        const isDark = variant === "dark";

        const activeClass = isDark
          ? "border-transparent shadow-lg shadow-slate-900/40"
          : "border-blue-300 bg-black text-white shadow-sm";

        const inactiveClass = isDark
          ? "border border-slate-200 bg-white text-secondary hover:border-slate-300 hover:text-primary"
          : "border-transparent bg-white text-secondary hover:border-blue-200 hover:text-blue-600";

        const buttonStyle = isDark
          ? {
              backgroundColor: isActive ? "#000000" : "#ffffff",
              color: isActive ? "#ffffff" : "var(--text-secondary)",
            }
          : undefined;

        return (
          <button
            key={filter.value}
            onClick={() => {
              if (!isLoading || !isActive) {
                onFilterChange(filter.value);
              }
            }}
            className={`${buttonBaseClass} ${
              isBusy ? "cursor-not-allowed opacity-60" : ""
            } ${isActive ? activeClass : inactiveClass}`.trim()}
            style={buttonStyle}
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
  variant: PropTypes.oneOf(["default", "dark"]),
};

FilterTabs.defaultProps = {
  isLoading: false,
  variant: "default",
};

export default FilterTabs;
