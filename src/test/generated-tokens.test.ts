import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const TOKENS_DIR = path.resolve(__dirname, "../../tokens");
const GENERATED_FILE = path.resolve(
  __dirname,
  "../../src/lib/generated-token-data.ts"
);

interface TokenValue {
  $value: string | number;
  $type: string;
  $description?: string;
}

interface TokenGroup {
  [key: string]: TokenValue | TokenGroup;
}

function readJson(file: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(TOKENS_DIR, file), "utf-8"));
}

function getTokenValue(obj: TokenGroup, ...path: string[]): string | number {
  let current: TokenGroup | TokenValue = obj;
  for (const key of path) {
    current = (current as TokenGroup)[key] as TokenGroup | TokenValue;
  }
  return (current as TokenValue).$value;
}

describe("Generated token data", () => {
  it("generated-token-data.ts exists", () => {
    expect(fs.existsSync(GENERATED_FILE)).toBe(true);
  });

  it("generated file contains COLORS_DARK export", () => {
    const content = fs.readFileSync(GENERATED_FILE, "utf-8");
    expect(content).toContain("export const COLORS_DARK");
  });

  it("generated file contains COLORS_LIGHT export", () => {
    const content = fs.readFileSync(GENERATED_FILE, "utf-8");
    expect(content).toContain("export const COLORS_LIGHT");
  });

  it("dark colors match token JSON values", () => {
    const content = fs.readFileSync(GENERATED_FILE, "utf-8");
    const darkColors = readJson("color/dark.json") as TokenGroup;
    // Check that primary color value appears in generated file
    const brandPrimary = getTokenValue(darkColors, "color", "brand", "primary");
    const bgPrimary = getTokenValue(darkColors, "color", "background", "primary");
    const textPrimary = getTokenValue(darkColors, "color", "text", "primary");
    expect(content).toContain(String(brandPrimary));
    expect(content).toContain(String(bgPrimary));
    expect(content).toContain(String(textPrimary));
  });

  it("light colors match token JSON values", () => {
    const content = fs.readFileSync(GENERATED_FILE, "utf-8");
    const lightColors = readJson("color/light.json") as TokenGroup;
    const brandPrimary = getTokenValue(lightColors, "color", "brand", "primary");
    const bgPrimary = getTokenValue(lightColors, "color", "background", "primary");
    const textPrimary = getTokenValue(lightColors, "color", "text", "primary");
    expect(content).toContain(String(brandPrimary));
    expect(content).toContain(String(bgPrimary));
    expect(content).toContain(String(textPrimary));
  });

  it("spacing tokens match JSON values", () => {
    const content = fs.readFileSync(GENERATED_FILE, "utf-8");
    const spacing = readJson("spacing.json") as TokenGroup;
    const spacingGroup = spacing.spacing as TokenGroup;
    for (const [, token] of Object.entries(spacingGroup)) {
      if (typeof token === "object" && token !== null && "$value" in token) {
        expect(content).toContain(String((token as TokenValue).$value));
      }
    }
  });

  it("radius tokens match JSON values", () => {
    const content = fs.readFileSync(GENERATED_FILE, "utf-8");
    const radius = readJson("radius.json") as TokenGroup;
    const radiusGroup = radius.radius as TokenGroup;
    for (const [, token] of Object.entries(radiusGroup)) {
      if (typeof token === "object" && token !== null && "$value" in token) {
        expect(content).toContain(String((token as TokenValue).$value));
      }
    }
  });

  it("elevation tokens match JSON values", () => {
    const content = fs.readFileSync(GENERATED_FILE, "utf-8");
    const elevation = readJson("elevation.json") as TokenGroup;
    const elevationGroup = elevation.elevation as TokenGroup;
    for (const [, token] of Object.entries(elevationGroup)) {
      if (typeof token === "object" && token !== null && "$value" in token) {
        const val = String((token as TokenValue).$value);
        expect(content).toContain(val === "none" ? '"none"' : val);
      }
    }
  });

  it("font size tokens match JSON values", () => {
    const content = fs.readFileSync(GENERATED_FILE, "utf-8");
    const typography = readJson("typography.json") as TokenGroup;
    const fontSizeGroup = typography.fontSize as TokenGroup;
    for (const [, token] of Object.entries(fontSizeGroup)) {
      if (typeof token === "object" && token !== null && "$value" in token) {
        expect(content).toContain(String((token as TokenValue).$value));
      }
    }
  });

  it("font weight tokens match JSON values", () => {
    const content = fs.readFileSync(GENERATED_FILE, "utf-8");
    const typography = readJson("typography.json") as TokenGroup;
    const fontWeightGroup = typography.fontWeight as TokenGroup;
    for (const [, token] of Object.entries(fontWeightGroup)) {
      if (typeof token === "object" && token !== null && "$value" in token) {
        expect(content).toContain(String((token as TokenValue).$value));
      }
    }
  });
});
