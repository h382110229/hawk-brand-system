import * as fs from "fs";
import * as path from "path";

const SOURCE = path.resolve(__dirname, "../assets/logo-candidates/round6-selected");
const DEST = path.resolve(__dirname, "../public/brand");

const MAPPING: [string, string][] = [
  ["dark/full.svg", "hawk-full-dark.svg"],
  ["dark/full.png", "hawk-full-dark.png"],
  ["dark/mark.svg", "hawk-mark-dark.svg"],
  ["dark/mark.png", "hawk-mark-dark.png"],
  ["dark/icon.svg", "hawk-icon-dark.svg"],
  ["dark/icon.png", "hawk-icon-dark.png"],
  ["dark/icon-32.png", "hawk-icon-dark-32.png"],
  ["dark/icon-16.png", "hawk-icon-dark-16.png"],
  ["light/full.svg", "hawk-full-light.svg"],
  ["light/full.png", "hawk-full-light.png"],
  ["light/mark.svg", "hawk-mark-light.svg"],
  ["light/mark.png", "hawk-mark-light.png"],
  ["light/icon.svg", "hawk-icon-light.svg"],
  ["light/icon.png", "hawk-icon-light.png"],
  ["light/icon-32.png", "hawk-icon-light-32.png"],
  ["light/icon-16.png", "hawk-icon-light-16.png"],
];

if (!fs.existsSync(DEST)) {
  fs.mkdirSync(DEST, { recursive: true });
}

let copied = 0;
for (const [src, dest] of MAPPING) {
  const srcPath = path.join(SOURCE, src);
  const destPath = path.join(DEST, dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`  ✓ ${dest}`);
    copied++;
  } else {
    console.warn(`  ⚠ Missing: ${src}`);
  }
}

console.log(`\n✅ Synced ${copied} brand assets to public/brand/`);
