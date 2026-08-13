import puppeteer from "puppeteer";
import { spawn, spawnSync } from "child_process";
import * as crypto from "crypto";
import * as fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3003;
const BASE_URL = `http://localhost:${PORT}`;

function resolveChromePath(): string {
  if (process.env.CHROME_PATH) {
    const p = process.env.CHROME_PATH;
    if (fs.existsSync(p)) return p;
    console.error(`CHROME_PATH=${p} does not exist`);
    process.exit(1);
  }
  try {
    const p = puppeteer.executablePath();
    if (p && fs.existsSync(p)) return p;
  } catch {}
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  console.error("No Chrome found.");
  process.exit(1);
}

const chromePath = resolveChromePath();
const SCREENSHOT_DIR = path.resolve(__dirname, "../deliverables/ui-component-02b-input/actual");
const PROJECT_ROOT = path.resolve(__dirname, "..");
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

function getHeadSha(): string {
  try {
    const result = spawnSync("git", ["rev-parse", "HEAD"], { cwd: PROJECT_ROOT });
    return result.stdout?.toString().trim() ?? "";
  } catch { return ""; }
}

function rgbToHex(rgb: string): string {
  const m = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!m) return "#000000";
  return "#" + [m[1], m[2], m[3]].map(n => parseInt(n).toString(16).padStart(2, "0")).join("");
}

function srgbLum(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lin = (c: number) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(c1: string, c2: string): number {
  const l1 = srgbLum(c1), l2 = srgbLum(c2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

async function startServer(): Promise<ReturnType<typeof spawn>> {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["next", "start", "-p", String(PORT)], {
      cwd: PROJECT_ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, NODE_ENV: "production" },
    });
    let started = false;
    const timeout = setTimeout(() => {
      if (!started) { child.kill(); reject(new Error("Server start timeout")); }
    }, 30000);
    const poll = setInterval(async () => {
      try {
        const res = await fetch(BASE_URL);
        if (res.ok && !started) { started = true; clearTimeout(timeout); clearInterval(poll); resolve(child); }
      } catch {}
    }, 1000);
  });
}

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet",  width: 768,  height: 1024 },
  { name: "mobile",  width: 390,  height: 844 },
];
const THEMES = ["dark", "light"] as const;

interface VerificationResult {
  viewport: string;
  theme: string;
  inputsVisible: boolean;
  labelsVisible: boolean;
  descriptionVisible: boolean;
  errorVisible: boolean;
  requiredVisible: boolean;
  disabledVisible: boolean;
  readOnlyVisible: boolean;
  sizesVisible: string[];
  computedStyles: { label: string; bg: string; color: string; border: string; radius: string; minH: string; font: string; fontSize: string }[];
  defaultContrast: number;
  defaultContrastPass: boolean;
  focusVisiblePass: boolean;
  hoverPass: boolean;
  disabledPass: boolean;
  readOnlyPass: boolean;
  errorAriaInvalid: boolean;
  errorDescribedBy: boolean;
  labelAssociation: boolean;
  touchTargetsPass: boolean;
  horizontalOverflow: boolean;
  consoleErrors: string[];
  pageErrors: string[];
  reducedMotion: boolean;
  screenshotPath: string;
  screenshotHash: string;
  pass: boolean;
  failureReasons: string[];
}

