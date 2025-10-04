import { usePreferences } from "./usePreferences";

export const useCurrency = () => {
  const { currency, setCurrency } = usePreferences();
  return { currency, setCurrency };
};
