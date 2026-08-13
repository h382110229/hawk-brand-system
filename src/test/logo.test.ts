import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const LOGO_DIR = path.resolve(
  __dirname,
  "../../assets/logo-candidates/round6-selected"
);

describe("Logo SVG validation", () => {
  const variants = ["full", "mark", "icon"];
  const themes = ["dark", "light"];

  for (const theme of themes) {
    for (const variant of variants) {
      const file = `${theme}/${variant}.svg`;

      it(`${file} is valid XML with correct viewBox`, () => {
        const content = fs.readFileSync(path.join(LOGO_DIR, file), "utf-8");
        expect(content).toContain("xmlns=\"http://www.w3.org/2000/svg\"");
        expect(content).toContain('viewBox="0 0 1024 1024"');
      });

      it(`${file} has no forbidden elements (no gradients, filters, shadows)`, () => {
        const content = fs.readFileSync(path.join(LOGO_DIR, file), "utf-8");
        expect(content).not.toContain("<linearGradient");
        expect(content).not.toContain("<radialGradient");
        expect(content).not.toContain("<filter");
        expect(content).not.toContain("<feDropShadow");
        expect(content).not.toContain("<feGaussianBlur");
      });

      it(`${file} uses correct stroke attributes`, () => {
        const content = fs.readFileSync(path.join(LOGO_DIR, file), "utf-8");
        expect(content).toContain('stroke-linecap="butt"');
        expect(content).toContain('stroke-linejoin="miter"');
        expect(content).toContain('fill="none"');
      });
    }
  }

  it("dark variants use correct colors", () => {
    const content = fs.readFileSync(path.join(LOGO_DIR, "dark/full.svg"), "utf-8");
    expect(content).toContain("#D4AF37");
    expect(content).toContain("#0A0A0A");
  });

  it("light variants use correct colors", () => {
    const content = fs.readFileSync(path.join(LOGO_DIR, "light/full.svg"), "utf-8");
    expect(content).toContain("#4285F4");
    expect(content).toContain("#FFFFFF");
  });

  it("mark paths are present in mark.svg", () => {
    const content = fs.readFileSync(path.join(LOGO_DIR, "dark/mark.svg"), "utf-8");
    expect(content).toContain("M252 220V720");
    expect(content).toContain("M360 486");
    expect(content).toContain("M720 220");
  });

  it("icon has HAWK monogram (not just H path)", () => {
    const content = fs.readFileSync(path.join(LOGO_DIR, "dark/icon.svg"), "utf-8");
    // Icon should contain HAWK monogram paths (H, A, W, K)
    expect(content).toContain("M252 220V804"); // H vertical
    expect(content).toContain("M252 512H448"); // H crossbar
    expect(content).toContain("M360 580L448 220"); // A peak
    expect(content).toContain("M300 580L380 804"); // W
    expect(content).toContain("M536 220V804"); // K vertical
    // Icon should NOT contain wordmark
    expect(content).not.toContain("M226 810");
  });

  it("full.svg contains both mark and wordmark", () => {
    const content = fs.readFileSync(path.join(LOGO_DIR, "dark/full.svg"), "utf-8");
    expect(content).toContain("stroke-width=\"56\"");
    expect(content).toContain("stroke-width=\"28\"");
    expect(content).toContain("M226 810");
  });
});
