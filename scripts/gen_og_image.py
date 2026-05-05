"""
Generate og-image.png (1200x1200) for NP Create
"""
from PIL import Image, ImageDraw, ImageFont
import math, os

W, H = 1200, 1200
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
orb(img, -60,  120,  580, "#DC2626", 42)
orb(img, 1260, 1080, 520, "#DC2626", 32)
orb(img, 580,  600,  700, "#DC2626",  7)

draw = ImageDraw.Draw(img, "RGBA")

# ── Fonts ─────────────────────────────────────────────────────────────────────
f_h1      = ImageFont.truetype(BD,  68)
f_h2      = ImageFont.truetype(BD,  70)
f_sub     = ImageFont.truetype(BD,  30)
f_section = ImageFont.truetype(BD,  20)
f_card    = ImageFont.truetype(BD,  24)
f_card_sm = ImageFont.truetype(REG, 19)
f_stat_v  = ImageFont.truetype(BD,  62)
f_stat_l  = ImageFont.truetype(REG, 22)
f_badge   = ImageFont.truetype(BD,  21)
f_live    = ImageFont.truetype(BD,  15)
f_footer  = ImageFont.truetype(REG, 25)
f_footer_b= ImageFont.truetype(BD,  25)

TX = 90  # left margin

# ── Top / bottom edge glow ────────────────────────────────────────────────────
for x in range(W):
    g = math.exp(-((x/W - 0.5)**2) / (2*0.15**2))
    draw.line([(x, 0), (x, 3)],   fill=(220, 38, 38, int(220*g)))
    draw.line([(x, H-3), (x, H)], fill=(220, 38, 38, int(120*g)))

# ── Left accent bar ───────────────────────────────────────────────────────────
for y in range(140, 980):
    t = (y - 140) / 840
    a = int(210 * math.sin(math.pi * t))
    draw.line([(60, y), (65, y)], fill=(220, 38, 38, a))

# ── Subtle dot grid (top-right corner) ───────────────────────────────────────
for r in range(8):
    for c in range(8):
        px = 880 + c * 38
        py =  80 + r * 38
        if px < W and py < H:
            draw.ellipse([px-1, py-1, px+1, py+1], fill=rgba("#DC2626", 28))

# ── Badge ─────────────────────────────────────────────────────────────────────
bx, by = TX, 82
draw.rounded_rectangle([bx, by, bx+162, by+42], radius=21,
    fill=rgba("#DC2626", 38), outline=rgba("#DC2626", 120), width=1)
draw.ellipse([bx+14, by+16, bx+22, by+26], fill=rgba("#FCA5A5", 200))
draw.text((bx+30, by+9), "NP Create", font=f_badge, fill=rgba("#FCA5A5"))

# ── Headline ──────────────────────────────────────────────────────────────────
draw.text((TX, 148), "รับดูแลแบรนด์ ร้านค้า",  font=f_h1, fill=rgb("#FFFFFF"))
draw.text((TX, 232), "TikTok Shop ครบวงจร",    font=f_h2, fill=rgb("#DC2626"))
draw.text((TX, 320), "GMV Max & TikTok Live", font=f_sub, fill=rgba("#64748B"))

# ── Section divider ───────────────────────────────────────────────────────────
def hdivider(y, x0=TX, x1=W-TX, color="#DC2626", alpha=60):
    for x in range(x0, x1):
        t = (x - x0) / (x1 - x0)
        a = int(alpha * math.sin(math.pi * t))
        draw.point((x, y), fill=(*rgb(color), a))

hdivider(386)

# ── Section label ─────────────────────────────────────────────────────────────
draw.text((TX, 402), "บริการของเรา", font=f_section, fill=rgba("#475569"))
lbl_bbox = f_section.getbbox("บริการของเรา")
lw = lbl_bbox[2] - lbl_bbox[0]
draw.line([(TX + lw + 12, 413), (TX + lw + 80, 413)], fill=rgba("#DC2626", 60), width=1)

