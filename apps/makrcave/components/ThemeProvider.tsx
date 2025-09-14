'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): "light" | "dark" {
  return typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(
    () => (typeof window !== "undefined" ? (localStorage.getItem("makrcave-theme") as Theme) : null) || "dark",
  );
  const [system, setSystem] = useState<"light" | "dark">(() =>
    typeof window !== "undefined" ? getSystemTheme() : "dark",
  );

  // React to system theme changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setSystem(getSystemTheme());
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  const resolvedTheme: "light" | "dark" = theme === "system" ? system : theme;

  // Apply theme to document
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const root = document.documentElement;
    const body = document.body;
    
    // Remove all theme classes
    root.classList.remove("dark", "light");
    body.classList.remove("theme-dark", "theme-light");
    
    // Add resolved theme classes
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
      body.classList.add("theme-dark");
    } else {
      root.classList.add("light");
      body.classList.add("theme-light");
    }
    
    // Set data attribute for CSS targeting
    root.setAttribute("data-theme", resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  // Persist theme preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("makrcave-theme", theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("system");
    } else {
      setTheme("dark");
    }
  };

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, resolvedTheme }),
    [theme, resolvedTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}