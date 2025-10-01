import { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { formatCurrency, formatDate } from "../../utils/formatters";
import {
  SmartSearch,
  SearchResultsSkeleton,
  SearchResultsList,
} from "./search";

export default function UpcomingRenewalsCard({ renewals, api }) {
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [popularSearches, setPopularSearches] = useState([]);
  const [searchError, setSearchError] = useState(null);

  const resultsCount = useMemo(() => {
    if (searchResults) {
      return searchResults.totalCount ?? 0;
    }
    return renewals.length;
  }, [searchResults, renewals.length]);

  const loadPopularSearches = useCallback(async () => {
    try {
      const response = await api.getPopularSearches();
      setPopularSearches(response.data ?? []);
    } catch (error) {
      console.error("Failed to load popular searches", error);
    }
  }, [api]);

  useEffect(() => {
    loadPopularSearches();
  }, [loadPopularSearches]);

  const handleSearch = useCallback(
    async (query) => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const response = await api.searchSubscriptions(query);
        setSearchResults(response.data);
        await loadPopularSearches();
      } catch (error) {
        console.error("Advanced search failed", error);
        setSearchError(error.message ?? "Unable to fetch results");
      } finally {
        setIsSearching(false);
      }
    },
    [api, loadPopularSearches]
  );

  const handleReset = useCallback(() => {
    setSearchResults(null);
    setSearchError(null);
  }, []);

  const isShowingSearch = Boolean(searchResults);

  return (
    <div className="rounded-2xl border border-gray-700/30 bg-gradient-to-br from-gray-800 to-gray-900 p-7 shadow-2xl backdrop-blur-sm">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-white to-gray-300 bg-clip-text">
            {isShowingSearch ? "Search Results" : "Upcoming Renewals"}
          </h2>
          <p className="text-sm text-gray-400">
            {isShowingSearch
              ? "Adjust your search to discover more subscriptions."
              : "Keep an eye on the next renewals and explore your library effortlessly."}
          </p>
        </div>
        <span className="rounded-full bg-blue-500/10 px-4 py-1 text-sm font-medium text-blue-300">
          {resultsCount} {resultsCount === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="mb-6">
        <SmartSearch
          api={api}
          onSearch={handleSearch}
          isLoading={isSearching}
          onReset={handleReset}
          popularSearches={popularSearches}
        />
      </div>

      {searchError && (
        <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {searchError}
        </div>
      )}

      {isSearching ? (
        <SearchResultsSkeleton />
      ) : isShowingSearch ? (
        <SearchResultsList results={searchResults} />
      ) : renewals.length > 0 ? (
        <div className="space-y-4">
          {renewals.map((renewal) => (
            <div
              key={`${renewal.name}-${renewal.renewalDate}`}
              className="group flex items-center justify-between rounded-xl border border-gray-600/30 bg-gradient-to-r from-gray-700/50 to-gray-800/50 p-5 transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/30 hover:from-gray-700 hover:to-gray-800"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                  <span className="text-lg">📅</span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-white transition-colors group-hover:text-blue-300">
                    {renewal.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {formatDate(renewal.renewalDate)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-400">
                  {formatCurrency(renewal.price)}
                </p>
                <p className="text-sm font-medium text-gray-400">
                  {renewal.frequency}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-700/50">
            <span className="text-3xl">📅</span>
          </div>
          <p className="text-lg text-gray-400">No upcoming renewals</p>
        </div>
      )}
    </div>
  );
}

UpcomingRenewalsCard.propTypes = {
  renewals: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      renewalDate: PropTypes.string,
      price: PropTypes.number,
      frequency: PropTypes.string,
    })
  ),
  api: PropTypes.shape({
    searchSubscriptions: PropTypes.func.isRequired,
    getPopularSearches: PropTypes.func.isRequired,
  }).isRequired,
};

UpcomingRenewalsCard.defaultProps = {
  renewals: [],
};
