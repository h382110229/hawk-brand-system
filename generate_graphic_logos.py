#!/usr/bin/env python3
"""
HAWK Logo Generator — Graphic Concepts
Letters H-A-W-K form recognizable graphic shapes:
- Crown: A=peak, H=left pillars, K=right spike, W=base band
- Rocket: A=nose, H=body, K=fins, W=flame
- Citadel: A=roof, H=walls, K=side tower, W=battlement base
"""

import math
import os
from PIL import Image, ImageDraw

GOLD = "#D4AF37"
BLACK = "#0A0A0A"
BLUE = "#4285F4"
WHITE = "#FFFFFF"
GOLD_RGB = (212, 175, 55)
BLACK_RGB = (10, 10, 10)
BLUE_RGB = (66, 133, 244)
WHITE_RGB = (255, 255, 255)

def thick_line(x1, y1, x2, y2, width):
    dx, dy = x2 - x1, y2 - y1
    length = math.sqrt(dx**2 + dy**2)
    if length == 0:
        return []
    px = -dy / length * width / 2
    py = dx / length * width / 2
    return [(x1+px, y1+py), (x2+px, y2+py), (x2-px, y2-py), (x1-px, y1-py)]

def chamfered_rect(x, y, w, h, chamfer):
    c = min(chamfer, w/2, h/2)
    return [(x,y+c),(x+c,y),(x+w-c,y),(x+w,y+c),(x+w,y+h-c),(x+w-c,y+h),(x+c,y+h),(x,y+h-c)]

def v_bar(cx, y_top, y_bot, sw, ch=None):
    if ch is None: ch = sw * 0.3
    return chamfered_rect(cx - sw/2, y_top, sw, y_bot - y_top, ch)

def h_bar(cy, x_left, x_right, sw, ch=None):
    if ch is None: ch = sw * 0.3
    return chamfered_rect(x_left, cy - sw/2, x_right - x_left, sw, ch)

def lerp(a, b, t):
    return a + (b - a) * t

def create_svg(polygons, fill, bg, size=1024):
    polys = "\n    ".join(
        f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x,y in p)}" fill="{fill}"/>'
        for p in polygons)
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">\n  <rect width="{size}" height="{size}" fill="{bg}"/>\n  <g>\n    {polys}\n  </g>\n</svg>'

def render_png(polygons, fill_rgb, bg_rgb, size=1024):
    img = Image.new('RGB', (size, size), bg_rgb)
    draw = ImageDraw.Draw(img)
    scale = size / 1024.0
    for poly in polygons:
        draw.polygon([(x*scale, y*scale) for x, y in poly], fill=fill_rgb)
    return img


