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
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100">
          <span className="text-3xl">🔍</span>
        </div>
        <h3 className="text-xl font-semibold text-primary">No results found</h3>
        <p className="mt-2 text-sm text-secondary">
          Try refining your search terms or trying different keywords.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-secondary">
          Showing{" "}
          <span className="font-semibold text-primary">{items.length}</span> of{" "}
          <span className="font-semibold text-primary">{totalCount}</span>{" "}
          results
        </div>
        <div className="flex w-full flex-wrap gap-3 text-xs text-secondary sm:w-auto sm:justify-end">
          {priceFacets && (
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-black">
              Avg: {formatCurrency(priceFacets.avgPrice ?? 0)}
            </span>
          )}
          {categoryFacets.slice(0, 3).map((category) => (
            <span
              key={category._id}
              className="rounded-full border border-violet-200 bg-white px-3 py-1 text-violet-600"
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
            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-1 items-center gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-semibold text-primary">
                    {item.name}
                  </p>
                  {item.category && (
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs uppercase tracking-wide text-black">
                      {item.category}
                    </span>
                  )}
                  {item.status && (
                    <span className="rounded-full border border-black bg-orange-250 px-3 py-1 text-xs uppercase tracking-wide text-black-600">
                      {item.status}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-secondary">
                  Next renewal ·{" "}
                  {item.renewalDate ? formatDate(item.renewalDate) : "Not set"}
                </p>
                {item.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-secondary">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 text-right sm:items-end">
              <p className="text-xl font-semibold text-blue-600">
                {formatCurrency(item.price, item.currency)}
              </p>
              <p className="text-xs text-tertiary">
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