async function verifyViewport(
  browser: puppeteer.Browser,
  viewport: typeof VIEWPORTS[number],
  theme: string
): Promise<VerificationResult> {
  const page = await browser.newPage();
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failureReasons: string[] = [];

  page.on("console", msg => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", err => pageErrors.push(err.message));

  await page.setViewport({ width: viewport.width, height: viewport.height });
  await page.evaluateOnNewDocument((t: string) => { localStorage.setItem("hawk-theme", t); }, theme);

  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle0", timeout: 30000 });

  // Click theme toggle
  try {
    const btn = await page.$(`button[aria-label*="${theme === "dark" ? "Dark" : "Light"} mode"]`);
    if (btn) { await btn.click(); await new Promise(r => setTimeout(r, 500)); }
  } catch {}

  await page.waitForSelector('[id="input"]', { timeout: 10000 });
  await page.evaluate(() => document.getElementById("input")?.scrollIntoView());
  await new Promise(r => setTimeout(r, 300));

  // Visibility checks
  const inputsVisible = await page.$eval('[id="input"]', el => el.querySelectorAll("input").length > 0);
  const labelsVisible = await page.$eval('[id="input"]', el => el.querySelectorAll("label").length > 0);
  const descriptionVisible = await page.evaluate(() => {
    const section = document.getElementById("input");
    if (!section) return false;
    return !!Array.from(section.querySelectorAll("p")).find(p => p.textContent?.includes("helper text"));
  });
  const errorVisible = await page.evaluate(() => {
    const section = document.getElementById("input");
    if (!section) return false;
    return !!Array.from(section.querySelectorAll("p")).find(p => p.textContent?.includes("required"));
  });
  const requiredVisible = await page.$eval('[id="input"]', el => !!el.querySelector("span[aria-hidden='true']"));
  const disabledVisible = await page.$eval('[id="input"]', el => !!el.querySelector("input[disabled]"));
  const readOnlyVisible = await page.$eval('[id="input"]', el => !!el.querySelector("input[readonly]"));

  // Size check
  const sizesVisible = await page.evaluate(() => {
    const inputs = document.querySelectorAll('[id="input"] input');
    return Array.from(inputs).map(i => getComputedStyle(i).minHeight).filter((v, i, a) => a.indexOf(v) === i);
  });
  const touchTargetsPass = sizesVisible.every(s => parseInt(s) >= 44);

  // Computed styles for different inputs
  const computedStyles = await page.evaluate(() => {
    const inputs = document.querySelectorAll('[id="input"] input');
    return Array.from(inputs).slice(0, 6).map((inp, i) => {
      const cs = getComputedStyle(inp);
      const label = inp.closest("div")?.querySelector("label")?.textContent?.trim() ?? `input-${i}`;
      return {
        label,
        bg: cs.backgroundColor,
        color: cs.color,
        border: cs.borderColor,
        radius: cs.borderRadius,
        minH: cs.minHeight,
        font: cs.fontFamily,
        fontSize: cs.fontSize,
      };
    });
  });

  // Contrast: default input text on background
  const defaultInput = computedStyles.find(s => s.label === "Default");
  const defaultContrast = defaultInput
    ? contrastRatio(rgbToHex(defaultInput.color), rgbToHex(defaultInput.bg))
    : 0;
  const defaultContrastPass = defaultContrast >= 4.5;

  // Focus-visible
  let focusVisiblePass = false;
  try {
    const inp = await page.$('[id="input"] input:not([disabled])');
    if (inp) {
      await inp.focus();
      await new Promise(r => setTimeout(r, 100));
      focusVisiblePass = await page.evaluate(() => {
        const el = document.activeElement;
        if (el?.tagName !== "INPUT") return false;
        const cs = getComputedStyle(el);
        return parseFloat(cs.outlineWidth) >= 2 || cs.boxShadow !== "none";
      });
    }
  } catch {}

  // Hover check (className-based)
  let hoverPass = false;
  try {
    hoverPass = await page.evaluate(() => {
      const inp = document.querySelector('[id="input"] input:not([disabled])');
      if (!inp) return false;
      return inp.className.includes("hover:");
    });
  } catch {}

  // Disabled check
  let disabledPass = false;
  try {
    disabledPass = await page.evaluate(() => {
      const inp = document.querySelector('[id="input"] input[disabled]') as HTMLInputElement | null;
      if (!inp) return false;
      return inp.disabled && getComputedStyle(inp).opacity !== "1";
    });
  } catch {}

  // ReadOnly check
  let readOnlyPass = false;
  try {
    readOnlyPass = await page.evaluate(() => {
      const inp = document.querySelector('[id="input"] input[readonly]') as HTMLInputElement | null;
      if (!inp) return false;
      return inp.readOnly;
    });
  } catch {}

  // Error aria-invalid
  const errorAriaInvalid = await page.evaluate(() => {
    const inputs = document.querySelectorAll('[id="input"] input[aria-invalid="true"]');
    return inputs.length > 0;
  });

  // Error describedby
  const errorDescribedBy = await page.evaluate(() => {
    const inputs = document.querySelectorAll('[id="input"] input[aria-invalid="true"]');
    return Array.from(inputs).every(i => {
      const db = i.getAttribute("aria-describedby") ?? "";
      return db.includes("error");
    });
  });

  // Label association
  const labelAssociation = await page.evaluate(() => {
    const labels = document.querySelectorAll('[id="input"] label');
    return Array.from(labels).every(l => {
      const forAttr = l.getAttribute("for");
      return forAttr && document.getElementById(forAttr)?.tagName === "INPUT";
    });
  });

  // Reduced motion
  const reducedMotion = await page.evaluate(() => {
    const sheets = Array.from(document.styleSheets);
    for (const sheet of sheets) {
      try {
        for (const rule of Array.from(sheet.cssRules)) {
          if (rule instanceof CSSMediaRule && rule.conditionText?.includes("prefers-reduced-motion")) return true;
        }
      } catch {}
    }
    return false;
  });

  // Horizontal overflow
  const horizontalOverflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  );

  // Screenshot
  await page.evaluate(() => document.getElementById("input")?.scrollIntoView());
  await new Promise(r => setTimeout(r, 200));
  const screenshotFile = `${viewport.name}-${theme}.png`;
  const screenshotPath = path.join(SCREENSHOT_DIR, screenshotFile);
  await page.screenshot({ path: screenshotPath, fullPage: false });
  const hash = crypto.createHash("sha256").update(fs.readFileSync(screenshotPath)).digest("hex");

  // Validation
  if (!inputsVisible) failureReasons.push("No inputs visible");
  if (!labelsVisible) failureReasons.push("No labels visible");
  if (!descriptionVisible) failureReasons.push("Description not visible");
  if (!errorVisible) failureReasons.push("Error not visible");
  if (!disabledVisible) failureReasons.push("Disabled not visible");
  if (!readOnlyVisible) failureReasons.push("Read-only not visible");
  if (!touchTargetsPass) failureReasons.push("Touch targets < 44px");
  if (!defaultContrastPass) failureReasons.push(`Text contrast ${defaultContrast.toFixed(2)}:1 < 4.5:1`);
  if (!focusVisiblePass) failureReasons.push("Focus-visible not detected");
  if (!hoverPass) failureReasons.push("Hover class not found");
  if (!disabledPass) failureReasons.push("Disabled state not verified");
  if (!readOnlyPass) failureReasons.push("ReadOnly state not verified");
  if (!errorAriaInvalid) failureReasons.push("aria-invalid missing on error input");
  if (!errorDescribedBy) failureReasons.push("error not in aria-describedby");
  if (!labelAssociation) failureReasons.push("Labels not associated with inputs");
  if (!reducedMotion) failureReasons.push("prefers-reduced-motion not found");
  if (horizontalOverflow) failureReasons.push("Horizontal overflow");
  if (consoleErrors.length > 0) failureReasons.push(`Console errors: ${consoleErrors.join(", ")}`);
  if (pageErrors.length > 0) failureReasons.push(`Page errors: ${pageErrors.join(", ")}`);

  await page.close();

  return {
    viewport: viewport.name,
    theme,
    inputsVisible, labelsVisible, descriptionVisible, errorVisible,
    requiredVisible, disabledVisible, readOnlyVisible,
    sizesVisible,
    computedStyles,
    defaultContrast: +defaultContrast.toFixed(2),
    defaultContrastPass,
    focusVisiblePass, hoverPass, disabledPass, readOnlyPass,
    errorAriaInvalid, errorDescribedBy, labelAssociation,
    touchTargetsPass,
    horizontalOverflow,
    consoleErrors, pageErrors,
    reducedMotion,
    screenshotPath: screenshotFile,
    screenshotHash: hash,
    pass: failureReasons.length === 0,
    failureReasons,
  };
}