# ── Service cards 3 × 2 ───────────────────────────────────────────────────────
SERVICES = [
    # (label, sublabel, color, highlight?)
    ("ยิงแอด GMV Max",       "ROI 30+ ดูแล 24 ชม.", "#DC2626", False),
    ("จัดหา Affiliate",      "ด้วยระบบของเราเอง",  "#F59E0B", False),
    ("Content & Creative",   "A/B Testing ทุกชิ้น","#6366F1", False),
    ("วางกลยุทธ์",           "แผนรายเดือน",        "#EC4899", False),
    ("ทีมไลฟ์สด",            "มืออาชีพ 24 ชม.",   "#10B981", True ),
    ("ติดตั้งระบบไลฟ์สด",   "ครบ จบในที่เดียว",  "#06B6D4", True ),
]

cols      = 3
card_gap  = 14
card_h    = 96
card_y0   = 436
avail_w   = W - TX * 2
card_w    = (avail_w - card_gap * (cols - 1)) // cols

# use a separate overlay so alpha compositing works correctly
card_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ov = ImageDraw.Draw(card_overlay)

for i, (label, sub, color, highlight) in enumerate(SERVICES):
    row = i // cols
    col = i % cols
    cx  = TX + col * (card_w + card_gap)
    cy  = card_y0 + row * (card_h + card_gap)
    cr, cg, cb = rgb(color)

    fill_a   = 38 if highlight else 18
    border_a = 130 if highlight else 65

    ov.rounded_rectangle(
        [cx, cy, cx + card_w, cy + card_h],
        radius=18,
        fill=(cr, cg, cb, fill_a),
        outline=(cr, cg, cb, border_a),
        width=1,
    )

    # top accent stripe
    stripe_a = 90 if highlight else 50
    for sx in range(cx + 2, cx + card_w - 2):
        t = (sx - cx) / card_w
        ga = int(stripe_a * math.sin(math.pi * t))
        ov.line([(sx, cy + 1), (sx, cy + 2)], fill=(cr, cg, cb, ga))

    # color dot
    ov.ellipse([cx+18, cy+20, cx+30, cy+32], fill=(cr, cg, cb, 200))

    # LIVE badge for highlighted
    if highlight:
        lb_w, lb_h = 46, 22
        lbx = cx + card_w - lb_w - 12
        lby = cy + 10
        ov.rounded_rectangle([lbx, lby, lbx+lb_w, lby+lb_h], radius=11,
            fill=(cr, cg, cb, 55), outline=(cr, cg, cb, 160), width=1)
        ov.text((lbx+8, lby+3), "LIVE", font=f_live, fill=(cr, cg, cb, 255))

# composite cards onto main image
img = Image.alpha_composite(img, card_overlay)
draw = ImageDraw.Draw(img, "RGBA")

# draw text on cards (text after compositing for sharpness)
for i, (label, sub, color, highlight) in enumerate(SERVICES):
    row = i // cols
    col = i % cols
    cx  = TX + col * (card_w + card_gap)
    cy  = card_y0 + row * (card_h + card_gap)
    cr, cg, cb = rgb(color)
    text_col = rgba("#F1F5F9") if highlight else rgba("#CBD5E1")
    draw.text((cx+44, cy+14), label, font=f_card,    fill=text_col)
    draw.text((cx+44, cy+50), sub,   font=f_card_sm, fill=(cr, cg, cb, 180))

# ── Divider after grid ────────────────────────────────────────────────────────
grid_bottom = card_y0 + 2 * card_h + card_gap + 16
hdivider(grid_bottom)

# ── Stats ─────────────────────────────────────────────────────────────────────
stats = [("500+", "แบรนด์ที่ดูแล"), ("800M+", "ยอดขาย (฿)"), ("30+", "ROI สูงสุด")]
stat_y = grid_bottom + 30
sx = TX
stat_col_w = (W - TX * 2) // len(stats)
for i, (val, lbl) in enumerate(stats):
    draw.text((sx, stat_y),      val, font=f_stat_v, fill=rgb("#F59E0B"))
    draw.text((sx, stat_y + 72), lbl, font=f_stat_l, fill=rgba("#475569"))
    if i < len(stats) - 1:
        sep_x = sx + stat_col_w - 10
        draw.line([(sep_x, stat_y+4), (sep_x, stat_y+90)],
                  fill=rgba("#FFFFFF", 10), width=1)
    sx += stat_col_w

