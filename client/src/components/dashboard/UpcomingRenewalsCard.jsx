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
    <div className="dashboard-card">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-primary">
            {isShowingSearch ? "Search Results" : "Upcoming Renewals"}
          </h2>
          <p className="text-sm text-secondary">
            {isShowingSearch
              ? "Adjust your search to discover more subscriptions."
              : "Keep an eye on the next renewals and explore your library effortlessly."}
          </p>
        </div>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-600">
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
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
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
              className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                
                <div>
                  <p className="text-lg font-semibold text-primary transition-colors group-hover:text-blue-600">
                    {renewal.name}
                  </p>
                  <p className="text-sm text-secondary">
                    {formatDate(renewal.renewalDate)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-blue-600">
                  {formatCurrency(renewal.price)}
                </p>
                <p className="text-sm font-medium text-secondary">
                  {renewal.frequency}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100">
            <span className="text-3xl">📅</span>
          </div>
          <p className="text-lg text-secondary">No upcoming renewals</p>
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