async function main() {
  const headSha = getHeadSha();
  console.log(`Head SHA: ${headSha}`);

  console.log("Building...");
  await new Promise<void>((resolve, reject) => {
    const p = spawn("pnpm", ["build"], { cwd: PROJECT_ROOT, stdio: "ignore" });
    p.on("exit", code => code === 0 ? resolve() : reject(new Error(`Build failed: ${code}`)));
  });

  console.log("Starting server...");
  const server = await startServer();

  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--force-prefers-reduced-motion"],
  });

  const results: VerificationResult[] = [];
  for (const viewport of VIEWPORTS) {
    for (const theme of THEMES) {
      console.log(`${viewport.name} / ${theme}...`);
      const r = await verifyViewport(browser, viewport, theme);
      results.push(r);
      console.log(`  ${r.pass ? "PASS" : "FAIL"}`);
    }
  }

  await browser.close();
  server.kill();

  const uniqueViewports = VIEWPORTS.map(v => ({ name: v.name, width: v.width, height: v.height }));

  const report = {
    gate: "HAWK-UI-Component-02B Input Round 1",
    baseSha: "24d8cdb3c6c96d240ca63ed7444f91e0defaaa17",
    headSha,
    viewports: uniqueViewports,
    themes: [...THEMES],
    themeColorDifference: (() => {
      const d = results.find(r => r.viewport === "desktop" && r.theme === "dark");
      const l = results.find(r => r.viewport === "desktop" && r.theme === "light");
      return d && l ? d.computedStyles[0]?.bg !== l.computedStyles[0]?.bg : false;
    })(),
    results: results.map(r => ({
      viewport: r.viewport,
      theme: r.theme,
      visibility: { inputs: r.inputsVisible, labels: r.labelsVisible, description: r.descriptionVisible, error: r.errorVisible, required: r.requiredVisible, disabled: r.disabledVisible, readOnly: r.readOnlyVisible },
      sizes: r.sizesVisible,
      computedStyles: r.computedStyles,
      contrast: { ratio: r.defaultContrast, pass: r.defaultContrastPass },
      interactions: { focusVisible: r.focusVisiblePass, hover: r.hoverPass, disabled: r.disabledPass, readOnly: r.readOnlyPass },
      a11y: { ariaInvalid: r.errorAriaInvalid, errorDescribedBy: r.errorDescribedBy, labelAssociation: r.labelAssociation, reducedMotion: r.reducedMotion },
      layout: { overflow: r.horizontalOverflow, touchTargets: r.touchTargetsPass },
      errors: { console: r.consoleErrors, page: r.pageErrors },
      screenshot: { file: r.screenshotPath, sha256: r.screenshotHash },
      pass: r.pass,
      failureReasons: r.failureReasons,
    })),
    overall: results.every(r => r.pass) ? "PASS" : "FAIL",
  };

  fs.writeFileSync(path.join(SCREENSHOT_DIR, "verification-report.json"), JSON.stringify(report, null, 2));
  console.log(`\nOverall: ${report.overall}`);
  console.log(`Head SHA: ${headSha}`);

  if (report.overall === "FAIL") {
    for (const r of results) {
      if (!r.pass) console.error(`  ${r.viewport}/${r.theme}: ${r.failureReasons.join("; ")}`);
    }
    process.exit(1);
  }

  process.exit(0);
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
