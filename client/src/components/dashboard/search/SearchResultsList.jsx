import PropTypes from "prop-types";
import { formatCurrency, formatDate } from "../../../utils/formatters";

const SearchResultsList = ({ results }) => {
  const items = results?.results ?? [];
  const totalCount = results?.totalCount ?? 0;
  const categoryFacets = results?.facets?.categories ?? [];
  const priceFacets = results?.facets?.price;

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-700/40">
          <span className="text-3xl">🔍</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-200">No results found</h3>
        <p className="mt-2 text-sm text-gray-400">
          Try adjusting your search terms or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-700/50 bg-gray-800/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-300">
          Showing <span className="text-white font-semibold">{items.length}</span> of {" "}
          <span className="text-white font-semibold">{totalCount}</span> results
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
          {priceFacets && (
            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-blue-200">
              Avg: {formatCurrency(priceFacets.avgPrice ?? 0)}
            </span>
          )}
          {categoryFacets.slice(0, 3).map((category) => (
            <span
              key={category._id}
              className="rounded-full bg-purple-500/10 px-3 py-1 text-purple-200"
            >
              {category._id} · {category.count}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex flex-col gap-4 rounded-2xl border border-gray-700/40 bg-gradient-to-r from-gray-800/70 to-gray-900/70 p-5 transition-all duration-300 hover:border-blue-500/30 hover:shadow-xl sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-1 items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                <span className="text-lg">💡</span>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-semibold text-white">{item.name}</p>
                  {item.category && (
                    <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs uppercase tracking-wide text-blue-200">
                      {item.category}
                    </span>
                  )}
                  {item.status && (
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs uppercase tracking-wide text-emerald-200">
                      {item.status}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-400">
                  Next renewal · {item.renewalDate ? formatDate(item.renewalDate) : "Not set"}
                </p>
                {item.description && (
                  <p className="mt-2 text-sm text-gray-300 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 text-right sm:items-end">
              <p className="text-xl font-semibold text-blue-300">
                {formatCurrency(item.price, item.currency)}
              </p>
              <p className="text-xs text-gray-400">
                Added {item.createdAt ? formatDate(item.createdAt) : "-"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

SearchResultsList.propTypes = {
  results: PropTypes.shape({
    results: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        category: PropTypes.string,
        price: PropTypes.number,
        currency: PropTypes.string,
        status: PropTypes.string,
        renewalDate: PropTypes.string,
        description: PropTypes.string,
        createdAt: PropTypes.string,
      })
    ),
    totalCount: PropTypes.number,
    facets: PropTypes.shape({
      categories: PropTypes.array,
      price: PropTypes.shape({
        minPrice: PropTypes.number,
        maxPrice: PropTypes.number,
        avgPrice: PropTypes.number,
      }),
    }),
  }),
};

SearchResultsList.defaultProps = {
  results: {
    results: [],
    totalCount: 0,
    facets: {
      categories: [],
      price: null,
    },
  },
};

export default SearchResultsList;
