import { useCallback, useEffect, useMemo, useState } from "react";
import { useCurrency } from "../../../hooks/useCurrency";
import { FREQUENCY_LABELS } from "../constants/frequency";
import {
  buildPaymentSchedule,
  calculateMonthlyPrice,
  computeRiskProfile,
} from "../utils/metrics";

export const useSubscriptionDetails = (subscriptionId, api) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscription = useCallback(async () => {
    if (!api) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.getSubscriptions();
      const record = response?.data?.find(
        (item) => item._id === subscriptionId
      );

      if (!record) {
        setError(
          "We couldn't locate that subscription. It may have been deleted or updated."
        );
        setSubscription(null);
        return;
      }

      setSubscription(record);
    } catch (err) {
      setError(err.message ?? "Unable to load subscription details");
    } finally {
      setLoading(false);
    }
  }, [api, subscriptionId]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const { currency: defaultCurrency } = useCurrency();

  const monthlyPrice = useMemo(
    () => calculateMonthlyPrice(subscription),
    [subscription]
  );

  const paymentSchedule = useMemo(
    () => buildPaymentSchedule(subscription, defaultCurrency),
    [subscription, defaultCurrency]
  );

  const riskProfile = useMemo(
    () =>
      computeRiskProfile(
        subscription,
        paymentSchedule,
        monthlyPrice,
        defaultCurrency
      ),
    [subscription, paymentSchedule, monthlyPrice, defaultCurrency]
  );

  const frequencyLabel = subscription?.frequency
    ? FREQUENCY_LABELS[subscription.frequency] ?? subscription.frequency
    : null;

  return {
    subscription,
    loading,
    error,
    refresh: fetchSubscription,
    defaultCurrency,
    monthlyPrice,
    paymentSchedule,
    riskProfile,
    frequencyLabel,
  };
};
