/**
 * Stitch UI Candidate Generator — Gate HAWK-UI-Foundation-01R
 *
 * Generates 3 UI candidates using Google Stitch SDK.
 * Usage: STITCH_API_KEY=xxx tsx scripts/stitch-generate.ts
 */
import { stitch } from "@google/stitch-sdk";
import * as fs from "fs";
import * as path from "path";

const STITCH_KEY = process.env.STITCH_API_KEY;
if (!STITCH_KEY) {
  console.error("❌ STITCH_API_KEY not set");
  process.exit(1);
}

const BRAND_PROMPT_BASE = `
Product: HAWK Personal Technology Identity System — UI Foundation showcase.
Brand personality: Quiet luxury, modern, intelligent, precise, restrained.
Typography: Plus Jakarta Sans for headings, Inter for body, JetBrains Mono for token labels.
Dark mode: Gold #D4AF37 on black #0A0A0A.
Light mode: Blue #4285F4 on white #FFFFFF.
Required sections: Header with HAWK mark + nav + theme toggle, Hero, Logo System, Color palette, Typography, Spacing, Radius, Elevation, Motion tokens.
Avoid: Eagles, birds, wings, shields, crowns, animals, cyberpunk, neon glow, metallic gradients, glassmorphism, generic SaaS landing page, unapproved colors.
Desktop: 1440x900. Mobile: 375x812.
`.trim();

const candidates = [
  {
    name: "A — Quiet Luxury Editorial",
    dir: "candidate-a",
    prompt: `${BRAND_PROMPT_BASE}

Style: Quiet luxury editorial. Strong whitespace, refined typography, restrained gold/blue accents. Personal brand & portfolio feel. Minimal decoration, maximum elegance. Clean serif-like headings with generous spacing. Hero uses large HAWK wordmark with subtle gold accent line.`,
  },
  {
    name: "B — Precision Grid",
    dir: "candidate-b",
    prompt: `${BRAND_PROMPT_BASE}

Style: Precision grid. Rigorous grid system, clear token information display. Logo and design system showcase feels professional and structured. Systematic color swatches in a precise grid. Typography samples with pixel-perfect alignment. Modern brand guidelines website aesthetic.`,
  },
  {
    name: "C — Intelligent Studio",
    dir: "candidate-c",
    prompt: `${BRAND_PROMPT_BASE}

Style: Intelligent studio. Balance of technology and creativity. JetBrains Mono used as subtle accent for section labels and token names. Technical precision meets elegant design. Personal technology studio vibe. Clean data presentation with monospace labels. No cyberpunk or neon.`,
  },
];

async function main() {
  console.log("🎨 Stitch UI Candidate Generator");
  console.log(`API Key: ${STITCH_KEY.substring(0, 8)}...`);

  // Create project
  console.log("\n📁 Creating Stitch project...");
  const projectResult = await stitch.callTool("create_project", {
    title: "HAWK UI Foundation 01R",
  });
  console.log("Project:", projectResult);

  // Extract project ID from result
  let projectId: string;
  if (typeof projectResult === "string") {
    projectId = projectResult;
  } else if (projectResult && typeof projectResult === "object") {
    projectId = (projectResult as any).projectId || (projectResult as any).id || JSON.stringify(projectResult);
  } else {
    console.error("❌ Could not extract project ID");
    process.exit(1);
  }
  console.log(`Project ID: ${projectId}`);

  const project = stitch.project(projectId);
  const deliverablesDir = path.join("deliverables", "ui-foundation-01", "stitch");
  const readmeLines: string[] = [
    "# Stitch UI Candidates — HAWK UI Foundation 01R",
    "",
    `Project ID: ${projectId}`,
    `Generated: ${new Date().toISOString()}`,
    "",
  ];

  for (const candidate of candidates) {
    console.log(`\n🎯 Generating: ${candidate.name}`);
    const candidateDir = path.join(deliverablesDir, candidate.dir);
    fs.mkdirSync(candidateDir, { recursive: true });

    // Generate 4 variants: desktop-dark, desktop-light, mobile-dark, mobile-light
    const variants = [
      { suffix: "desktop-dark", prompt: candidate.prompt + "\nDark mode. Desktop 1440x900 viewport." },
      { suffix: "desktop-light", prompt: candidate.prompt + "\nLight mode. Desktop 1440x900 viewport." },
      { suffix: "mobile-dark", prompt: candidate.prompt + "\nDark mode. Mobile 375x812 viewport." },
      { suffix: "mobile-light", prompt: candidate.prompt + "\nLight mode. Mobile 375x812 viewport." },
    ];

    readmeLines.push(`## ${candidate.name}`);
    readmeLines.push("");

    for (const variant of variants) {
      console.log(`  📐 ${variant.suffix}...`);
      try {
        const screen = await project.generate(variant.prompt);
        const imageUrl = await screen.getImage();

        // Download image
        const response = await fetch(imageUrl);
        const buffer = Buffer.from(await response.arrayBuffer());
        const outputPath = path.join(candidateDir, `${variant.suffix}.png`);
        fs.writeFileSync(outputPath, buffer);
        console.log(`    ✅ ${outputPath} (${buffer.length} bytes)`);

        readmeLines.push(`- ${variant.suffix}.png`);
      } catch (err: any) {
        console.error(`    ❌ Failed: ${err.message}`);
        readmeLines.push(`- ${variant.suffix}.png — ❌ FAILED: ${err.message}`);
      }
    }
    readmeLines.push("");
  }

  // Check for prohibited elements
  readmeLines.push("## Validation Notes");
  readmeLines.push("");
  readmeLines.push("- Check all images for prohibited elements (eagles, animals, neon, etc.)");
  readmeLines.push("- Verify brand colors match: Dark=#D4AF37/#0A0A0A, Light=#4285F4/#FFFFFF");
  readmeLines.push("- Verify typography: Plus Jakarta Sans, Inter, JetBrains Mono");
  readmeLines.push("- No API keys recorded here");
  readmeLines.push("");

  // Write README
  const readmePath = path.join(deliverablesDir, "README.md");
  fs.writeFileSync(readmePath, readmeLines.join("\n"));
  console.log(`\n📄 README: ${readmePath}`);

  console.log("\n✅ Stitch generation complete!");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err.message);
  process.exit(1);
});
