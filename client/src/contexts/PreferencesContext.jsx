import { createContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_CURRENCY } from "../constants/preferences.js";
const STORAGE_KEY = "renewly:preferences";

const PreferencesContext = createContext({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
});

export function PreferencesProvider({ children }) {
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.currency) {
          setCurrency(parsed.currency);
        }
      }
    } catch (error) {
      console.warn("Failed to read preferences from storage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ currency }));
    } catch (error) {
      console.warn("Failed to persist preferences", error);
    }
  }, [currency]);

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
    }),
    [currency]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export { PreferencesContext };
