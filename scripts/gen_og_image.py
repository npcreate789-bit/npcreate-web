"""
Generate og-image.png (1200x630) for NP Create
"""
from PIL import Image, ImageDraw, ImageFont
import math, os

W, H = 1200, 630
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "og-image.png")

def rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def rgba(h, a=255):
    return (*rgb(h), a)

img = Image.new("RGBA", (W, H), rgb("#0A0808"))
draw = ImageDraw.Draw(img, "RGBA")

BD  = "C:/Windows/Fonts/tahomabd.ttf"
REG = "C:/Windows/Fonts/tahoma.ttf"

f_hero   = ImageFont.truetype(BD,  58)
f_hero2  = ImageFont.truetype(BD,  52)
f_tag    = ImageFont.truetype(BD,  26)
f_body   = ImageFont.truetype(REG, 21)
f_stat_v = ImageFont.truetype(BD,  36)
f_stat_l = ImageFont.truetype(REG, 17)
f_badge  = ImageFont.truetype(BD,  16)
f_pill   = ImageFont.truetype(REG, 15)
f_line   = ImageFont.truetype(BD,  17)
f_domain = ImageFont.truetype(REG, 17)

# ── Background orbs ───────────────────────────────────────────────────────────
def orb(cx, cy, r, color_hex, peak=55):
    for px in range(max(0, cx-r), min(W, cx+r)):
        for py in range(max(0, cy-r), min(H, cy+r)):
            d = math.sqrt((px-cx)**2 + (py-cy)**2)
            if d < r:
                t = (1 - d/r) ** 2
                a = int(peak * t)
                cr, cg, cb = rgb(color_hex)
                cur = img.getpixel((px, py))
                img.putpixel((px, py), (
                    min(255, cur[0] + cr*a//255),
                    min(255, cur[1] + cg*a//255),
                    min(255, cur[2] + cb*a//255),
                    255
                ))

orb(-80,  150, 510, "#DC2626", 46)
orb(1120, 480, 440, "#DC2626", 28)
orb(680,  300, 560, "#DC2626", 12)

draw = ImageDraw.Draw(img, "RGBA")

# ── Top & bottom gradient lines ───────────────────────────────────────────────
for x in range(W):
    g = math.exp(-((x/W - 0.5)**2) / (2*0.12**2))
    draw.line([(x, 0), (x, 2)],   fill=(220, 38, 38, int(180*g)))
    draw.line([(x, H-2), (x, H)], fill=(220, 38, 38, int(90*g)))

# ── Right decoration: rings + dot grid ───────────────────────────────────────
cx_r, cy_r = 1000, 285

for ring_r, alpha in [(210, 14), (162, 20), (115, 30), (70, 44)]:
    steps = max(180, ring_r * 4)
    for i in range(steps):
        rad = 2 * math.pi * i / steps
        px = int(cx_r + ring_r * math.cos(rad))
        py = int(cy_r + ring_r * math.sin(rad))
        if 0 <= px < W and 0 <= py < H:
            draw.point((px, py), fill=(220, 38, 38, alpha))

for ring_r in range(38, 0, -1):
    a = int(80 * (1 - ring_r/38)**1.5)
    steps = max(60, ring_r * 5)
    for i in range(steps):
        rad = 2 * math.pi * i / steps
        px = int(cx_r + ring_r * math.cos(rad))
        py = int(cy_r + ring_r * math.sin(rad))
        if 0 <= px < W and 0 <= py < H:
            draw.point((px, py), fill=(220, 38, 38, a))

for r in range(10):
    for c in range(9):
        px = 830 + c * 40
        py = 110 + r * 40
        dc = math.sqrt((px - cx_r)**2 + (py - cy_r)**2)
        a = max(0, int(60 - dc * 0.1))
        if a > 4:
            draw.ellipse([px-2, py-2, px+2, py+2], fill=rgba("#DC2626", a))

draw.ellipse([cx_r-5, cy_r-5, cx_r+5, cy_r+5], fill=rgba("#FCA5A5", 200))
draw.ellipse([cx_r-2, cy_r-2, cx_r+2, cy_r+2], fill=rgba("#FFFFFF", 255))

# ── Left accent bar ───────────────────────────────────────────────────────────
for y in range(148, 500):
    t = (y - 148) / 352
    a = int(220 * math.sin(math.pi * t))
    draw.line([(66, y), (70, y)], fill=(220, 38, 38, a))

TX = 92

# ── Badge ─────────────────────────────────────────────────────────────────────
bx, by = TX, 96
draw.rounded_rectangle([bx, by, bx+124, by+30], radius=15,
    fill=rgba("#DC2626", 40), outline=rgba("#DC2626", 110), width=1)
draw.text((bx+13, by+7), "NP Create", font=f_badge, fill=rgba("#FCA5A5"))

# ── Headings ──────────────────────────────────────────────────────────────────
draw.text((TX, 144), "รับดูแลแบรนด์ ร้านค้า", font=f_hero, fill=rgb("#FFFFFF"))
draw.text((TX, 212), "ทำการตลาดครบวงจร", font=f_hero2, fill=rgb("#DC2626"))

# ── Sub label ────────────────────────────────────────────────────────────────
draw.text((TX, 278), "GMV Max & TikTok Shop Expert", font=f_tag, fill=rgba("#94A3B8"))

# ── Service pills row ─────────────────────────────────────────────────────────
services = ["จัดหา Affiliate", "ทำคลิป", "ทีมไลฟ์สด", "ติดตั้งระบบไลฟ์สด"]
pill_x = TX
pill_y = 320
pill_h = 26
pill_gap = 8

for svc in services:
    # measure text width approx
    bbox = f_pill.getbbox(svc)
    tw = bbox[2] - bbox[0]
    pw = tw + 20

    draw.rounded_rectangle(
        [pill_x, pill_y, pill_x + pw, pill_y + pill_h],
        radius=13,
        fill=rgba("#FFFFFF", 8),
        outline=rgba("#FFFFFF", 20),
        width=1,
    )
    draw.text((pill_x + 10, pill_y + 5), svc, font=f_pill, fill=rgba("#94A3B8"))
    pill_x += pw + pill_gap

# ── Divider ───────────────────────────────────────────────────────────────────
for x in range(TX, TX + 520):
    t = (x - TX) / 520
    a = int(80 * (1 - t**1.5))
    draw.point((x, 362), fill=(220, 38, 38, a))

# ── Stats ─────────────────────────────────────────────────────────────────────
stats = [("500+", "แบรนด์ที่ดูแล"), ("800M+", "ยอดขาย (฿)"), ("30x", "ROI สูงสุด")]
sx = TX
for i, (val, lbl) in enumerate(stats):
    draw.text((sx, 375), val, font=f_stat_v, fill=rgb("#F59E0B"))
    draw.text((sx, 419), lbl, font=f_stat_l, fill=rgba("#475569"))
    if i < len(stats) - 1:
        draw.line([(sx + 178, 378), (sx + 178, 444)], fill=rgba("#FFFFFF", 10), width=1)
    sx += 192

# ── Bottom bar ────────────────────────────────────────────────────────────────
for x in range(TX, W - TX):
    t = (x - TX) / (W - TX * 2)
    a = int(18 * math.sin(math.pi * t))
    draw.point((x, 470), fill=(255, 255, 255, a))

# LINE OA (green)
line_x = TX
draw.ellipse([line_x, 484, line_x+10, 494], fill=rgba("#06C755", 220))
draw.text((line_x + 16, 481), "Line OA:", font=f_domain, fill=rgba("#64748B"))
draw.text((line_x + 74, 481), "@npcreate", font=f_line, fill=rgba("#06C755", 210))

# Domain (right-aligned bottom)
draw.text((TX + 280, 481), "npcreate.co.th", font=f_domain, fill=rgba("#374151"))

# ── Save ──────────────────────────────────────────────────────────────────────
img.convert("RGB").save(OUT, "PNG", optimize=True)
print(f"Saved: {OUT}  ({W}x{H})")
