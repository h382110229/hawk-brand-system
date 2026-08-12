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
      className="flex gap-1 p-1 rounded-[var(--radius-full)] bg-[var(--background-secondary)] border border-[var(--border-default)]"
      role="group"
      aria-label="Theme selection"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          aria-pressed={theme === opt.value}
          aria-label={`${opt.label} mode${theme === opt.value ? " (active)" : ""}`}
          className={`px-3 py-1.5 rounded-[var(--radius-full)] border-none cursor-pointer text-[var(--fontSize-sm)] text-[var(--text-primary)] transition-all duration-[var(--duration-normal)] ease-[var(--easing-default)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)] ${
            theme === opt.value
              ? "bg-[var(--background-tertiary)]"
              : "bg-transparent hover:bg-[var(--background-tertiary)]"
          }`}
        >
          {opt.icon} {opt.label}
        </button>
      ))}
    </div>
  );
}
