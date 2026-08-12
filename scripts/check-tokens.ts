import * as fs from "fs";
import * as path from "path";

interface CheckResult {
  pass: boolean;
  errors: string[];
}

const COLOR_RE = /^#[0-9A-Fa-f]{6}$/;
const DIMENSION_RE = /^-?[0-9.]+(px|rem|em|%)$/;

function findTodoValues(obj: any, pathStr = ""): string[] {
  const errors: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("$")) continue;
    const fullPath = pathStr ? `${pathStr}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      if ("$value" in value) {
        if (String(value.$value).includes("#TODO")) {
          errors.push(`#TODO found at ${fullPath}`);
        }
      } else {
        errors.push(...findTodoValues(value, fullPath));
      }
    }
  }
  return errors;
}

function validateColors(obj: any, pathStr = ""): string[] {
  const errors: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("$")) continue;
    const fullPath = pathStr ? `${pathStr}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      if ("$value" in value && "$type" in value) {
        const token = value as any;
        if (token.$type === "color" && typeof token.$value === "string") {
          if (!COLOR_RE.test(token.$value)) {
            errors.push(`Invalid color at ${fullPath}: ${token.$value}`);
          }
        }
      } else {
        errors.push(...validateColors(value, fullPath));
      }
    }
  }
  return errors;
}

function validateDimensions(obj: any, pathStr = ""): string[] {
  const errors: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("$")) continue;
    const fullPath = pathStr ? `${pathStr}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      if ("$value" in value && "$type" in value) {
        const token = value as any;
        if (
          token.$type === "dimension" &&
          typeof token.$value === "string" &&
          !DIMENSION_RE.test(token.$value)
        ) {
          errors.push(`Dimension missing unit at ${fullPath}: ${token.$value}`);
        }
      } else {
        errors.push(...validateDimensions(value, fullPath));
      }
    }
  }
  return errors;
}

function findDuplicateNames(obj: any, names = new Set<string>(), pathStr = ""): string[] {
  const errors: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("$")) continue;
    const fullPath = pathStr ? `${pathStr}.${key}` : key;
    if (names.has(key)) {
      errors.push(`Duplicate token name: ${key} at ${fullPath}`);
    }
    names.add(key);
    if (typeof value === "object" && value !== null && !("$value" in value)) {
      errors.push(...findDuplicateNames(value, new Set(), fullPath));
    }
  }
  return errors;
}

function checkTokens(): CheckResult {
  const errors: string[] = [];
  const tokensDir = path.resolve(__dirname, "../tokens");

  const requiredFiles = [
    "color/dark.json",
    "color/light.json",
    "typography.json",
    "spacing.json",
    "radius.json",
    "motion.json",
    "elevation.json",
    "breakpoint.json",
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(tokensDir, file);
    if (!fs.existsSync(filePath)) {
      errors.push(`Missing required token file: ${file}`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // Check for #TODO
    errors.push(...findTodoValues(data, file));

    // Check colors
    errors.push(...validateColors(data, file));

    // Check dimensions
    errors.push(...validateDimensions(data, file));

    // Check duplicates
    errors.push(...findDuplicateNames(data, new Set(), file));
  }

  return { pass: errors.length === 0, errors };
}

const result = checkTokens();
if (result.pass) {
  console.log("✅ All token validations passed!");
  process.exit(0);
} else {
  console.error("❌ Token validation failed:");
  for (const err of result.errors) {
    console.error(`  • ${err}`);
  }
  process.exit(1);
}
