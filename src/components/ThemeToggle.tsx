"use client";

import { useTheme } from "./ThemeProvider";
import { type Theme } from "@/lib/tokens";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options: { value: Theme; label: string; icon: string }[] = [
    { value: "light", label: "Light", icon: "☀️" },
    { value: "dark", label: "Dark", icon: "🌙" },
    { value: "system", label: "System", icon: "💻" },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: "4px",
        padding: "4px",
        borderRadius: "var(--radius-full)",
        background: "var(--background-secondary)",
        border: "1px solid var(--border-default)",
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          aria-label={`Switch to ${opt.label} mode`}
          style={{
            padding: "6px 12px",
            borderRadius: "var(--radius-full)",
            border: "none",
            cursor: "pointer",
            fontSize: "var(--fontSize-sm)",
            background:
              theme === opt.value
                ? "var(--background-tertiary)"
                : "transparent",
            color: "var(--text-primary)",
            transition: "background var(--duration-normal) var(--easing-default)",
          }}
        >
          {opt.icon} {opt.label}
        </button>
      ))}
    </div>
  );
}
