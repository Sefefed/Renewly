import PropTypes from "prop-types";

const PopularSearches = ({ items, onSelect }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-gray-400">Popular:</span>
      {items.map((item) => (
        <button
          key={item._id}
          type="button"
          onClick={() => onSelect(item._id)}
          className="rounded-full bg-gray-700 px-3 py-1 text-gray-200 transition-all duration-300 hover:scale-105 hover:bg-gray-600 hover:text-white"
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
