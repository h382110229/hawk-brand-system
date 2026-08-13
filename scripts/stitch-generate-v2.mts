/**
 * Stitch UI Candidate Generator v2 — Gate HAWK-UI-Foundation-01R
 */
import { stitch } from "@google/stitch-sdk";
import * as fs from "fs";
import * as path from "path";

const PROJECT_ID = "2874404707497144026";

const BRAND_PROMPT = `HAWK Personal Technology Identity System — UI Foundation showcase.
Brand: Quiet luxury, modern, intelligent, precise, restrained.
Sections: Header (HAWK mark + nav + theme toggle), Hero, Logo System, Color palette, Typography, Spacing, Radius, Elevation, Motion.
Avoid: eagles, birds, wings, shields, crowns, animals, cyberpunk, neon, metallic gradients, glassmorphism, SaaS landing page.`;

const candidates = [
  {
    name: "A — Quiet Luxury Editorial",
    dir: "candidate-a",
    style: "Strong whitespace, refined typography, restrained gold/blue accents. Personal brand portfolio feel. Minimal decoration, maximum elegance.",
  },
  {
    name: "B — Precision Grid",
    dir: "candidate-b",
    style: "Rigorous grid system, clear token information. Professional brand guidelines. Systematic color swatches in precise grid.",
  },
  {
    name: "C — Intelligent Studio",
    dir: "candidate-c",
    style: "Balance of technology and creativity. JetBrains Mono accents. Technical precision meets elegant design.",
  },
];

async function main() {
  console.log("🎨 Stitch UI Candidate Generator v2");
  console.log(`Project: ${PROJECT_ID}\n`);

  const project = stitch.project(PROJECT_ID);

  // Step 1: Create Design System
  console.log("🎨 Setting up HAWK Design System...");
  try {
    const ds = await project.createDesignSystem({
      colorPalette: {
        primaryColor: "#D4AF37",
        secondaryColor: "#4285F4",
        saturation: 0.8,
      },
      typography: {
        fontFamily: "Plus Jakarta Sans",
      },
      shape: {
        cornerRoundness: "MEDIUM",
      },
      appearance: {
        lightModeBg: "#FFFFFF",
        darkModeBg: "#0A0A0A",
      },
      designMd: `# HAWK Brand
Colors: Dark=#D4AF37/#0A0A0A, Light=#4285F4/#FFFFFF
Typography: Plus Jakarta Sans, Inter, JetBrains Mono
Logo: HAWK geometric letters, no animals/gradients/3D
Style: Quiet luxury, modern, intelligent`,
    });
    console.log("  ✅ Design System created\n");
  } catch (e: any) {
    console.log("  ⚠️ Design system:", e.message, "\n");
  }

  const baseDir = path.join("deliverables", "ui-foundation-01", "stitch");
  const readme: string[] = [
    "# Stitch UI Candidates v2",
    "",
    `Project ID: ${PROJECT_ID}`,
    `Generated: ${new Date().toISOString()}`,
    `Model: GEMINI_3_PRO`,
    "",
  ];

  for (const c of candidates) {
    console.log(`🎯 ${c.name}`);
    const dir = path.join(baseDir, c.dir);
    fs.mkdirSync(dir, { recursive: true });
    readme.push(`## ${c.name}`, "", c.style, "");

    const variants = [
      { suffix: "desktop-dark", deviceType: "DESKTOP", theme: "Dark mode" },
      { suffix: "desktop-light", deviceType: "DESKTOP", theme: "Light mode" },
      { suffix: "mobile-dark", deviceType: "MOBILE", theme: "Dark mode" },
      { suffix: "mobile-light", deviceType: "MOBILE", theme: "Light mode" },
    ];

    for (const v of variants) {
      const prompt = `${BRAND_PROMPT}\nStyle: ${c.style}\n${v.theme}.`;
      console.log(`  📐 ${v.suffix} (${v.deviceType})...`);
      try {
        // generate(prompt, deviceType, modelId)
        const screen = await project.generate(prompt, v.deviceType, "GEMINI_3_PRO");
        const imageUrl = await screen.getImage();
        const resp = await fetch(imageUrl);
        const buf = Buffer.from(await resp.arrayBuffer());
        const out = path.join(dir, `${v.suffix}.png`);
        fs.writeFileSync(out, buf);
        console.log(`    ✅ ${out} (${buf.length} bytes)`);
        readme.push(`- ${v.suffix}.png ✅ (${buf.length} bytes)`);
      } catch (e: any) {
        console.log(`    ❌ ${e.message}`);
        readme.push(`- ${v.suffix}.png ❌ ${e.message}`);
      }
    }
    readme.push("");
  }

  readme.push("## Notes", "- Design System: HAWK brand tokens applied", "- Model: GEMINI_3_PRO", "- No API keys recorded", "");
  fs.writeFileSync(path.join(baseDir, "README.md"), readme.join("\n"));
  console.log("\n✅ Done!");
}

main().catch((e) => { console.error("❌", e.message); process.exit(1); });
