import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children, userId }) => {
  const [theme, setTheme] = useState("light");
  const [isLoading, setIsLoading] = useState(true);
  const [systemTheme, setSystemTheme] = useState("light");

  // Detect system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");

    const handleSystemThemeChange = (e) => {
      const newSystemTheme = e.matches ? "light" : "dark";
      setSystemTheme(newSystemTheme);

      // If user preference is 'auto', update theme
      if (theme === "auto") {
        applyTheme(newSystemTheme);
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    setSystemTheme(mediaQuery.matches ? "light" : "dark");

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [theme]);

  // Load user theme preference
  useEffect(() => {
    loadUserTheme();
  }, [userId]);

  const loadUserTheme = async () => {
    try {
      setIsLoading(true);
      // For now, use localStorage. In production, this would be an API call
      const savedTheme = localStorage.getItem("userTheme") || "light";
      setTheme(savedTheme);

      // Apply the actual theme (handle 'auto' case)
      const actualTheme = savedTheme === "auto" ? systemTheme : savedTheme;
      applyTheme(actualTheme);
    } catch (error) {
      console.error("Failed to load user theme:", error);
      setTheme("light");
      applyTheme("light");
    } finally {
      setIsLoading(false);
    }
  };

  const applyTheme = (themeToApply) => {
    const root = document.documentElement;
    const body = document.body;

    // Normalize class state
    root.classList.remove("theme-dark", "theme-light", "dark", "light");
    body.classList.remove("dark", "light");

    // Determine class tokens
    const normalizedTheme = themeToApply === "dark" ? "dark" : "light";

    root.classList.add(`theme-${normalizedTheme}`, normalizedTheme);
    body.classList.add(normalizedTheme);

    // Set data attribute for CSS and JS access
    root.setAttribute("data-theme", normalizedTheme);

    // Update meta theme-color for mobile browsers
    updateThemeColorMeta(normalizedTheme);
  };

  const updateThemeColorMeta = (theme) => {
    const themeColor = theme === "dark" ? "#0f172a" : "#ffffff";
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.name = "theme-color";
      document.head.appendChild(metaThemeColor);
    }

    metaThemeColor.content = themeColor;
  };

  const changeTheme = async (newTheme) => {
    try {
      setTheme(newTheme);

      // Apply the actual theme (handle 'auto' case)
      const actualTheme = newTheme === "auto" ? systemTheme : newTheme;
      applyTheme(actualTheme);

      // Save to localStorage (in production, this would be an API call)
      localStorage.setItem("userTheme", newTheme);

      // Analytics
      trackThemeChange(newTheme);
    } catch (error) {
      console.error("Failed to save theme:", error);
      // Revert on error
      loadUserTheme();
    }
  };

  const trackThemeChange = (newTheme) => {
    // Send to analytics service
    if (window.gtag) {
      window.gtag("event", "theme_change", {
        theme: newTheme,
        user_id: userId,
      });
    }
  };

  const getActualTheme = () => {
    return theme === "auto" ? systemTheme : theme;
  };

  const value = {
    theme,
    systemTheme,
    actualTheme: getActualTheme(),
    changeTheme,
    isLoading,
    themes: ["light", "dark", "auto"],
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