# ============================================================
# Concept: CROWN
# A = center peak (tallest spike)
# H = left side (two verticals + crossbar)
# K = right side (vertical + diagonal arms)
# W = crown base (jagged band)
# ============================================================
def concept_crown(sw=54):
    polygons = []
    ch = sw * 0.3
    cx = 512

    y_base = 580       # where letters meet W band
    y_bot = 740        # W valley bottom
    y_peak_a = 250     # A peak (tallest)
    y_peak_h = 380     # H vertical tops
    y_peak_k = 360     # K area

    # --- A (center peak) ---
    x_a_l = 420
    x_a_r = 604
    polygons.append(thick_line(x_a_l, y_base, cx, y_peak_a, sw))
    polygons.append(thick_line(cx, y_peak_a, x_a_r, y_base, sw))
    t_a = 0.55
    x_cb_l = lerp(x_a_l, cx, t_a); x_cb_r = lerp(cx, x_a_r, t_a)
    y_cb_a = lerp(y_base, y_peak_a, t_a)
    polygons.append(h_bar(y_cb_a, x_cb_l, x_cb_r, sw, ch))

    # --- H (left, two verticals + crossbar) ---
    x_h_l = 260; x_h_r = 360
    polygons.append(v_bar(x_h_l, y_peak_h, y_base, sw, ch))
    polygons.append(v_bar(x_h_r, y_peak_h, y_base, sw, ch))
    y_h_cb = (y_peak_h + y_base) / 2
    polygons.append(h_bar(y_h_cb, x_h_l, x_h_r, sw, ch))
    # Bridge H to A
    polygons.append(h_bar(y_base - sw/2, x_h_r, x_a_l, sw, ch))

    # --- K (right) ---
    x_k = 664; x_k_end = 780
    polygons.append(v_bar(x_k, y_peak_k, y_base, sw, ch))
    k_mid = (y_peak_k + y_base) / 2
    polygons.append(thick_line(x_k, k_mid, x_k_end, y_peak_k, sw))
    polygons.append(thick_line(x_k, k_mid, x_k_end, y_base, sw))
    # Bridge A to K
    polygons.append(h_bar(y_base - sw/2, x_a_r, x_k, sw, ch))

    # --- W (crown base band) ---
    w_l = x_h_l - 20; w_r = x_k_end + 20; w_span = w_r - w_l
    w_pts = [
        (w_l, y_base),
        (w_l + w_span * 0.25, y_bot),
        (cx, y_base + 15),
        (w_l + w_span * 0.75, y_bot),
        (w_r, y_base),
    ]
    for i in range(len(w_pts) - 1):
        polygons.append(thick_line(w_pts[i][0], w_pts[i][1], w_pts[i+1][0], w_pts[i+1][1], sw))

    return polygons


# ============================================================
# Concept: ROCKET
# A = nose cone (triangle at top)
# H = body (two verticals + crossbar)
# K = fins (diagonal arms at bottom)
# W = exhaust flame (zigzag)
# ============================================================
def concept_rocket(sw=52):
    polygons = []
    ch = sw * 0.3
    cx = 512

    # A (nose)
    y_a_peak = 180; y_a_base = 380
    x_a_l = 440; x_a_r = 584
    polygons.append(thick_line(x_a_l, y_a_base, cx, y_a_peak, sw))
    polygons.append(thick_line(cx, y_a_peak, x_a_r, y_a_base, sw))
    t_a = 0.55
    x_cb_l = lerp(x_a_l, cx, t_a); x_cb_r = lerp(cx, x_a_r, t_a)
    y_cb = lerp(y_a_base, y_a_peak, t_a)
    polygons.append(h_bar(y_cb, x_cb_l, x_cb_r, sw, ch))

    # H (body)
    y_h_top = y_a_base; y_h_bot = 620
    polygons.append(v_bar(x_a_l, y_h_top, y_h_bot, sw, ch))
    polygons.append(v_bar(x_a_r, y_h_top, y_h_bot, sw, ch))
    y_h_cb = (y_h_top + y_h_bot) / 2
    polygons.append(h_bar(y_h_cb, x_a_l, x_a_r, sw, ch))

    # K (fins)
    k_mid = y_h_bot - 30
    x_fin_l = x_a_l - 80; x_fin_r = x_a_r + 80
    y_fin_bot = y_h_bot + 40
    polygons.append(thick_line(x_a_l, k_mid, x_fin_l, y_fin_bot, sw))
    polygons.append(thick_line(x_a_r, k_mid, x_fin_r, y_fin_bot, sw))

    # W (flame)
    y_w_top = y_fin_bot + 10; y_w_bot = 820
    w_l = x_fin_l + 20; w_r = x_fin_r - 20; w_span = w_r - w_l
    w_pts = [
        (w_l, y_w_top),
        (w_l + w_span * 0.25, y_w_bot),
        (cx, y_w_top + 20),
        (w_l + w_span * 0.75, y_w_bot),
        (w_r, y_w_top),
    ]
    for i in range(len(w_pts) - 1):
        polygons.append(thick_line(w_pts[i][0], w_pts[i][1], w_pts[i+1][0], w_pts[i+1][1], sw))

    return polygons