# ── Divider ───────────────────────────────────────────────────────────────────
stat_bottom = stat_y + 110
hdivider(stat_bottom, alpha=30)

# ── System section: ระบบรับงานเฉพาะ ──────────────────────────────────────────
sys_y = stat_bottom + 22

# Background box with overlay
sys_ov_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
sys_ov = ImageDraw.Draw(sys_ov_img)
sys_ov.rounded_rectangle(
    [TX, sys_y, W - TX, sys_y + 190],
    radius=22,
    fill=(220, 38, 38, 10),
    outline=(220, 38, 38, 35),
    width=1,
)
img = Image.alpha_composite(img, sys_ov_img)
draw = ImageDraw.Draw(img, "RGBA")

# Section header inside box
draw.text((TX + 24, sys_y + 18),
    "ระบบรับงานเฉพาะของเรา", font=f_section, fill=rgba("#DC2626"))
lbbox2 = f_section.getbbox("ระบบรับงานเฉพาะของเรา")
lw2 = lbbox2[2] - lbbox2[0]
draw.line([(TX + 24 + lw2 + 10, sys_y + 29), (TX + 24 + lw2 + 70, sys_y + 29)],
          fill=rgba("#DC2626", 50), width=1)
draw.text((TX + 24 + lw2 + 80, sys_y + 16),
    "· ให้บริการระหว่าง", font=f_section, fill=rgba("#475569"))

# Audience cards (3 cols)
AUDIENCES = [
    ("ร้านค้า",          "TikTok Shop",         "#10B981"),
    ("แบรนด์",           "เจ้าของสินค้า",        "#6366F1"),
    ("นายหน้า",          "Affiliate",             "#F59E0B"),
]
aud_col_w = (W - TX * 2 - 24 * 2 - 20 * 2) // 3
aud_gap   = 20
aud_y     = sys_y + 56
ax        = TX + 24

aud_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
aov = ImageDraw.Draw(aud_overlay)

for title, sub, color in AUDIENCES:
    cr, cg, cb = rgb(color)
    aov.rounded_rectangle(
        [ax, aud_y, ax + aud_col_w, aud_y + 108],
        radius=16,
        fill=(cr, cg, cb, 28),
        outline=(cr, cg, cb, 90),
        width=1,
    )
    # top stripe
    for sx in range(ax + 2, ax + aud_col_w - 2):
        t = (sx - ax) / aud_col_w
        ga = int(70 * math.sin(math.pi * t))
        aov.line([(sx, aud_y + 1), (sx, aud_y + 2)], fill=(cr, cg, cb, ga))
    # dot
    aov.ellipse([ax+16, aud_y+20, ax+28, aud_y+32], fill=(cr, cg, cb, 200))
    ax += aud_col_w + aud_gap

img = Image.alpha_composite(img, aud_overlay)
draw = ImageDraw.Draw(img, "RGBA")

# Text inside audience cards
ax = TX + 24
for title, sub, color in AUDIENCES:
    cr, cg, cb = rgb(color)
    draw.text((ax + 42, aud_y + 14), title, font=f_card,    fill=rgba("#F1F5F9"))
    draw.text((ax + 42, aud_y + 50), sub,   font=f_card_sm, fill=(cr, cg, cb, 170))
    ax += aud_col_w + aud_gap

# ── Footer divider ────────────────────────────────────────────────────────────
footer_y = H - 112
hdivider(footer_y, alpha=20)

# ── Footer ────────────────────────────────────────────────────────────────────
fy = footer_y + 24
draw.ellipse([TX, fy+6, TX+12, fy+18], fill=rgba("#06C755", 220))
draw.text((TX+20, fy),   "Line OA",         font=f_footer,   fill=rgba("#475569"))
loa_bbox = f_footer.getbbox("Line OA")
loa_w = loa_bbox[2] - loa_bbox[0]
draw.text((TX + 20 + loa_w + 18, fy), "@npcreate", font=f_footer_b, fill=rgba("#06C755", 220))
draw.text((TX+440, fy), "npcreate.co.th",  font=f_footer,   fill=rgba("#2D3748"))

# ── Save ──────────────────────────────────────────────────────────────────────
img.convert("RGB").save(OUT, "PNG", optimize=True)
print(f"Saved: {OUT}  ({W}x{H})")
