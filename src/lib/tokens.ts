export type Theme = "light" | "dark" | "system";

export function getTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem("hawk-theme") as Theme | null;
  return stored ?? "system";
}

export function setTheme(theme: Theme) {
  localStorage.setItem("hawk-theme", theme);
  applyTheme(theme);
}

export function applyTheme(theme: Theme) {
  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;
  document.documentElement.setAttribute("data-theme", resolved);
}

export function getResolvedTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const theme = getTheme();
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}
