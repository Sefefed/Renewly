import { useCallback, useEffect, useMemo, useState } from "react";
import { useCurrency } from "../../../hooks/useCurrency";
import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
} from "../../../utils/formatters";
import { buildPaymentTimeline, computeRiskProfile } from "../utils/insights";

export const useBillDetails = (billId, api) => {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBill = useCallback(async () => {
    if (!api) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.getBills();
      const record = response?.data?.find((item) => item._id === billId);

      if (!record) {
        setError(
          "We couldn't find that bill anymore. Try refreshing your list."
        );
        setBill(null);
        return;
      }

      setBill(record);
    } catch (err) {
      setError(err.message ?? "Unable to load bill details");
    } finally {
      setLoading(false);
    }
  }, [api, billId]);

  useEffect(() => {
    fetchBill();
  }, [fetchBill]);

  const { currency: defaultCurrency } = useCurrency();

  const paymentTimeline = useMemo(
    () => buildPaymentTimeline(bill, defaultCurrency),
    [bill, defaultCurrency]
  );

  const riskProfile = useMemo(
    () => computeRiskProfile(bill, paymentTimeline, defaultCurrency),
    [bill, paymentTimeline, defaultCurrency]
  );

  const amountDisplay = useMemo(() => {
    if (!bill) return null;
    return formatCurrency(bill.amount, bill.currency || defaultCurrency);
  }, [bill, defaultCurrency]);

  const dueDateDisplay = useMemo(() => {
    if (!bill?.dueDate) return "Not set";
    return formatDate(bill.dueDate);
  }, [bill?.dueDate]);

  const dueRelative = useMemo(() => {
    if (!bill?.dueDate) return "";
    return formatRelativeDate(bill.dueDate);
  }, [bill?.dueDate]);

  return {
    bill,
    loading,
    error,
    refresh: fetchBill,
    defaultCurrency,
    paymentTimeline,
    riskProfile,
    amountDisplay,
    dueDateDisplay,
    dueRelative,
  };
};
