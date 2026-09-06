import React, { createContext, useContext, useState, useEffect } from "react";

export type AppTheme = "obsidian" | "titanium";

interface ThemeContextType {
  theme: AppTheme;
  isDark: boolean;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem("redox_app_theme");
    return saved === "titanium" ? "titanium" : "obsidian";
  });

  const triggerThemeAnimation = () => {
    const root = document.documentElement;
    root.classList.add("theme-transitioning");
    setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, 400);
  };

  const setTheme = (newTheme: AppTheme) => {
    triggerThemeAnimation();
    setThemeState(newTheme);
    localStorage.setItem("redox_app_theme", newTheme);
  };

  const toggleTheme = () => {
    triggerThemeAnimation();
    setThemeState((prev) => (prev === "obsidian" ? "titanium" : "obsidian"));
  };

  const isDark = theme === "obsidian";

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
      document.body.style.backgroundColor = "#000000";
      document.body.style.color = "#ffffff";
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
      document.body.style.backgroundColor = "#ffffff";
      document.body.style.color = "#000000";
    }
  }, [theme, isDark]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
