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
      <div className="relative group">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-30 blur transition duration-700 group-hover:opacity-80"></div>
        <div className="relative rounded-2xl border border-gray-700 bg-gray-800/90 transition-all duration-300 focus-within:border-blue-500">
          <div className="flex items-center px-4 py-3 gap-3">
            <div className="text-gray-400">
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
              className="flex-1 border-none bg-transparent text-lg text-white placeholder-gray-400 outline-none"
            />
            <div className="flex items-center gap-2">
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="px-2 text-xl text-gray-400 transition-colors hover:text-white"
                >
                  ×
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSearch()}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold transition-all duration-300 hover:from-blue-700 hover:to-blue-800"
              >
                Search
              </button>
            </div>
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
        <div className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion._id}
              type="button"
              onClick={() => handleSuggestionSelect(suggestion)}
              className="flex w-full items-center justify-between gap-4 border-b border-gray-800 px-4 py-3 text-left text-sm text-gray-200 transition-colors last:border-b-0 hover:bg-gray-800"
            >
              <span className="font-medium text-white">{suggestion.name}</span>
              <div className="flex items-center gap-2 text-xs">
                {suggestion.category && (
                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-blue-300">
                    {suggestion.category}
                  </span>
                )}
                {suggestion.status && (
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-300">
                    {suggestion.status}
                  </span>
                )}
              </div>
            </button>
          ))}
          {isFetchingSuggestions && (
            <div className="px-4 py-3 text-sm text-gray-400">
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