# ============================================================
# Concept: CITADEL
# A = roof (triangle)
# H = main walls (two verticals + crossbar)
# K = side tower (vertical + arms)
# W = battlement base
# ============================================================
def concept_citadel(sw=54):
    polygons = []
    ch = sw * 0.3
    cx = 512

    # A (roof)
    y_a_peak = 200; y_a_base = 380
    x_a_l = 380; x_a_r = 644
    polygons.append(thick_line(x_a_l, y_a_base, cx, y_a_peak, sw))
    polygons.append(thick_line(cx, y_a_peak, x_a_r, y_a_base, sw))
    t_a = 0.55
    x_cb_l = lerp(x_a_l, cx, t_a); x_cb_r = lerp(cx, x_a_r, t_a)
    y_cb = lerp(y_a_base, y_a_peak, t_a)
    polygons.append(h_bar(y_cb, x_cb_l, x_cb_r, sw, ch))

    # H (walls)
    y_h_top = y_a_base; y_h_bot = 640
    polygons.append(v_bar(x_a_l, y_h_top, y_h_bot, sw, ch))
    polygons.append(v_bar(x_a_r, y_h_top, y_h_bot, sw, ch))
    y_h_cb = y_h_top + (y_h_bot - y_h_top) * 0.45
    polygons.append(h_bar(y_h_cb, x_a_l, x_a_r, sw, ch))

    # K (side tower)
    x_k = x_a_r + 80; y_k_top = y_h_top + 20; y_k_bot = y_h_bot
    polygons.append(v_bar(x_k, y_k_top, y_k_bot, sw, ch))
    k_mid = y_k_top + (y_k_bot - y_k_top) * 0.35
    x_k_end = x_k + 70
    polygons.append(thick_line(x_k, k_mid, x_k_end, y_k_top + 10, sw))
    polygons.append(thick_line(x_k, k_mid, x_k_end, y_k_bot - 10, sw))
    # Bridge
    polygons.append(h_bar(y_h_top, x_a_r, x_k, sw, ch))

    # W (battlement base)
    y_w_top = y_h_bot; y_w_bot = 780
    w_l = x_a_l - 30; w_r = x_k_end + 20; w_span = w_r - w_l
    w_pts = [
        (w_l, y_w_top),
        (w_l + w_span * 0.25, y_w_bot),
        (cx - 50, y_w_top + 15),
        (cx + 50, y_w_bot),
        (w_l + w_span * 0.75, y_w_top + 15),
        (w_r, y_w_top),
    ]
    for i in range(len(w_pts) - 1):
        polygons.append(thick_line(w_pts[i][0], w_pts[i][1], w_pts[i+1][0], w_pts[i+1][1], sw))

    return polygons


# ============================================================
# Generate
# ============================================================
BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                    "assets", "logo-candidates", "round5-final")

concepts = {
    "concept-crown": concept_crown,
    "concept-rocket": concept_rocket,
    "concept-citadel": concept_citadel,
}

for name, func in concepts.items():
    d = os.path.join(BASE, name)
    os.makedirs(d, exist_ok=True)
    polygons = func()
    for mode in ["dark", "light"]:
        if mode == "dark":
            fh, bh = GOLD, BLACK; fr, br = GOLD_RGB, BLACK_RGB
        else:
            fh, bh = BLUE, WHITE; fr, br = BLUE_RGB, WHITE_RGB
        svg = create_svg(polygons, fh, bh)
        with open(os.path.join(d, f"{mode}.svg"), "w", encoding="utf-8") as f:
            f.write(svg)
        img = render_png(polygons, fr, br, 1024)
        img.save(os.path.join(d, f"{mode}.png"), "PNG")
        img_s = render_png(polygons, fr, br, 32)
        img_s.save(os.path.join(d, f"{mode}-small.png"), "PNG")
    print(f"✓ {name}")

print("\nDone!")
