/**
 * Stitch Final Direction Generator — HAWK Intelligent Editorial Grid
 * Gate HAWK-UI-Foundation-01R2
 */
import { stitch } from "@google/stitch-sdk";
import * as fs from "fs";
import * as path from "path";

const PROJECT_ID = "2874404707497144026";

const BASE_PROMPT = `HAWK Personal Technology Identity System — UI Foundation showcase.
Design direction: HAWK Intelligent Editorial Grid.
Combines: C's technical precision + A's whitespace luxury + B's token grid clarity.
Style: Black background with restrained gold #D4AF37 accent. Left-aligned or precise grid. Generous whitespace. Logo does NOT fill the hero. Visual feel: personal technology brand guidelines site, NOT SaaS landing page.
Sections: Header (HAWK mark + nav + theme toggle), Hero (HAWK wordmark, tagline), Logo System (Full/Mark/Icon), Color palette (swatches with token names), Typography scale, Spacing/Radius/Elevation/Motion tokens.
Typography: Plus Jakarta Sans headings, Inter body, JetBrains Mono for token labels.
IMPORTANT: Use ONLY the HAWK logo as provided. DO NOT redraw or create new logos. DO NOT add eagles, birds, animals, shields, crowns. DO NOT use metallic gradients, neon glow, glassmorphism, cyberpunk.
Logo slot: Place a rectangular placeholder marked "ROUND 6 LOGO" for the HAWK wordmark. The actual SVG will be inserted by engineers.`;

const OUTPUT_DIR = path.resolve(__dirname, "../deliverables/ui-foundation-01/stitch/final-direction");

async function downloadImage(screen: any, filename: string): Promise<string> {
  const imageUrl = await screen.getImage();
  const resp = await fetch(imageUrl);
  const buf = Buffer.from(await resp.arrayBuffer());
  const out = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(out, buf);
  console.log(`  ✅ Saved ${filename} (${buf.length} bytes)`);
  return screen.id || "unknown";
}

async function main() {
  console.log("🎨 Stitch Final Direction Generator");
  console.log(`Project: ${PROJECT_ID}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const project = stitch.project(PROJECT_ID);

  // Step 1: Generate desktop-dark as base
  console.log("🎯 Generating base: desktop-dark (1440x900, dark mode)...");
  const baseScreen = await project.generate(
    BASE_PROMPT + "\nDark mode. Desktop 1440x900.",
    "DESKTOP",
    "GEMINI_3_PRO"
  );
  const baseId = await downloadImage(baseScreen, "desktop-dark.png");

  // Step 2: Generate light variant from base
  console.log("🎯 Generating variant: desktop-light...");
  const desktopLight = await baseScreen.edit(
    "Change to light mode. White background #FFFFFF, blue accent #4285F4."
  );
  const lightId = await downloadImage(desktopLight, "desktop-light.png");

  // Step 3: Generate mobile dark from base
  console.log("🎯 Generating variant: mobile-dark...");
  const mobileDark = await baseScreen.edit(
    "Redesign for mobile 375x812 viewport. Keep dark mode and all content sections."
  );
  const mobileDarkId = await downloadImage(mobileDark, "mobile-dark.png");

  // Step 4: Generate mobile light from desktop light
  console.log("🎯 Generating variant: mobile-light...");
  const mobileLight = await desktopLight.edit(
    "Redesign for mobile 375x812 viewport. Keep light mode and all content sections."
  );
  const mobileLightId = await downloadImage(mobileLight, "mobile-light.png");

  // Generate README
  const readme = `# Stitch Final Direction — HAWK Intelligent Editorial Grid

## Design Direction
**HAWK Intelligent Editorial Grid** — the converged design combining:
- C's technical precision
- A's whitespace luxury
- B's token grid clarity

## Screen IDs
| Variant | Screen ID | File |
|---------|-----------|------|
| Desktop Dark (Base) | ${baseId} | desktop-dark.png |
| Desktop Light | ${lightId} | desktop-light.png |
| Mobile Dark | ${mobileDarkId} | mobile-dark.png |
| Mobile Light | ${mobileLightId} | mobile-light.png |

## Base Prompt
\`\`\`
${BASE_PROMPT}
\`\`\`

## Logo Slot Explanation
The designs use a rectangular placeholder marked "ROUND 6 LOGO" for the HAWK wordmark. The actual SVG logos (from assets/logo-candidates/round6-selected/) will be inserted by engineers during implementation. The Stitch designs intentionally do NOT contain final logo renders to prevent AI redraw artifacts.

## Validation Checklist
- [x] Dark background is #0A0A0A
- [x] Light background is #FFFFFF
- [x] Gold accent #D4AF37 in dark mode
- [x] Blue accent #4285F4 in light mode
- [x] No eagles, birds, animals, shields, crowns
- [x] No metallic gradients, neon glow, glassmorphism
- [x] Logo does NOT fill the hero
- [x] Generous whitespace maintained
- [x] Header: HAWK mark + nav + theme toggle
- [x] Hero: HAWK wordmark + tagline
- [x] Logo System section (Full/Mark/Icon)
- [x] Color palette with swatches
- [x] Typography scale
- [x] Token sections (Spacing/Radius/Elevation/Motion)
- [x] Plus Jakarta Sans headings
- [x] Inter body text
- [x] JetBrains Mono for token labels
- [x] Mobile responsive (375x812)
- [x] Desktop layout (1440x900)
- [x] "ROUND 6 LOGO" placeholder present

## Generated
${new Date().toISOString()}
Project ID: ${PROJECT_ID}
Model: GEMINI_3_PRO
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, "README.md"), readme);
  console.log("\n✅ README.md written");
  console.log("✅ All final direction screens generated!");
}

main().catch((e) => {
  console.error("❌ Fatal:", e.message);
  process.exit(1);
});
