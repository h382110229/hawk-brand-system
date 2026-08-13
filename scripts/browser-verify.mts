import puppeteer from "puppeteer";
import { spawn } from "child_process";
import * as crypto from "crypto";
import * as fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3002;
const BASE_URL = `http://localhost:${PORT}`;
const chromePath =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SCREENSHOT_DIR = path.resolve(
  __dirname,
  "../deliverables/ui-foundation-01/actual"
);
const PROJECT_ROOT = path.resolve(__dirname, "..");

interface VerificationResult {
  viewport: string;
  viewportSize: { width: number; height: number };
  theme: string;
  dataTheme: string;
  bgColor: string;
  tailwindApplied: boolean;
  tokenStylesheetLoaded: boolean;
  consoleErrors: string[];
  pageErrors: string[];
  horizontalOverflow: boolean;
  screenshotHash: string;
  screenshotPath: string;
  pass: boolean;
  failureReasons: string[];
}

async function waitForServer(url: string, timeoutMs = 90000): Promise<boolean> {
  // Give the server a moment to bind the port
  await new Promise((r) => setTimeout(r, 3000));
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) return true;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}

async function run(): Promise<void> {
  // Ensure screenshot dir exists
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  // Build production version first
  console.log("Building production bundle...");
  const buildResult = await new Promise<number>((resolve) => {
    const build = spawn("pnpm", ["build"], {
      cwd: PROJECT_ROOT,
      stdio: "pipe",
      env: { ...process.env, NODE_ENV: "production" },
    });
    let output = "";
    build.stdout?.on("data", (d: Buffer) => {
      output += d.toString();
      process.stdout.write(d);
    });
    build.stderr?.on("data", (d: Buffer) => {
      output += d.toString();
      process.stderr.write(d);
    });
    build.on("close", (code) => resolve(code ?? 1));
  });

  if (buildResult !== 0) {
    console.error("❌ Production build failed");
    process.exit(1);
  }
  console.log("✅ Production build complete");

  // Start Next.js production server
  console.log(`Starting Next.js production server on port ${PORT}...`);
  const server = spawn("pnpm", ["start", "--port", String(PORT)], {
    cwd: PROJECT_ROOT,
    stdio: "pipe",
    env: { ...process.env, NODE_ENV: "production" },
  });

  let serverOutput = "";
  server.stdout?.on("data", (d: Buffer) => {
    serverOutput += d.toString();
  });
  server.stderr?.on("data", (d: Buffer) => {
    serverOutput += d.toString();
  });

  const ready = await waitForServer(BASE_URL);
  if (!ready) {
    console.error("❌ Production server failed to start within 60s");
    console.error(serverOutput);
    server.kill();
    process.exit(1);
  }
  console.log("✅ Production server ready");

  const viewports = [
    { name: "desktop", width: 1440, height: 900 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "mobile", width: 375, height: 812 },
  ];

  const themes = ["dark", "light"];
  const results: VerificationResult[] = [];

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    for (const viewport of viewports) {
      for (const theme of themes) {
        console.log(`\nTesting ${viewport.name} / ${theme}...`);
        const page = await browser.newPage();

        // Set viewport
        await page.setViewport({
          width: viewport.width,
          height: viewport.height,
        });

        // Collect console errors and page errors BEFORE navigation
        const consoleErrors: string[] = [];
        const pageErrors: string[] = [];

        page.on("console", (msg) => {
          if (msg.type() === "error") {
            consoleErrors.push(msg.text());
          }
        });

        page.on("pageerror", (err) => {
          pageErrors.push(err.message);
        });

        // Set theme in localStorage before navigating
        // Navigate to a blank page first to set localStorage
        await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
        await page.evaluate((t) => {
          localStorage.setItem("hawk-theme", t);
        }, theme);

        // Reload to apply theme
        await page.goto(BASE_URL, { waitUntil: "networkidle0" });

        // Wait for fonts to load
        await page.evaluate(() => document.fonts.ready);

        // Wait for rendering
        await new Promise((r) => setTimeout(r, 1000));

        // === ASSERTIONS ===

        // 1. Verify data-theme attribute matches expected theme
        const dataTheme = await page.evaluate(() =>
          document.documentElement.getAttribute("data-theme")
        );

        // 2 & 3. Verify body background color
        const bgColor = await page.evaluate(() =>
          getComputedStyle(document.body).backgroundColor
        );

        // Parse bg color
        const expectedBg =
          theme === "dark" ? "rgb(10, 10, 10)" : "rgb(255, 255, 255)";

        // 4. Check Tailwind layout styles are applied
        const tailwindApplied = await page.evaluate(() => {
          // Check if Tailwind utility classes are being applied
          // Look for common Tailwind patterns in computed styles
          const body = document.body;
          const bodyStyle = getComputedStyle(body);
          // Tailwind sets box-sizing on all elements via its preflight
          const allElements = document.querySelectorAll("*");
          let tailwindDetected = false;
          for (const el of allElements) {
            const style = getComputedStyle(el);
            if (
              style.boxSizing === "border-box" &&
              style.fontFamily.includes("Inter")
            ) {
              tailwindDetected = true;
              break;
            }
          }
          return tailwindDetected;
        });

        // 5. Check CSS/token stylesheet loaded
        const tokenStylesheetLoaded = await page.evaluate(() => {
          const sheets = Array.from(document.styleSheets);
          return sheets.some((s) => {
            try {
              return (
                s.href?.includes("generated-tokens") ||
                (s.cssRules &&
                  Array.from(s.cssRules).some(
                    (r) =>
                      r.cssText?.includes("--color-background-primary") ||
                      r.cssText?.includes("--font-family")
                  ))
              );
            } catch {
              return false;
            }
          });
        });

        // 6 & 7. Console and page errors are collected via listeners above

        // 8. Check horizontal overflow
        const horizontalOverflow = await page.evaluate(() => {
          return document.body.scrollWidth > window.innerWidth;
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

        // Evaluate pass/fail with detailed reasons
        const failureReasons: string[] = [];

        if (dataTheme !== theme) {
          failureReasons.push(
            `data-theme="${dataTheme}" expected "${theme}"`
          );
        }
        if (bgColor !== expectedBg) {
          failureReasons.push(
            `bg="${bgColor}" expected "${expectedBg}"`
          );
        }
        if (!tailwindApplied) {
          failureReasons.push("Tailwind layout styles not detected");
        }
        if (!tokenStylesheetLoaded) {
          failureReasons.push("generated-tokens.css not loaded");
        }
        if (consoleErrors.length > 0) {
          failureReasons.push(
            `${consoleErrors.length} console error(s): ${consoleErrors.join("; ")}`
          );
        }
        if (pageErrors.length > 0) {
          failureReasons.push(
            `${pageErrors.length} page error(s): ${pageErrors.join("; ")}`
          );
        }
        if (horizontalOverflow) {
          failureReasons.push("Horizontal overflow detected");
        }

        const pass = failureReasons.length === 0;

        results.push({
          viewport: viewport.name,
          viewportSize: { width: viewport.width, height: viewport.height },
          theme,
          dataTheme: dataTheme || "null",
          bgColor,
          tailwindApplied,
          tokenStylesheetLoaded,
          consoleErrors,
          pageErrors,
          horizontalOverflow,
          screenshotHash,
          screenshotPath,
          pass,
          failureReasons,
        });

        const status = pass ? "✅" : "❌";
        console.log(
          `  ${status} data-theme="${dataTheme}" bg="${bgColor}" tailwind=${tailwindApplied} tokens=${tokenStylesheetLoaded} overflow=${horizontalOverflow} consoleErrs=${consoleErrors.length} pageErrs=${pageErrors.length} hash=${screenshotHash}`
        );
        if (!pass) {
          for (const reason of failureReasons) {
            console.log(`    → ${reason}`);
          }
        }

        await page.close();
      }
    }
  } finally {
    if (browser) await browser.close();
    server.kill();
  }

  // Cross-checks: dark/light screenshots must differ per viewport
  console.log("\n--- Cross-checks ---");
  for (const vp of viewports) {
    const darkResult = results.find(
      (r) => r.viewport === vp.name && r.theme === "dark"
    );
    const lightResult = results.find(
      (r) => r.viewport === vp.name && r.theme === "light"
    );
    if (darkResult && lightResult) {
      const different = darkResult.screenshotHash !== lightResult.screenshotHash;
      console.log(
        `  ${different ? "✅" : "❌"} ${vp.name}: dark ≠ light hashes`
      );
      if (!different) {
        darkResult.pass = false;
        lightResult.pass = false;
        darkResult.failureReasons.push("Screenshot identical to light variant");
        lightResult.failureReasons.push("Screenshot identical to dark variant");
      }
    }
  }

  // Cross-check: desktop/mobile must differ per theme
  for (const theme of themes) {
    const desktopResult = results.find(
      (r) => r.viewport === "desktop" && r.theme === theme
    );
    const mobileResult = results.find(
      (r) => r.viewport === "mobile" && r.theme === theme
    );
    if (desktopResult && mobileResult) {
      const different =
        desktopResult.screenshotHash !== mobileResult.screenshotHash;
      console.log(
        `  ${different ? "✅" : "❌"} ${theme}: desktop ≠ mobile hashes`
      );
      if (!different) {
        desktopResult.pass = false;
        mobileResult.pass = false;
        desktopResult.failureReasons.push(
          `Screenshot identical to mobile/${theme}`
        );
        mobileResult.failureReasons.push(
          `Screenshot identical to desktop/${theme}`
        );
      }
    }
  }

  // Generate report
  console.log("\n=== Verification Report ===");
  const allPass = results.every((r) => r.pass);
  for (const r of results) {
    const status = r.pass ? "PASS" : "FAIL";
    console.log(
      `  [${status}] ${r.viewport}/${r.theme}: data-theme=${r.dataTheme} bg=${r.bgColor} tailwind=${r.tailwindApplied} tokens=${r.tokenStylesheetLoaded} overflow=${r.horizontalOverflow} consoleErrs=${r.consoleErrors.length} pageErrs=${r.pageErrors.length} hash=${r.screenshotHash}`
    );
    if (!r.pass) {
      for (const reason of r.failureReasons) {
        console.log(`    → ${reason}`);
      }
    }
  }
  console.log(`\nOverall: ${allPass ? "✅ ALL PASS" : "❌ SOME FAILED"}`);

  // Write report file
  const reportPath = path.resolve(
    __dirname,
    "../deliverables/ui-foundation-01/actual/verification-report.json"
  );
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        allPass,
        results: results.map((r) => ({
          viewport: r.viewport,
          viewportSize: r.viewportSize,
          theme: r.theme,
          dataTheme: r.dataTheme,
          bgColor: r.bgColor,
          tailwindApplied: r.tailwindApplied,
          tokenStylesheetLoaded: r.tokenStylesheetLoaded,
          consoleErrors: r.consoleErrors,
          pageErrors: r.pageErrors,
          horizontalOverflow: r.horizontalOverflow,
          screenshotHash: r.screenshotHash,
          screenshotPath: r.screenshotPath,
          pass: r.pass,
          failureReasons: r.failureReasons,
        })),
      },
      null,
      2
    )
  );
  console.log(`\nReport saved to: ${reportPath}`);

  process.exit(allPass ? 0 : 1);
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
