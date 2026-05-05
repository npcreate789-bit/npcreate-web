"""
Generate og-image.png (1200x1200) for NP Create
"""
from PIL import Image, ImageDraw, ImageFont
import math, os

W, H = 1200, 1200
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "og-image.png")

def rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def rgba(h, a=255):
    return (*rgb(h), a)

img = Image.new("RGBA", (W, H), rgb("#0A0808"))
draw = ImageDraw.Draw(img, "RGBA")

FONT_DIR = os.path.join(os.path.dirname(__file__), "font")
BD  = os.path.join(FONT_DIR, "NotoSansThai-Bold.ttf")
REG = os.path.join(FONT_DIR, "NotoSansThai-Regular.ttf")

f_hero   = ImageFont.truetype(BD,  80)
f_hero2  = ImageFont.truetype(BD,  72)
f_tag    = ImageFont.truetype(BD,  32)
f_body   = ImageFont.truetype(REG, 26)
f_stat_v = ImageFont.truetype(BD,  56)
f_stat_l = ImageFont.truetype(REG, 24)
f_badge  = ImageFont.truetype(BD,  22)
f_pill   = ImageFont.truetype(REG, 22)
f_line   = ImageFont.truetype(BD,  26)
f_domain = ImageFont.truetype(REG, 26)
f_desc   = ImageFont.truetype(REG, 28)

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

orb(-80,  200, 560, "#DC2626", 46)
orb(1180, 600, 500, "#DC2626", 28)
orb(600,  1000, 480, "#DC2626", 14)

draw = ImageDraw.Draw(img, "RGBA")

# ── Top & bottom gradient lines ───────────────────────────────────────────────
for x in range(W):
    g = math.exp(-((x/W - 0.5)**2) / (2*0.12**2))
    draw.line([(x, 0), (x, 3)],   fill=(220, 38, 38, int(200*g)))
    draw.line([(x, H-3), (x, H)], fill=(220, 38, 38, int(100*g)))

# ── Right decoration: rings + dot grid ───────────────────────────────────────
cx_r, cy_r = 980, 340

for ring_r, alpha in [(260, 12), (200, 18), (145, 26), (90, 38)]:
    steps = max(180, ring_r * 4)
    for i in range(steps):
        rad = 2 * math.pi * i / steps
        px = int(cx_r + ring_r * math.cos(rad))
        py = int(cy_r + ring_r * math.sin(rad))
        if 0 <= px < W and 0 <= py < H:
            draw.point((px, py), fill=(220, 38, 38, alpha))

for ring_r in range(46, 0, -1):
    a = int(90 * (1 - ring_r/46)**1.5)
    steps = max(60, ring_r * 5)
    for i in range(steps):
        rad = 2 * math.pi * i / steps
        px = int(cx_r + ring_r * math.cos(rad))
        py = int(cy_r + ring_r * math.sin(rad))
        if 0 <= px < W and 0 <= py < H:
            draw.point((px, py), fill=(220, 38, 38, a))

for r in range(12):
    for c in range(10):
        px = 780 + c * 44
        py = 100 + r * 44
        dc = math.sqrt((px - cx_r)**2 + (py - cy_r)**2)
        a = max(0, int(55 - dc * 0.09))
        if a > 4:
            draw.ellipse([px-2, py-2, px+2, py+2], fill=rgba("#DC2626", a))

draw.ellipse([cx_r-6, cy_r-6, cx_r+6, cy_r+6], fill=rgba("#FCA5A5", 200))
draw.ellipse([cx_r-2, cy_r-2, cx_r+2, cy_r+2], fill=rgba("#FFFFFF", 255))

# ── Bottom-right second ring cluster ─────────────────────────────────────────
cx_b, cy_b = 1050, 920
for ring_r, alpha in [(160, 8), (110, 14), (66, 22)]:
    steps = max(120, ring_r * 3)
    for i in range(steps):
        rad = 2 * math.pi * i / steps
        px = int(cx_b + ring_r * math.cos(rad))
        py = int(cy_b + ring_r * math.sin(rad))
        if 0 <= px < W and 0 <= py < H:
            draw.point((px, py), fill=(220, 38, 38, alpha))

# ── Left accent bar ───────────────────────────────────────────────────────────
for y in range(200, 900):
    t = (y - 200) / 700
    a = int(200 * math.sin(math.pi * t))
    draw.line([(66, y), (71, y)], fill=(220, 38, 38, a))

TX = 110

# ── Badge ─────────────────────────────────────────────────────────────────────
bx, by = TX, 148
draw.rounded_rectangle([bx, by, bx+158, by+40], radius=20,
    fill=rgba("#DC2626", 40), outline=rgba("#DC2626", 110), width=1)
draw.text((bx+16, by+8), "NP Create", font=f_badge, fill=rgba("#FCA5A5"))

# ── Headings ──────────────────────────────────────────────────────────────────
draw.text((TX, 210), "รับดูแลแบรนด์ ร้านค้า", font=f_hero,  fill=rgb("#FFFFFF"))
draw.text((TX, 306), "ทำการตลาดครบวงจร",      font=f_hero2, fill=rgb("#DC2626"))

