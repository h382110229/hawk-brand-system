import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const TOKENS_DIR = path.resolve(__dirname, "../../tokens");
const CSS_FILE = path.resolve(__dirname, "../../src/styles/generated-tokens.css");
const PAGE_FILE = path.resolve(__dirname, "../../src/app/page.tsx");

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

describe("CSS variable namespacing", () => {
  it("generated CSS has no duplicate variable names within same selector", () => {
    const css = fs.readFileSync(CSS_FILE, "utf-8");
    // Split into selector blocks and check each block independently
    const blocks = css.split(/(?=\[data-theme|@media|:root)/);
    for (const block of blocks) {
      const varRegex = /--([a-zA-Z0-9-]+)\s*:/g;
      const names = new Set<string>();
      const duplicates: string[] = [];
      let match;
      while ((match = varRegex.exec(block)) !== null) {
        const name = match[1];
        if (names.has(name)) {
          duplicates.push(name);
        }
        names.add(name);
      }
      if (duplicates.length > 0) {
        expect.fail(`Duplicates in block: ${duplicates.join(", ")}`);
      }
    }
  });

  it("no bare --sm, --md, --lg, --none without namespace", () => {
    const css = fs.readFileSync(CSS_FILE, "utf-8");
    const bareNames = ["--sm:", "--md:", "--lg:", "--none:", "--0:", "--1:", "--2:", "--3:", "--4:", "--6:", "--8:", "--12:", "--16:", "--24:", "--32:"];
    for (const bare of bareNames) {
      // Allow --breakpoint-sm, --radius-md, etc. but not bare --sm
      const regex = new RegExp(`(?<![a-zA-Z-])${bare.replace(":", "\\s*:")}`, "gm");
      const matches = css.match(regex);
      if (matches) {
        expect.fail(`Found bare variable ${bare} in generated CSS`);
      }
    }
  });

  it("all var(--...) references in page.tsx exist in generated CSS", () => {
    const page = fs.readFileSync(PAGE_FILE, "utf-8");
    const css = fs.readFileSync(CSS_FILE, "utf-8");

    // Extract all var(--xxx) references from page.tsx
    const varRefRegex = /var\(--([a-zA-Z0-9-]+)[,)]/g;
    const refs = new Set<string>();
    let match;
    while ((match = varRefRegex.exec(page)) !== null) {
      refs.add(match[1]);
    }

    // Extract all defined variable names from CSS
    const varDefRegex = /--([a-zA-Z0-9-]+)\s*:/g;
    const defined = new Set<string>();
    while ((match = varDefRegex.exec(css)) !== null) {
      defined.add(match[1]);
    }

    // Check each reference exists
    const missing: string[] = [];
    for (const ref of [...refs]) {
      if (!defined.has(ref)) {
        missing.push(ref);
      }
    }
    expect(missing).toEqual([]);
  });

  it("no #TODO values in generated CSS", () => {
    const css = fs.readFileSync(CSS_FILE, "utf-8");
    expect(css).not.toContain("#TODO");
  });

  it("all CSS variable names have namespace prefix", () => {
    const css = fs.readFileSync(CSS_FILE, "utf-8");
    const varDefRegex = /--([a-zA-Z0-9-]+)\s*:/g;
    const validPrefixes = [
      "color-", "font-family-", "font-size-", "font-weight-",
      "line-height-", "letter-spacing-", "spacing-", "radius-",
      "motion-duration-", "motion-easing-", "elevation-", "breakpoint-",
    ];
    const unnamespaced: string[] = [];
    let match;
    while ((match = varDefRegex.exec(css)) !== null) {
      const name = match[1];
      const hasPrefix = validPrefixes.some((p) => name.startsWith(p));
      if (!hasPrefix) {
        unnamespaced.push(name);
      }
    }
    expect(unnamespaced).toEqual([]);
  });

  it("generate twice produces identical output", () => {
    const css1 = fs.readFileSync(CSS_FILE, "utf-8");
    // Re-run the build script
    // execSync imported at top level
    execSync("npx tsx scripts/build-tokens.ts", {
      cwd: path.resolve(__dirname, "../.."),
      stdio: "pipe",
    });
    const css2 = fs.readFileSync(CSS_FILE, "utf-8");
    expect(css1).toBe(css2);
  });
});
