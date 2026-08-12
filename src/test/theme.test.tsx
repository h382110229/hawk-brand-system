import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("Theme Toggle", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("renders all three theme options", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    expect(screen.getByLabelText("Switch to Light mode")).toBeInTheDocument();
    expect(screen.getByLabelText("Switch to Dark mode")).toBeInTheDocument();
    expect(screen.getByLabelText("Switch to System mode")).toBeInTheDocument();
  });

  it("sets data-theme attribute when clicking Dark", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByLabelText("Switch to Dark mode"));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("sets data-theme attribute when clicking Light", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByLabelText("Switch to Light mode"));
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("persists theme to localStorage", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByLabelText("Switch to Dark mode"));
    expect(localStorage.getItem("hawk-theme")).toBe("dark");
  });
});
