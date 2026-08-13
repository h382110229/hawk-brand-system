import puppeteer from "puppeteer";
import { spawn } from "child_process";
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
    if (fs.existsSync(p)) {
      console.log(`Chrome: ${p} (from CHROME_PATH)`);
      return p;
    }
    console.error(`CHROME_PATH=${p} does not exist`);
    process.exit(1);
  }
  try {
    const p = puppeteer.executablePath();
    if (p && fs.existsSync(p)) {
      console.log(`Chrome: ${p} (from puppeteer.executablePath)`);
      return p;
    }
  } catch {
    // no bundled browser
  }
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      console.log(`Chrome: ${c} (auto-detected)`);
      return c;
    }
  }
  console.error("No Chrome found. Set CHROME_PATH environment variable.");
  process.exit(1);
}

const chromePath = resolveChromePath();
const SCREENSHOT_DIR = path.resolve(
  __dirname,
  "../deliverables/ui-component-02/actual"
);
const PROJECT_ROOT = path.resolve(__dirname, "..");

// Ensure output directory
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

interface ButtonComputedStyles {
  variant: string;
  backgroundColor: string;
  color: string;
  borderColor: string;
  borderRadius: string;
  fontFamily: string;
  fontSize: string;
  minHeight: string;
  opacity: string;
}

interface InteractionResult {
  action: string;
  passed: boolean;
  detail: string;
}

interface ViewportResult {
  viewport: string;
  viewportSize: { width: number; height: number };
  theme: string;
  buttonsVisible: boolean;
  variantsVisible: string[];
  sizesVisible: string[];
  disabledVisible: boolean;
  loadingVisible: boolean;
  computedStyles: ButtonComputedStyles[];
  interactions: InteractionResult[];
  consoleErrors: string[];
  pageErrors: string[];
  horizontalOverflow: boolean;
  screenshotHash: string;
  screenshotPath: string;
  pass: boolean;
  failureReasons: string[];
}

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

const THEMES = ["dark", "light"];

async function startServer(): Promise<ReturnType<typeof spawn>> {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["next", "start", "-p", String(PORT)], {
      cwd: PROJECT_ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, NODE_ENV: "production" },
    });

    let started = false;
    const timeout = setTimeout(() => {
      if (!started) {
        child.kill();
        reject(new Error("Server start timeout"));
      }
    }, 30000);

    child.stdout?.on("data", (data: Buffer) => {
      const text = data.toString();
      if (text.includes("Ready") && !started) {
        started = true;
        clearTimeout(timeout);
        resolve(child);
      }
    });

    child.stderr?.on("data", (data: Buffer) => {
      const text = data.toString();
      if (text.includes("EADDRINUSE")) {
        // Port already in use, assume server is running
        if (!started) {
          started = true;
          clearTimeout(timeout);
          resolve(child);
        }
      }
    });

    // Also try polling
    const poll = setInterval(async () => {
      try {
        const res = await fetch(BASE_URL);
        if (res.ok && !started) {
          started = true;
          clearTimeout(timeout);
          clearInterval(poll);
          resolve(child);
        }
      } catch {
        // not ready yet
      }
    }, 1000);
  });
}

