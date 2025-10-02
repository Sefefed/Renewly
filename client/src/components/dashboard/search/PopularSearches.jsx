import PropTypes from "prop-types";

const PopularSearches = ({ items, onSelect }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-secondary">Popular:</span>
      {items.map((item) => (
        <button
          key={item._id}
          type="button"
          onClick={() => onSelect(item._id)}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-secondary transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600"
        >
          {item._id}
        </button>
      ))}
    </div>
  );
};

PopularSearches.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      count: PropTypes.number,
    })
  ),
  onSelect: PropTypes.func,
};

PopularSearches.defaultProps = {
  items: [],
  onSelect: () => {},
};

export default PopularSearches;
