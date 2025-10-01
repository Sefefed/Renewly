import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "assistantTheme";
const DEFAULT_THEME = "dark";

const readInitialTheme = () => {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME;
};

const useAssistantTheme = () => {
  const [theme, setTheme] = useState(readInitialTheme);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return {
    theme,
    isDark: theme === "dark",
    toggleTheme,
  };
};

export default useAssistantTheme;
