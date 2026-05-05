"""
Generate og-image.png (1200x630) for NP Create
"""
from PIL import Image, ImageDraw, ImageFont
import math, os

W, H = 1200, 630
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "og-image.png")

FONT_DIR = os.path.join(os.path.dirname(__file__), "font")
BD  = os.path.join(FONT_DIR, "NotoSansThai-Bold.ttf")
REG = os.path.join(FONT_DIR, "NotoSansThai-Regular.ttf")

def rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def rgba(h, a=255):
    return (*rgb(h), a)

def orb(img, cx, cy, r, color_hex, peak=55):
    cr, cg, cb = rgb(color_hex)
    for px in range(max(0, cx-r), min(W, cx+r)):
        for py in range(max(0, cy-r), min(H, cy+r)):
            d = math.sqrt((px-cx)**2 + (py-cy)**2)
            if d < r:
                t = (1 - d/r) ** 2
                a = int(peak * t)
                cur = img.getpixel((px, py))
                img.putpixel((px, py), (
                    min(255, cur[0] + cr*a//255),
                    min(255, cur[1] + cg*a//255),
                    min(255, cur[2] + cb*a//255),
                    255
                ))

# ── Canvas ────────────────────────────────────────────────────────────────────
img = Image.new("RGBA", (W, H), rgb("#080606"))
orb(img,  -60,   80, 420, "#DC2626", 44)
orb(img, 1260,  550, 400, "#DC2626", 28)
orb(img,  620,  315, 500, "#DC2626",  6)

draw = ImageDraw.Draw(img, "RGBA")

# ── Fonts ─────────────────────────────────────────────────────────────────────
f_h1      = ImageFont.truetype(BD,  56)
f_h2      = ImageFont.truetype(BD,  54)
f_sub     = ImageFont.truetype(BD,  22)
f_badge   = ImageFont.truetype(BD,  17)
f_pill    = ImageFont.truetype(REG, 17)
f_pill_b  = ImageFont.truetype(BD,  17)
f_stat_v  = ImageFont.truetype(BD,  46)
f_stat_l  = ImageFont.truetype(REG, 17)
f_live    = ImageFont.truetype(BD,  12)
f_aud     = ImageFont.truetype(BD,  18)
f_aud_sm  = ImageFont.truetype(REG, 14)
f_section = ImageFont.truetype(BD,  15)
f_footer  = ImageFont.truetype(REG, 19)
f_footer_b= ImageFont.truetype(BD,  19)

TX = 82       # left margin
CX = 650      # column split x

# ── Top / bottom edge glow ────────────────────────────────────────────────────
for x in range(W):
    g = math.exp(-((x/W - 0.5)**2) / (2*0.15**2))
    draw.line([(x, 0), (x, 2)],   fill=(220, 38, 38, int(220*g)))
    draw.line([(x, H-2), (x, H)], fill=(220, 38, 38, int(100*g)))

# ── Left accent bar ───────────────────────────────────────────────────────────
for y in range(52, 540):
    t = (y - 52) / 488
    a = int(200 * math.sin(math.pi * t))
    draw.line([(54, y), (58, y)], fill=(220, 38, 38, a))

# ── Right dot grid ────────────────────────────────────────────────────────────
for r in range(7):
    for c in range(7):
        px = 870 + c * 36
        py =  34 + r * 36
        if px < W and py < H:
            draw.ellipse([px-1, py-1, px+1, py+1], fill=rgba("#DC2626", 24))

# ── Right ring decoration ─────────────────────────────────────────────────────
cx_r, cy_r = 960, 252

for ring_r, alpha in [(210, 10), (165, 16), (120, 24), (76, 36)]:
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

draw.ellipse([cx_r-5, cy_r-5, cx_r+5, cy_r+5], fill=rgba("#FCA5A5", 180))
draw.ellipse([cx_r-2, cy_r-2, cx_r+2, cy_r+2], fill=rgba("#FFFFFF", 255))

# ── Right service tags ────────────────────────────────────────────────────────
RIGHT_SERVICES = [
    ("ยิงแอด GMV Max",       "ROI 30+",           "#DC2626"),
    ("ทีมไลฟ์สด",            "มืออาชีพ 24 ชม.",   "#10B981"),
    ("ติดตั้งระบบไลฟ์สด",   "ครบ จบในที่เดียว",  "#06B6D4"),
    ("จัดหา Affiliate",      "ด้วยระบบของเราเอง",  "#F59E0B"),
]
tag_w, tag_h = 218, 64
tag_gap = 10
tag_x0  = CX + 20
tag_y0  = 370

tag_ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
tov = ImageDraw.Draw(tag_ov)

for i, (label, sub, color) in enumerate(RIGHT_SERVICES):
    col = i % 2
    row = i // 2
    tx = tag_x0 + col * (tag_w + tag_gap)
    ty = tag_y0 + row * (tag_h + tag_gap)
    cr, cg, cb = rgb(color)
    highlight = color in ("#10B981", "#06B6D4")
    fill_a   = 32 if highlight else 16
    border_a = 110 if highlight else 55
    tov.rounded_rectangle([tx, ty, tx+tag_w, ty+tag_h], radius=14,
        fill=(cr, cg, cb, fill_a), outline=(cr, cg, cb, border_a), width=1)
    for sx in range(tx+2, tx+tag_w-2):
        t2 = (sx - tx) / tag_w
        ga = int((70 if highlight else 40) * math.sin(math.pi * t2))
        tov.line([(sx, ty+1), (sx, ty+2)], fill=(cr, cg, cb, ga))
    tov.ellipse([tx+12, ty+14, tx+22, ty+24], fill=(cr, cg, cb, 200))
    if highlight:
        lb_w2, lb_h2 = 38, 18
        lbx2 = tx + tag_w - lb_w2 - 8
        lby2 = ty + 7
        tov.rounded_rectangle([lbx2, lby2, lbx2+lb_w2, lby2+lb_h2], radius=9,
            fill=(cr, cg, cb, 50), outline=(cr, cg, cb, 150), width=1)
        tov.text((lbx2+6, lby2+2), "LIVE", font=f_live, fill=(cr, cg, cb, 255))

img = Image.alpha_composite(img, tag_ov)
draw = ImageDraw.Draw(img, "RGBA")

for i, (label, sub, color) in enumerate(RIGHT_SERVICES):
    col = i % 2
    row = i // 2
    tx = tag_x0 + col * (tag_w + tag_gap)
    ty = tag_y0 + row * (tag_h + tag_gap)
    cr, cg, cb = rgb(color)
    draw.text((tx+30, ty+10), label, font=f_pill_b, fill=rgba("#F1F5F9"))
    draw.text((tx+30, ty+36), sub,   font=f_aud_sm, fill=(cr, cg, cb, 160))

# ── Vertical separator ────────────────────────────────────────────────────────
for y in range(52, 560):
    t = (y - 52) / 508
    a = int(30 * math.sin(math.pi * t))
    draw.point((CX + 6, y), fill=(255, 255, 255, a))

# ── LEFT SECTION ──────────────────────────────────────────────────────────────

def hdivider(y, x0=TX, x1=CX-10, color="#DC2626", alpha=55):
    for x in range(x0, x1):
        t = (x - x0) / (x1 - x0)
        a = int(alpha * math.sin(math.pi * t))
        draw.point((x, y), fill=(*rgb(color), a))

# Badge
bx, by = TX, 50
draw.rounded_rectangle([bx, by, bx+148, by+36], radius=18,
    fill=rgba("#DC2626", 36), outline=rgba("#DC2626", 110), width=1)
draw.ellipse([bx+12, by+13, bx+20, by+22], fill=rgba("#FCA5A5", 200))
draw.text((bx+26, by+7), "NP Create", font=f_badge, fill=rgba("#FCA5A5"))

# Headlines
draw.text((TX, 100), "รับดูแลแบรนด์ ร้านค้า", font=f_h1, fill=rgb("#FFFFFF"))
draw.text((TX, 162), "TikTok Shop ครบวงจร",   font=f_h2, fill=rgb("#DC2626"))
draw.text((TX, 224), "GMV Max & TikTok Live",  font=f_sub, fill=rgba("#64748B"))

# Divider 1
hdivider(258)

# Service pills row
PILLS = [
    ("ทีมไลฟ์สด",          "#10B981"),
    ("ยิงแอด GMV Max",      "#DC2626"),
    ("Affiliate",           "#F59E0B"),
    ("Content & Creative",  "#6366F1"),
]
pill_x = TX
pill_y = 272
pill_h = 30
pill_gap = 8

pill_ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
pov = ImageDraw.Draw(pill_ov)

for label, color in PILLS:
    cr, cg, cb = rgb(color)
    bbox = f_pill.getbbox(label)
    pw = (bbox[2] - bbox[0]) + 22
    if pill_x + pw > CX - 10:
        break
    pov.rounded_rectangle([pill_x, pill_y, pill_x+pw, pill_y+pill_h], radius=15,
        fill=(cr, cg, cb, 20), outline=(cr, cg, cb, 70), width=1)
    pill_x += pw + pill_gap

img = Image.alpha_composite(img, pill_ov)
draw = ImageDraw.Draw(img, "RGBA")

pill_x = TX
for label, color in PILLS:
    cr, cg, cb = rgb(color)
    bbox = f_pill.getbbox(label)
    pw = (bbox[2] - bbox[0]) + 22
    if pill_x + pw > CX - 10:
        break
    draw.text((pill_x + 11, pill_y + 6), label, font=f_pill, fill=(cr, cg, cb, 200))
    pill_x += pw + pill_gap

# Divider 2
hdivider(316)

# Stats
STATS = [("500+", "แบรนด์ที่ดูแล"), ("800M+", "ยอดขาย (฿)"), ("30x", "ROI สูงสุด")]
stat_col_w = (CX - TX - 20) // 3
sx = TX
sy = 330
for i, (val, lbl) in enumerate(STATS):
    draw.text((sx, sy),      val, font=f_stat_v, fill=rgb("#F59E0B"))
    draw.text((sx, sy + 54), lbl, font=f_stat_l, fill=rgba("#475569"))
    if i < len(STATS) - 1:
        sep_x = sx + stat_col_w - 8
        draw.line([(sep_x, sy+4), (sep_x, sy+72)], fill=rgba("#FFFFFF", 8), width=1)
    sx += stat_col_w

# Divider 3
hdivider(416)

# Audience pills (ระบบรับงานเฉพาะ)
draw.text((TX, 426), "ระบบรับงานเฉพาะ · ให้บริการระหว่าง", font=f_section, fill=rgba("#475569"))

AUDIENCES = [
    ("ร้านค้า",  "TikTok Shop",       "#10B981"),
    ("แบรนด์",   "เจ้าของสินค้า",     "#6366F1"),
    ("นายหน้า",  "Affiliate",          "#F59E0B"),
]
aud_col_w = (CX - TX - 20) // 3
aud_gap   = 10
aud_y     = 452
ax        = TX

aud_ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
aov = ImageDraw.Draw(aud_ov)
for title, sub, color in AUDIENCES:
    cr, cg, cb = rgb(color)
    aw = aud_col_w - aud_gap
    aov.rounded_rectangle([ax, aud_y, ax+aw, aud_y+74], radius=12,
        fill=(cr, cg, cb, 22), outline=(cr, cg, cb, 80), width=1)
    for sx2 in range(ax+2, ax+aw-2):
        t3 = (sx2 - ax) / aw
        ga = int(55 * math.sin(math.pi * t3))
        aov.line([(sx2, aud_y+1), (sx2, aud_y+2)], fill=(cr, cg, cb, ga))
    aov.ellipse([ax+12, aud_y+16, ax+22, aud_y+26], fill=(cr, cg, cb, 200))
    ax += aud_col_w

img = Image.alpha_composite(img, aud_ov)
draw = ImageDraw.Draw(img, "RGBA")

ax = TX
for title, sub, color in AUDIENCES:
    cr, cg, cb = rgb(color)
    aw = aud_col_w - aud_gap
    draw.text((ax+30, aud_y+12), title, font=f_aud,    fill=rgba("#F1F5F9"))
    draw.text((ax+30, aud_y+42), sub,   font=f_aud_sm, fill=(cr, cg, cb, 160))
    ax += aud_col_w

# Footer
footer_y = H - 62
for x in range(TX, W - TX):
    t = (x - TX) / (W - TX*2)
    a = int(16 * math.sin(math.pi * t))
    draw.point((x, footer_y), fill=(255, 255, 255, a))

fy = footer_y + 16
draw.ellipse([TX, fy+5, TX+10, fy+15], fill=rgba("#06C755", 220))
draw.text((TX+16, fy),     "Line OA",       font=f_footer,   fill=rgba("#475569"))
loa_w = f_footer.getbbox("Line OA")[2] - f_footer.getbbox("Line OA")[0]
draw.text((TX+16+loa_w+14, fy), "@npcreate", font=f_footer_b, fill=rgba("#06C755", 220))
draw.text((TX+390, fy),    "npcreate.co.th", font=f_footer,   fill=rgba("#2D3748"))

# ── Save ──────────────────────────────────────────────────────────────────────
img.convert("RGB").save(OUT, "PNG", optimize=True)
print(f"Saved: {OUT}  ({W}x{H})")
