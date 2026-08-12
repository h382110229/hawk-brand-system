"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { type Theme, getTheme, setTheme, applyTheme } from "@/lib/tokens";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolved: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
  resolved: "light",
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getTheme();
    setThemeState(initial);
    applyTheme(initial);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const updateResolved = () => {
      const t = getTheme();
      const r = t === "system" ? (mq.matches ? "dark" : "light") : t;
      setResolved(r);
    };
    updateResolved();
    mq.addEventListener("change", updateResolved);
    setMounted(true);

    return () => mq.removeEventListener("change", updateResolved);
  }, []);

  const handleSetTheme = (t: Theme) => {
    setTheme(t);
    setThemeState(t);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setResolved(t === "system" ? (mq.matches ? "dark" : "light") : t);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}
