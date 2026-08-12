import puppeteer from "puppeteer";
import { spawn } from "child_process";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;
const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SCREENSHOT_DIR = path.resolve(__dirname, "../deliverables/ui-foundation-01/actual");

interface VerificationResult {
  viewport: string;
  theme: string;
  dataTheme: string;
  bgColor: string;
  consoleErrors: string[];
  horizontalOverflow: boolean;
  screenshotHash: string;
  screenshotPath: string;
  pass: boolean;
}

async function waitForServer(url: string, timeoutMs = 30000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function run(): Promise<void> {
  // Ensure screenshot dir exists
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  // Start Next.js dev server
  console.log(`Starting Next.js dev server on port ${PORT}...`);
  const server = spawn("pnpm", ["dev", "--port", String(PORT)], {
    cwd: path.resolve(__dirname, ".."),
    stdio: "pipe",
    env: { ...process.env, NODE_ENV: "development" },
  });

  let serverOutput = "";
  server.stdout?.on("data", (d: Buffer) => { serverOutput += d.toString(); });
  server.stderr?.on("data", (d: Buffer) => { serverOutput += d.toString(); });

  const ready = await waitForServer(BASE_URL);
  if (!ready) {
    console.error("❌ Dev server failed to start within 30s");
    console.error(serverOutput);
    server.kill();
    process.exit(1);
  }
  console.log("✅ Dev server ready");

  const viewports = [
    { name: "mobile", width: 375, height: 812 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1440, height: 900 },
  ];

  const themes = ["dark", "light"];
  const results: VerificationResult[] = [];

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    for (const viewport of viewports) {
      for (const theme of themes) {
        console.log(`\nTesting ${viewport.name} / ${theme}...`);
        const page = await browser.newPage();

        await page.setViewport({
          width: viewport.width,
          height: viewport.height,
        });

        // Set theme in localStorage before navigating
        await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
        await page.evaluate((t) => {
          localStorage.setItem("hawk-theme", t);
        }, theme);

        // Reload to apply theme
        await page.goto(BASE_URL, { waitUntil: "networkidle0" });

        // Wait for fonts
        await page.evaluate(() => document.fonts.ready);

        // Small delay for rendering
        await new Promise((r) => setTimeout(r, 500));

        // Verify data-theme attribute
        const dataTheme = await page.evaluate(() =>
          document.documentElement.getAttribute("data-theme")
        );

        // Verify body background
        const bgColor = await page.evaluate(() =>
          getComputedStyle(document.body).backgroundColor
        );

        // Check console errors
        const consoleErrors: string[] = [];
        page.on("console", (msg) => {
          if (msg.type() === "error") {
            consoleErrors.push(msg.text());
          }
        });

        // Check horizontal overflow
        const horizontalOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        // Take screenshot
        const filename = `${viewport.name}-${theme}.png`;
        const screenshotPath = path.join(SCREENSHOT_DIR, filename);
        await page.screenshot({ path: screenshotPath, fullPage: false });

        // Calculate hash
        const screenshotBuffer = fs.readFileSync(screenshotPath);
        const screenshotHash = crypto
          .createHash("sha256")
          .update(screenshotBuffer)
          .digest("hex")
          .slice(0, 16);

        const pass =
          dataTheme === theme &&
          !horizontalOverflow &&
          consoleErrors.length === 0;

        results.push({
          viewport: viewport.name,
          theme,
          dataTheme: dataTheme || "null",
          bgColor,
          consoleErrors,
          horizontalOverflow,
          screenshotHash,
          screenshotPath,
          pass,
        });

        const status = pass ? "✅" : "❌";
        console.log(`  ${status} data-theme="${dataTheme}" bg="${bgColor}" overflow=${horizontalOverflow} hash=${screenshotHash}`);

        await page.close();
      }
    }
  } finally {
    if (browser) await browser.close();
    server.kill();
  }

  // Verify dark/light screenshots are different
  console.log("\n--- Cross-checks ---");
  for (const vp of viewports) {
    const darkResult = results.find((r) => r.viewport === vp.name && r.theme === "dark");
    const lightResult = results.find((r) => r.viewport === vp.name && r.theme === "light");
    if (darkResult && lightResult) {
      const different = darkResult.screenshotHash !== lightResult.screenshotHash;
      console.log(`  ${different ? "✅" : "❌"} ${vp.name}: dark ≠ light hashes`);
      if (!different) {
        darkResult.pass = false;
        lightResult.pass = false;
      }
    }
  }

  // Verify desktop/mobile screenshots are different
  for (const theme of themes) {
    const desktopResult = results.find((r) => r.viewport === "desktop" && r.theme === theme);
    const mobileResult = results.find((r) => r.viewport === "mobile" && r.theme === theme);
    if (desktopResult && mobileResult) {
      const different = desktopResult.screenshotHash !== mobileResult.screenshotHash;
      console.log(`  ${different ? "✅" : "❌"} ${theme}: desktop ≠ mobile hashes`);
      if (!different) {
        desktopResult.pass = false;
        mobileResult.pass = false;
      }
    }
  }

  // Generate report
  console.log("\n=== Verification Report ===");
  const allPass = results.every((r) => r.pass);
  for (const r of results) {
    const status = r.pass ? "PASS" : "FAIL";
    console.log(`  [${status}] ${r.viewport}/${r.theme}: data-theme=${r.dataTheme} bg=${r.bgColor} overflow=${r.horizontalOverflow} errors=${r.consoleErrors.length} hash=${r.screenshotHash}`);
  }
  console.log(`\nOverall: ${allPass ? "✅ ALL PASS" : "❌ SOME FAILED"}`);

  // Write report file
  const reportPath = path.resolve(__dirname, "../deliverables/ui-foundation-01/verification-report.json");
  fs.writeFileSync(reportPath, JSON.stringify({ results, allPass }, null, 2));
  console.log(`\nReport saved to: ${reportPath}`);

  process.exit(allPass ? 0 : 1);
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