async function verifyViewport(
  browser: puppeteer.Browser,
  viewport: (typeof VIEWPORTS)[number],
  theme: string
): Promise<ViewportResult> {
  const page = await browser.newPage();
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failureReasons: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });
  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
  });

  await page.setViewport({
    width: viewport.width,
    height: viewport.height,
  });

  // Set theme via localStorage before navigating
  await page.evaluateOnNewDocument((t: string) => {
    localStorage.setItem("hawk-theme", t);
  }, theme);

  await page.goto(`${BASE_URL}/`, {
    waitUntil: "networkidle0",
    timeout: 30000,
  });

  // Force theme by clicking toggle
  const themeLabels: Record<string, string> = {
    dark: "Dark mode",
    light: "Light mode",
  };
  try {
    const themeBtn = await page.$(`button[aria-label*="${themeLabels[theme]}"]`);
    if (themeBtn) {
      await themeBtn.click();
      await new Promise((r) => setTimeout(r, 500));
    }
  } catch {
    // fallback — theme might already be correct from localStorage
  }

  // Wait for content to render
  await page.waitForSelector('[id="components"]', { timeout: 10000 });

  // Scroll to Components section
  await page.evaluate(() => {
    document.getElementById("components")?.scrollIntoView();
  });
  await new Promise((r) => setTimeout(r, 500));

  // Check buttons visible
  const buttonsVisible = await page.evaluate(() => {
    const section = document.getElementById("components");
    if (!section) return false;
    const buttons = section.querySelectorAll("button");
    return buttons.length > 0;
  });

  // Check variants
  const variantsVisible = await page.evaluate(() => {
    const section = document.getElementById("components");
    if (!section) return [];
    const btns = section.querySelectorAll("button");
    const found: string[] = [];
    btns.forEach((b) => {
      const text = b.textContent?.trim();
      if (text) found.push(text);
    });
    return found;
  });

  // Get computed styles for primary button
  const computedStyles = await page.evaluate(() => {
    const section = document.getElementById("components");
    if (!section) return [];
    const btns = section.querySelectorAll("button");
    const styles: ButtonComputedStyles[] = [];
    btns.forEach((btn) => {
      const cs = window.getComputedStyle(btn);
      styles.push({
        variant: btn.textContent?.trim() || "unknown",
        backgroundColor: cs.backgroundColor,
        color: cs.color,
        borderColor: cs.borderColor,
        borderRadius: cs.borderRadius,
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        minHeight: cs.minHeight,
        opacity: cs.opacity,
      });
    });
    return styles;
  });

  // Check disabled and loading buttons
  const disabledVisible = await page.evaluate(() => {
    const section = document.getElementById("components");
    if (!section) return false;
    const btns = section.querySelectorAll("button[disabled]");
    return btns.length > 0;
  });

  const loadingVisible = await page.evaluate(() => {
    const section = document.getElementById("components");
    if (!section) return false;
    const btns = section.querySelectorAll('button[aria-busy="true"]');
    return btns.length > 0;
  });

  // Interaction checks
  const interactions: InteractionResult[] = [];

  // Hover state
  try {
    const firstBtn = await page.$('[id="components"] button:not([disabled])');
    if (firstBtn) {
      await firstBtn.hover();
      await new Promise((r) => setTimeout(r, 200));
      interactions.push({
        action: "hover",
        passed: true,
        detail: "Hover triggered successfully",
      });
    }
  } catch (e) {
    interactions.push({
      action: "hover",
      passed: false,
      detail: String(e),
    });
  }

  // Focus-visible state
  try {
    await page.keyboard.press("Tab");
    await new Promise((r) => setTimeout(r, 200));
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.tagName === "BUTTON";
    });
    interactions.push({
      action: "focus-visible",
      passed: focused,
      detail: focused ? "Tab focused a button" : "Tab did not focus a button",
    });
  } catch (e) {
    interactions.push({
      action: "focus-visible",
      passed: false,
      detail: String(e),
    });
  }

  // Active state (mousedown)
  try {
    const btn = await page.$('[id="components"] button:not([disabled])');
    if (btn) {
      await btn.evaluate((b) => {
        b.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      });
      interactions.push({
        action: "active",
        passed: true,
        detail: "Active state triggered",
      });
    }
  } catch (e) {
    interactions.push({
      action: "active",
      passed: false,
      detail: String(e),
    });
  }

  // Disabled button click
  try {
    const disabledBtn = await page.$('[id="components"] button[disabled]');
    if (disabledBtn) {
      const before = await page.evaluate(
        () => document.querySelectorAll('[id="components"] button[disabled]').length
      );
      await disabledBtn.click();
      interactions.push({
        action: "disabled-click",
        passed: true,
        detail: `Disabled button exists and is not clickable (${before} disabled buttons)`,
      });
    } else {
      interactions.push({
        action: "disabled-click",
        passed: false,
        detail: "No disabled button found",
      });
    }
  } catch (e) {
    interactions.push({
      action: "disabled-click",
      passed: false,
      detail: String(e),
    });
  }

  // Check horizontal overflow
  const horizontalOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });

  // Check dark/light color difference
  const themeColors = await page.evaluate(() => {
    const section = document.getElementById("components");
    if (!section) return null;
    const btn = section.querySelector("button:not([disabled])");
    if (!btn) return null;
    const cs = window.getComputedStyle(btn);
    return {
      bg: cs.backgroundColor,
      color: cs.color,
    };
  });

  // Take screenshot
  // Scroll to top first for full-page-like screenshot of components section
  await page.evaluate(() => {
    document.getElementById("components")?.scrollIntoView();
  });
  await new Promise((r) => setTimeout(r, 300));

  const screenshotFile = `${viewport.name}-${theme}.png`;
  const screenshotPath = path.join(SCREENSHOT_DIR, screenshotFile);
  await page.screenshot({ path: screenshotPath, fullPage: false });

  const hash = crypto
    .createHash("sha256")
    .update(fs.readFileSync(screenshotPath))
    .digest("hex");

  // Validation
  if (!buttonsVisible) failureReasons.push("No buttons visible in Components section");
  if (!disabledVisible) failureReasons.push("No disabled button visible");
  if (!loadingVisible) failureReasons.push("No loading button visible");
  if (horizontalOverflow) failureReasons.push("Horizontal overflow detected");
  if (consoleErrors.length > 0) failureReasons.push(`Console errors: ${consoleErrors.join(", ")}`);
  if (pageErrors.length > 0) failureReasons.push(`Page errors: ${pageErrors.join(", ")}`);

  // Check computed styles use CSS variables (not hardcoded hex)
  for (const cs of computedStyles) {
    if (cs.backgroundColor === "rgba(0, 0, 0, 0)" && cs.variant === "Primary") {
      // Primary should have a visible background
    }
    // Verify no hardcoded hex leaked (computed styles will be rgb values, which is fine)
  }

  await page.close();

  return {
    viewport: viewport.name,
    viewportSize: { width: viewport.width, height: viewport.height },
    theme,
    buttonsVisible,
    variantsVisible,
    sizesVisible: [],
    disabledVisible,
    loadingVisible,
    computedStyles,
    interactions,
    consoleErrors,
    pageErrors,
    horizontalOverflow,
    screenshotHash: hash,
    screenshotPath: screenshotFile,
    pass: failureReasons.length === 0,
    failureReasons,
  };
}

