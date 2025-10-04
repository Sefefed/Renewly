import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import PopularSearches from "./PopularSearches";

const SmartSearch = ({
  api,
  onSearch,
  isLoading,
  onReset,
  popularSearches,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setIsFetchingSuggestions(false);
      return undefined;
    }

    let isCancelled = false;
    setIsFetchingSuggestions(true);

    const timeoutId = setTimeout(async () => {
      try {
        const data = await api.getSearchSuggestions(query.trim());
        if (!isCancelled) {
          setSuggestions(data.data ?? []);
        }
      } catch (error) {
        console.error("Suggestion fetch failed", error);
        if (!isCancelled) {
          setSuggestions([]);
        }
      } finally {
        if (!isCancelled) {
          setIsFetchingSuggestions(false);
        }
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [api, query]);

  useEffect(() => {
    if (!query) {
      onReset();
    }
  }, [query, onReset]);

  const handleSearch = useCallback(
    (overrideQuery = query) => {
      onSearch(overrideQuery.trim());
    },
    [onSearch, query]
  );

  const handleSuggestionSelect = (suggestion) => {
    setQuery(suggestion.name);
    setSuggestions([]);
    handleSearch(suggestion.name);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="relative">
      <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 focus-within:border-blue-300 focus-within:shadow-lg">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <div className="text-tertiary">
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-blue-500"></div>
            ) : (
              <span className="text-xl">🔍</span>
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search subscriptions, categories, or descriptions..."
            className="min-w-0 flex-1 border-none bg-transparent text-lg text-primary placeholder:text-tertiary outline-none"
          />
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-secondary transition-colors hover:border-blue-200 hover:text-primary sm:w-auto sm:border-transparent sm:bg-transparent sm:px-2 sm:py-1 sm:text-lg sm:text-tertiary"
              >
                ×
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSearch()}
              className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100 sm:w-auto"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {popularSearches?.length > 0 && (
        <div className="mt-4">
          <PopularSearches
            items={popularSearches}
            onSelect={(value) => {
              setQuery(value);
              handleSearch(value);
            }}
          />
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion._id}
              type="button"
              onClick={() => handleSuggestionSelect(suggestion)}
              className="flex w-full items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 text-left text-sm text-secondary transition-colors last:border-b-0 hover:bg-blue-50"
            >
              <span className="font-medium text-primary">
                {suggestion.name}
              </span>
              <div className="flex items-center gap-2 text-xs">
                {suggestion.category && (
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-600">
                    {suggestion.category}
                  </span>
                )}
                {suggestion.status && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-600">
                    {suggestion.status}
                  </span>
                )}
              </div>
            </button>
          ))}
          {isFetchingSuggestions && (
            <div className="px-4 py-3 text-sm text-secondary">
              Fetching suggestions…
            </div>
          )}
        </div>
      )}
    </div>
  );
};

SmartSearch.propTypes = {
  api: PropTypes.shape({
    getSearchSuggestions: PropTypes.func.isRequired,
  }).isRequired,
  onSearch: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  onReset: PropTypes.func,
  popularSearches: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      count: PropTypes.number,
    })
  ),
};

SmartSearch.defaultProps = {
  isLoading: false,
  onReset: () => {},
  popularSearches: [],
};

export default SmartSearch;
