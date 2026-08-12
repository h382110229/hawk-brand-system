/**
 * Stitch UI Candidate Generator — Gate HAWK-UI-Foundation-01R
 * Usage: STITCH_API_KEY=xxx node --experimental-strip-types scripts/stitch-generate.mts
 */
import { stitch } from "@google/stitch-sdk";
import * as fs from "fs";
import * as path from "path";

const STITCH_KEY = process.env.STITCH_API_KEY;
if (!STITCH_KEY) { console.error("❌ STITCH_API_KEY not set"); process.exit(1); }

const PROJECT_ID = "2874404707497144026";

const BRAND_BASE = `HAWK Personal Technology Identity System UI Foundation showcase.
Quiet luxury, modern, intelligent, precise, restrained brand personality.
Typography: Plus Jakarta Sans headings, Inter body, JetBrains Mono for labels.
Dark mode: Gold #D4AF37 on black #0A0A0A. Light mode: Blue #4285F4 on white #FFFFFF.
Required sections: Header with HAWK mark + nav + theme toggle, Hero with HAWK wordmark, Logo System (Full/Mark/Icon), Color palette with swatches, Typography scale, Spacing/Radius/Elevation/Motion tokens.
Avoid: eagles birds wings shields crowns animals cyberpunk neon glow metallic gradients glassmorphism SaaS landing page decorative gradients unapproved colors.`;

const candidates = [
  {
    name: "A — Quiet Luxury Editorial",
    dir: "candidate-a",
    style: "Strong whitespace, refined typography, restrained gold/blue accents. Personal brand portfolio feel. Minimal decoration, maximum elegance. Clean headings with generous spacing. Hero: large HAWK wordmark with subtle gold accent line.",
  },
  {
    name: "B — Precision Grid",
    dir: "candidate-b",
    style: "Rigorous grid system, clear token information display. Professional brand guidelines website. Systematic color swatches in precise grid. Typography samples with pixel-perfect alignment.",
  },
  {
    name: "C — Intelligent Studio",
    dir: "candidate-c",
    style: "Balance of technology and creativity. JetBrains Mono as subtle accent for section labels. Technical precision meets elegant design. Personal technology studio vibe. Clean data with monospace labels.",
  },
];

const viewports = [
  { suffix: "desktop-dark", vp: "Desktop 1440x900", theme: "Dark mode" },
  { suffix: "desktop-light", vp: "Desktop 1440x900", theme: "Light mode" },
  { suffix: "mobile-dark", vp: "Mobile 375x812", theme: "Dark mode" },
  { suffix: "mobile-light", vp: "Mobile 375x812", theme: "Light mode" },
];

async function main() {
  console.log("🎨 Stitch UI Candidate Generator");
  console.log(`Project: ${PROJECT_ID}\n`);

  const project = stitch.project(PROJECT_ID);
  const baseDir = path.join("deliverables", "ui-foundation-01", "stitch");
  const readme: string[] = [
    "# Stitch UI Candidates — HAWK UI Foundation 01R",
    "",
    `Project ID: ${PROJECT_ID}`,
    `Generated: ${new Date().toISOString()}`,
    "",
  ];

  for (const c of candidates) {
    console.log(`\n🎯 ${c.name}`);
    const dir = path.join(baseDir, c.dir);
    fs.mkdirSync(dir, { recursive: true });
    readme.push(`## ${c.name}`, "", c.style, "");

    for (const v of viewports) {
      console.log(`  📐 ${v.suffix}...`);
      const prompt = `${BRAND_BASE}\nStyle: ${c.style}\n${v.theme}. ${v.vp}.`;
      try {
        const screen = await project.generate(prompt);
        const imageUrl = await screen.getImage();
        const resp = await fetch(imageUrl);
        const buf = Buffer.from(await resp.arrayBuffer());
        const out = path.join(dir, `${v.suffix}.png`);
        fs.writeFileSync(out, buf);
        console.log(`    ✅ ${out} (${buf.length} bytes)`);
        readme.push(`- ${v.suffix}.png (${buf.length} bytes)`);
      } catch (e: any) {
        console.log(`    ❌ ${e.message}`);
        readme.push(`- ${v.suffix}.png — ❌ ${e.message}`);
      }
    }
    readme.push("");
  }

  readme.push("## Validation Notes", "");
  readme.push("- Check for prohibited elements (eagles, animals, neon, etc.)");
  readme.push("- Verify brand colors: Dark=#D4AF37/#0A0A0A, Light=#4285F4/#FFFFFF");
  readme.push("- No API keys recorded here", "");

  fs.writeFileSync(path.join(baseDir, "README.md"), readme.join("\n"));
  console.log("\n✅ Done!");
}

main().catch((e) => { console.error("❌", e.message); process.exit(1); });