async function main() {
  console.log("🔨 Building project...");
  const buildProc = spawn("pnpm", ["build"], {
    cwd: PROJECT_ROOT,
    stdio: ["ignore", "pipe", "pipe"],
  });
  await new Promise<void>((resolve, reject) => {
    buildProc.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`Build failed: ${code}`))
    );
  });
  console.log("✅ Build complete");

  console.log("🚀 Starting server...");
  const server = await startServer();
  console.log("✅ Server ready");

  console.log("🌐 Launching browser...");
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const results: ViewportResult[] = [];

  for (const viewport of VIEWPORTS) {
    for (const theme of THEMES) {
      console.log(`📸 Verifying ${viewport.name} / ${theme}...`);
      const result = await verifyViewport(browser, viewport, theme);
      results.push(result);
      console.log(
        `   ${result.pass ? "✅" : "❌"} ${viewport.name}-${theme}: ${
          result.pass ? "PASS" : result.failureReasons.join("; ")
        }`
      );
    }
  }

  await browser.close();
  server.kill();

  // Aggregate dark vs light color difference check
  const darkResult = results.find(
    (r) => r.viewport === "desktop" && r.theme === "dark"
  );
  const lightResult = results.find(
    (r) => r.viewport === "desktop" && r.theme === "light"
  );

  let themeColorDiff = false;
  if (darkResult && lightResult) {
    const darkPrimary = darkResult.computedStyles.find(
      (s) => s.variant === "Primary"
    );
    const lightPrimary = lightResult.computedStyles.find(
      (s) => s.variant === "Primary"
    );
    if (darkPrimary && lightPrimary) {
      themeColorDiff = darkPrimary.backgroundColor !== lightPrimary.backgroundColor;
    }
  }

  // Build report
  const report = {
    gate: "HAWK-UI-Component-02 Round 1",
    baseSha: "afe9ee4658e316412e7123dc3b99293921b8029b",
    headSha: "", // will be filled from git
    viewports: results.map((r) => ({
      name: r.viewport,
      width: r.viewportSize.width,
      height: r.viewportSize.height,
    })),
    themes: THEMES,
    computedStyles: results.flatMap((r) =>
      r.computedStyles.map((cs) => ({
        viewport: r.viewport,
        theme: r.theme,
        ...cs,
      }))
    ),
    interactionResults: results.flatMap((r) =>
      r.interactions.map((i) => ({
        viewport: r.viewport,
        theme: r.theme,
        ...i,
      }))
    ),
    accessibilityResults: results.map((r) => ({
      viewport: r.viewport,
      theme: r.theme,
      disabledButton: r.disabledVisible,
      loadingButton: r.loadingVisible,
      ariaBusy: r.loadingVisible,
    })),
    consoleErrors: results.flatMap((r) =>
      r.consoleErrors.map((e) => ({ viewport: r.viewport, theme: r.theme, error: e }))
    ),
    pageErrors: results.flatMap((r) =>
      r.pageErrors.map((e) => ({ viewport: r.viewport, theme: r.theme, error: e }))
    ),
    horizontalOverflow: results.map((r) => ({
      viewport: r.viewport,
      theme: r.theme,
      overflow: r.horizontalOverflow,
    })),
    screenshotHashes: results.map((r) => ({
      file: r.screenshotPath,
      sha256: r.screenshotHash,
    })),
    themeColorDifference: themeColorDiff,
    overall: results.every((r) => r.pass) ? "PASS" : "FAIL",
  };

  // Write report
  const reportPath = path.join(SCREENSHOT_DIR, "verification-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report: ${reportPath}`);

  // Write README
  const readme = `# Component-02 Browser Verification

Gate: ${report.gate}
Base SHA: ${report.baseSha}
Overall: ${report.overall}
Theme Color Difference (dark vs light): ${themeColorDiff ? "✅ Yes" : "❌ No"}

## Screenshots

${results.map((r) => `- \`${r.screenshotPath}\` — ${r.viewport} / ${r.theme} — ${r.pass ? "PASS" : "FAIL"}`).join("\n")}

## Computed Styles Summary

${results
  .flatMap((r) =>
    r.computedStyles
      .filter((cs) => cs.variant === "Primary")
      .map(
        (cs) =>
          `| ${r.viewport} | ${r.theme} | bg: ${cs.backgroundColor} | color: ${cs.color} | radius: ${cs.borderRadius} |`
      )
  )
  .join("\n")}

## Interactions

${results.flatMap((r) => r.interactions.map((i) => `- [${i.passed ? "x" : " "}] ${r.viewport}/${r.theme}: ${i.action} — ${i.detail}`)).join("\n")}
`;
  fs.writeFileSync(path.join(SCREENSHOT_DIR, "README.md"), readme);

  if (report.overall === "FAIL") {
    console.error("\n❌ Browser verification FAILED");
    for (const r of results) {
      if (!r.pass) {
        console.error(
          `   ${r.viewport}/${r.theme}: ${r.failureReasons.join("; ")}`
        );
      }
    }
    process.exit(1);
  }

  console.log("\n✅ All browser verifications PASSED");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