# ── Sub label ────────────────────────────────────────────────────────────────
draw.text((TX, 396), "GMV Max & TikTok Shop Expert", font=f_tag, fill=rgba("#94A3B8"))

# ── Service pills row ─────────────────────────────────────────────────────────
services = ["จัดหา Affiliate", "ทำคลิป", "ทีมไลฟ์สด", "ติดตั้งระบบไลฟ์สด"]
pill_x = TX
pill_y = 452
pill_h = 38
pill_gap = 10

for svc in services:
    bbox = f_pill.getbbox(svc)
    tw = bbox[2] - bbox[0]
    pw = tw + 28
    draw.rounded_rectangle(
        [pill_x, pill_y, pill_x + pw, pill_y + pill_h],
        radius=19,
        fill=rgba("#FFFFFF", 8),
        outline=rgba("#FFFFFF", 20),
        width=1,
    )
    draw.text((pill_x + 14, pill_y + 7), svc, font=f_pill, fill=rgba("#94A3B8"))
    pill_x += pw + pill_gap

# ── Divider ───────────────────────────────────────────────────────────────────
for x in range(TX, TX + 680):
    t = (x - TX) / 680
    a = int(90 * (1 - t**1.5))
    draw.point((x, 514), fill=(220, 38, 38, a))

# ── Stats ─────────────────────────────────────────────────────────────────────
stats = [("500+", "แบรนด์ที่ดูแล"), ("800M+", "ยอดขาย (฿)"), ("30x", "ROI สูงสุด")]
sx = TX
for i, (val, lbl) in enumerate(stats):
    draw.text((sx, 534), val, font=f_stat_v, fill=rgb("#F59E0B"))
    draw.text((sx, 604), lbl, font=f_stat_l, fill=rgba("#475569"))
    if i < len(stats) - 1:
        draw.line([(sx + 210, 540), (sx + 210, 630)], fill=rgba("#FFFFFF", 10), width=1)
    sx += 228

# ── Divider ───────────────────────────────────────────────────────────────────
for x in range(TX, W - TX):
    t = (x - TX) / (W - TX * 2)
    a = int(22 * math.sin(math.pi * t))
    draw.point((x, 660), fill=(255, 255, 255, a))

# ── Description block ────────────────────────────────────────────────────────
desc_lines = [
    "ทีมผู้เชี่ยวชาญด้าน TikTok Shop และ GMV Max",
    "ครบวงจร ตั้งแต่วางกลยุทธ์ ยิงแอด ผลิตคอนเทนต์",
    "ไปจนถึงวิเคราะห์ผลและรีพอร์ตรายสัปดาห์",
]
dy = 696
for line in desc_lines:
    draw.text((TX, dy), line, font=f_desc, fill=rgba("#475569"))
    dy += 44

# ── Feature cards row ────────────────────────────────────────────────────────
features = [
    ("ยิงแอด GMV Max",    "#DC2626"),
    ("วางกลยุทธ์",        "#6366F1"),
    ("คอนเทนต์ & Creative","#10B981"),
    ("รายงานผลรายสัปดาห์","#F59E0B"),
]
card_w, card_h = 242, 72
card_gap = 16
card_x = TX
card_y = 840

for label, color in features:
    cr, cg, cb = rgb(color)
    draw.rounded_rectangle(
        [card_x, card_y, card_x + card_w, card_y + card_h],
        radius=16,
        fill=(cr, cg, cb, 18),
        outline=(cr, cg, cb, 55),
        width=1,
    )
    draw.rounded_rectangle(
        [card_x + 16, card_y + card_h//2 - 6, card_x + 28, card_y + card_h//2 + 6],
        radius=3,
        fill=(cr, cg, cb, 200),
    )
    draw.text((card_x + 38, card_y + 20), label, font=f_pill, fill=rgba("#E2E8F0"))
    card_x += card_w + card_gap

# ── Divider ───────────────────────────────────────────────────────────────────
for x in range(TX, W - TX):
    t = (x - TX) / (W - TX * 2)
    a = int(18 * math.sin(math.pi * t))
    draw.point((x, 946), fill=(255, 255, 255, a))

# ── Bottom info ───────────────────────────────────────────────────────────────
line_x = TX
draw.ellipse([line_x, 974, line_x+14, 988], fill=rgba("#06C755", 220))
draw.text((line_x + 22, 966), "Line OA:", font=f_domain, fill=rgba("#64748B"))
draw.text((line_x + 106, 966), "@npcreate", font=f_line, fill=rgba("#06C755", 210))
draw.text((TX + 380, 966), "npcreate.co.th", font=f_domain, fill=rgba("#374151"))

# ── Save ──────────────────────────────────────────────────────────────────────
img.convert("RGB").save(OUT, "PNG", optimize=True)
print(f"Saved: {OUT}  ({W}x{H})")
