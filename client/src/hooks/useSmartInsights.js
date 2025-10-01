import { useState, useEffect, useCallback, useRef } from "react";

const PERIOD_OPTIONS = ["7d", "30d", "90d", "1y"];

export const useSmartInsights = (apiClient, initialPeriod = "30d") => {
  const [period, setPeriod] = useState(initialPeriod);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pollingRef = useRef(null);

  const fetchInsights = useCallback(
    async (overridePeriod, { silent = false } = {}) => {
      if (!apiClient) return;
      const targetPeriod = overridePeriod ?? period;
      if (!silent) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        setError(null);
        const response = await apiClient.getSmartInsights(targetPeriod);
        setInsights(response.data);
      } catch (err) {
        setError(err.message ?? "Unable to load smart insights");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [apiClient, period]
  );

  const changePeriod = useCallback(
    async (nextPeriod) => {
      if (!PERIOD_OPTIONS.includes(nextPeriod)) {
        setPeriod("30d");
        await fetchInsights("30d");
        return;
      }
      setPeriod(nextPeriod);
      await fetchInsights(nextPeriod);
    },
    [fetchInsights]
  );

  useEffect(() => {
    if (!apiClient) return;
    fetchInsights(period);
  }, [apiClient, fetchInsights, period]);

  useEffect(() => {
    if (!apiClient) return undefined;

    pollingRef.current = setInterval(() => {
      fetchInsights(period, { silent: true });
    }, 300000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [apiClient, fetchInsights, period]);

  return {
    insights,
    period,
    setPeriod: changePeriod,
    refetch: fetchInsights,
    loading,
    error,
    isRefreshing,
  };
};

export default useSmartInsights;
