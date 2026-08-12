import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const TOKENS_DIR = path.resolve(__dirname, "../../tokens");

interface TokenValue {
  $value: string | number;
  $type: string;
  $description?: string;
}

interface TokenGroup {
  [key: string]: TokenValue | TokenGroup;
}

function readJson(file: string): TokenGroup {
  return JSON.parse(fs.readFileSync(path.join(TOKENS_DIR, file), "utf-8"));
}

function findTodoValues(obj: TokenGroup, p = ""): string[] {
  const errors: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("$")) continue;
    const fp = p ? `${p}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      if ("$value" in value) {
        if (String((value as TokenValue).$value).includes("#TODO")) {
          errors.push(fp);
        }
      } else {
        errors.push(...findTodoValues(value as TokenGroup, fp));
      }
    }
  }
  return errors;
}

function checkColors(obj: TokenGroup): void {
  const hex = /^#[0-9A-Fa-f]{6}$/;
  for (const [, value] of Object.entries(obj)) {
    if (typeof value === "object" && value !== null) {
      if ("$value" in value && (value as TokenValue).$type === "color") {
        expect(String((value as TokenValue).$value)).toMatch(hex);
      } else if (!("$value" in value)) {
        checkColors(value as TokenGroup);
      }
    }
  }
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
    const colorGroup = data.color as TokenGroup;
    checkColors(colorGroup);
  });

  it("light colors have valid hex format", () => {
    const data = readJson("color/light.json");
    const colorGroup = data.color as TokenGroup;
    checkColors(colorGroup);
  });

  it("elevation has no embossed token", () => {
    const data = readJson("elevation.json");
    const elevationGroup = data.elevation as TokenGroup;
    expect(elevationGroup.embossed).toBeUndefined();
  });

  it("spacing tokens have px units", () => {
    const data = readJson("spacing.json");
    const spacingGroup = data.spacing as TokenGroup;
    for (const [, token] of Object.entries(spacingGroup)) {
      if (typeof token === "object" && token !== null && "$value" in token) {
        expect(String((token as TokenValue).$value)).toMatch(/px$/);
      }
    }
  });

  it("radius tokens have px units", () => {
    const data = readJson("radius.json");
    const radiusGroup = data.radius as TokenGroup;
    for (const [, token] of Object.entries(radiusGroup)) {
      if (typeof token === "object" && token !== null && "$value" in token) {
        expect(String((token as TokenValue).$value)).toMatch(/px$/);
      }
    }
  });
});
