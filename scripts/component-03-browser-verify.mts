import puppeteer from "puppeteer";
import { spawn, spawnSync } from "child_process";
import * as crypto from "crypto";
import * as fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3004;
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
const SCREENSHOT_DIR = path.resolve(__dirname, "../deliverables/ui-component-03-card/actual");
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
  articlesVisible: boolean;
  elevatedVisible: boolean;
  outlinedVisible: boolean;
  headerVisible: boolean;
  footerVisible: boolean;
  gridVisible: boolean;
  computedStyles: { label: string; bg: string; border: string; radius: string; shadow: string; padding: string }[];
  textContrast: number;
  textContrastPass: boolean;
  semanticArticle: boolean;
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

  // Set theme
  try {
    await page.evaluate((t: string) => {
      document.documentElement.setAttribute("data-theme", t);
    }, theme);
    await new Promise(r => setTimeout(r, 300));
  } catch {}

  await page.waitForSelector('[id="card"]', { timeout: 10000 });
  await page.evaluate(() => document.getElementById("card")?.scrollIntoView());
  await new Promise(r => setTimeout(r, 300));

  // Visibility checks
  const articlesVisible = await page.$eval('[id="card"]', el => el.querySelectorAll("article").length > 0);
  const elevatedVisible = await page.evaluate(() => {
    const articles = document.querySelectorAll('[id="card"] article');
    return Array.from(articles).some(a => a.className.includes("shadow-[var(--elevation-low)]"));
  });
  const outlinedVisible = await page.evaluate(() => {
    const articles = document.querySelectorAll('[id="card"] article');
    return Array.from(articles).some(a => a.className.includes("shadow-none"));
  });
  const headerVisible = await page.$eval('[id="card"]', el => el.querySelectorAll("header").length > 0);
  const footerVisible = await page.$eval('[id="card"]', el => el.querySelectorAll("footer").length > 0);
  const gridVisible = await page.evaluate(() => {
    const section = document.getElementById("card");
    if (!section) return false;
    // Check for the grid container (3 cards in a row)
    const grids = section.querySelectorAll(".grid");
    return grids.length > 0;
  });

  // Semantic HTML
  const semanticArticle = await page.$eval('[id="card"]', el => {
    const articles = el.querySelectorAll("article");
    return articles.length > 0 && Array.from(articles).every(a => a.tagName === "ARTICLE");
  });

  // Computed styles for cards
  const computedStyles = await page.evaluate(() => {
    const articles = document.querySelectorAll('[id="card"] article');
    return Array.from(articles).slice(0, 4).map((article, i) => {
      const cs = getComputedStyle(article);
      const label = article.querySelector("strong")?.textContent?.trim()
        ?? article.querySelector("h4")?.textContent?.trim()
        ?? `card-${i}`;
      return {
        label,
        bg: cs.backgroundColor,
        border: cs.borderColor,
        radius: cs.borderRadius,
        shadow: cs.boxShadow,
        padding: cs.padding,
      };
    });
  });

  // Text contrast: primary text on card background
  const textContrast = await page.evaluate(() => {
    const card = document.querySelector('[id="card"] article');
    if (!card) return 0;
    const cs = getComputedStyle(card);
    // Get a text element inside the card
    const textEl = card.querySelector("p strong") ?? card.querySelector("p");
    if (!textEl) return 0;
    const textCs = getComputedStyle(textEl);
    return { color: textCs.color, bg: cs.backgroundColor };
  });

  let textContrastRatio = 0;
  let textContrastPass = false;
  if (textContrast && typeof textContrast === "object" && "color" in textContrast) {
    textContrastRatio = contrastRatio(
      rgbToHex((textContrast as any).color),
      rgbToHex((textContrast as any).bg)
    );
    textContrastPass = textContrastRatio >= 4.5;
  }

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
  await page.evaluate(() => document.getElementById("card")?.scrollIntoView());
  await new Promise(r => setTimeout(r, 200));
  const screenshotFile = `${viewport.name}-${theme}.png`;
  const screenshotPath = path.join(SCREENSHOT_DIR, screenshotFile);
  await page.screenshot({ path: screenshotPath, fullPage: false });
  const hash = crypto.createHash("sha256").update(fs.readFileSync(screenshotPath)).digest("hex");

  // Validation
  if (!articlesVisible) failureReasons.push("No article elements visible in Card section");
  if (!elevatedVisible) failureReasons.push("Elevated variant not found");
  if (!outlinedVisible) failureReasons.push("Outlined variant not found");
  if (!headerVisible) failureReasons.push("No header elements found");
  if (!footerVisible) failureReasons.push("No footer elements found");
  if (!gridVisible) failureReasons.push("Grid layout not found");
  if (!semanticArticle) failureReasons.push("Cards not using semantic <article> element");
  if (!textContrastPass) failureReasons.push(`Text contrast ${textContrastRatio.toFixed(2)}:1 < 4.5:1`);
  if (horizontalOverflow) failureReasons.push("Horizontal overflow");
  if (consoleErrors.length > 0) failureReasons.push(`Console errors: ${consoleErrors.join(", ")}`);
  if (pageErrors.length > 0) failureReasons.push(`Page errors: ${pageErrors.join(", ")}`);

  await page.close();

  return {
    viewport: viewport.name,
    theme,
    articlesVisible, elevatedVisible, outlinedVisible,
    headerVisible, footerVisible, gridVisible,
    computedStyles,
    textContrast: +textContrastRatio.toFixed(2),
    textContrastPass,
    semanticArticle,
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
    gate: "HAWK-UI-Component-03 Card Round 1",
    baseSha: "6b7ee66d893a3f64ec2e1948b360013cc1bac4c0",
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
      visibility: {
        articles: r.articlesVisible,
        elevated: r.elevatedVisible,
        outlined: r.outlinedVisible,
        header: r.headerVisible,
        footer: r.footerVisible,
        grid: r.gridVisible,
      },
      computedStyles: r.computedStyles,
      contrast: { textRatio: r.textContrast, textPass: r.textContrastPass },
      semantics: { article: r.semanticArticle },
      layout: { overflow: r.horizontalOverflow },
      a11y: { reducedMotion: r.reducedMotion },
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
