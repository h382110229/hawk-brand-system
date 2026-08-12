import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const TOKENS_DIR = path.resolve(__dirname, "../../tokens");

function readJson(file: string) {
  return JSON.parse(fs.readFileSync(path.join(TOKENS_DIR, file), "utf-8"));
}

function findTodoValues(obj: any, p = ""): string[] {
  const errors: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("$")) continue;
    const fp = p ? `${p}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      if ("$value" in value) {
        if (String((value as any).$value).includes("#TODO")) {
          errors.push(fp);
        }
      } else {
        errors.push(...findTodoValues(value, fp));
      }
    }
  }
  return errors;
}

describe("Token validation", () => {
  const files = [
    "color/dark.json",
    "color/light.json",
    "typography.json",
    "spacing.json",
    "radius.json",
    "motion.json",
    "elevation.json",
    "breakpoint.json",
  ];

  it.each(files)("%s has no #TODO values", (file) => {
    const data = readJson(file);
    const todos = findTodoValues(data);
    expect(todos).toEqual([]);
  });

  it("dark colors have valid hex format", () => {
    const data = readJson("color/dark.json");
    const hex = /^#[0-9A-Fa-f]{6}$/;

    function checkColors(obj: any) {
      for (const [, value] of Object.entries(obj)) {
        if (typeof value === "object" && value !== null) {
          if ("$value" in value && (value as any).$type === "color") {
            expect((value as any).$value).toMatch(hex);
          } else if (!("$value" in value)) {
            checkColors(value);
          }
        }
      }
    }
    checkColors(data.color);
  });

  it("light colors have valid hex format", () => {
    const data = readJson("color/light.json");
    const hex = /^#[0-9A-Fa-f]{6}$/;

    function checkColors(obj: any) {
      for (const [, value] of Object.entries(obj)) {
        if (typeof value === "object" && value !== null) {
          if ("$value" in value && (value as any).$type === "color") {
            expect((value as any).$value).toMatch(hex);
          } else if (!("$value" in value)) {
            checkColors(value);
          }
        }
      }
    }
    checkColors(data.color);
  });

  it("elevation has no embossed token", () => {
    const data = readJson("elevation.json");
    expect(data.elevation.embossed).toBeUndefined();
  });

  it("spacing tokens have px units", () => {
    const data = readJson("spacing.json");
    for (const [, token] of Object.entries(data.spacing)) {
      expect((token as any).$value).toMatch(/px$/);
    }
  });

  it("radius tokens have px units", () => {
    const data = readJson("radius.json");
    for (const [, token] of Object.entries(data.radius)) {
      expect((token as any).$value).toMatch(/px$/);
    }
  });
});
