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

# ── Fonts (Tahoma supports Thai) ──────────────────────────────────────────────
BD  = "C:/Windows/Fonts/tahomabd.ttf"
REG = "C:/Windows/Fonts/tahoma.ttf"

f_hero   = ImageFont.truetype(BD,  68)
f_sub    = ImageFont.truetype(BD,  44)
f_body   = ImageFont.truetype(REG, 26)
f_stat_v = ImageFont.truetype(BD,  40)
f_stat_l = ImageFont.truetype(REG, 20)
f_badge  = ImageFont.truetype(BD,  18)
f_domain = ImageFont.truetype(REG, 20)

# ── Background radial orbs ────────────────────────────────────────────────────
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

orb(-60,  200, 500, "#DC2626", 50)
orb(1260, 550, 420, "#DC2626", 35)
orb(600,  315, 600, "#DC2626", 18)

draw = ImageDraw.Draw(img, "RGBA")

# ── Top & bottom gradient lines ───────────────────────────────────────────────
for x in range(W):
    g = math.exp(-((x/W - 0.5)**2) / (2*0.1**2))
    draw.line([(x, 0), (x, 2)],   fill=(220, 38, 38, int(160*g)))
    draw.line([(x, H-2), (x, H)], fill=(220, 38, 38, int(100*g)))

# ── Left red accent bar ───────────────────────────────────────────────────────
for y in range(190, 420):
    t = (y-190)/230
    a = int(220 * math.sin(math.pi*t))
    draw.line([(72, y), (75, y)], fill=(220, 38, 38, a))

# ── Right decorative pattern (dots, not big blocks) ──────────────────────────
dot_x0, dot_y0 = 820, 140
cols, rows, gap = 9, 8, 38
for r in range(rows):
    for c in range(cols):
        cx = dot_x0 + c*gap
        cy = dot_y0 + r*gap
        dc = math.sqrt((c - cols/2)**2 + (r - rows/2)**2)
        a = max(0, int(80 - dc*10))
        if a > 0:
            draw.ellipse([cx-3, cy-3, cx+3, cy+3], fill=rgba("#DC2626", a))

# Highlight dot cluster in center-ish
for r in range(2, 5):
    for c in range(3, 6):
        cx = dot_x0 + c*gap
        cy = dot_y0 + r*gap
        draw.ellipse([cx-5, cy-5, cx+5, cy+5], fill=rgba("#DC2626", 140))
draw.ellipse([dot_x0+4*gap-6, dot_y0+3*gap-6, dot_x0+4*gap+6, dot_y0+3*gap+6],
             fill=rgba("#FCA5A5", 200))

# ── Badge ─────────────────────────────────────────────────────────────────────
bx, by, bw, bh = 100, 118, 132, 34
draw.rounded_rectangle([bx, by, bx+bw, by+bh], radius=17,
                       fill=rgba("#DC2626", 45), outline=rgba("#DC2626", 110), width=1)
draw.text((bx+16, by+8), "NP Create", font=f_badge, fill=rgba("#FCA5A5"))

# ── Hero text ─────────────────────────────────────────────────────────────────
TX = 100

# Line 1: white
draw.text((TX, 172), "NP Create", font=f_hero, fill=rgb("#FFFFFF"))

# Line 2: red (smaller to fit)
draw.text((TX, 252), "GMV Max &", font=f_sub, fill=rgb("#DC2626"))
draw.text((TX, 302), "TikTok Shop", font=f_sub, fill=rgb("#DC2626"))

# Subtext
draw.text((TX, 370), "ปั้นยอดขาย TikTok Shop ของคุณให้โต 10 เท่า", font=f_body, fill=rgba("#94A3B8"))

# ── Divider ───────────────────────────────────────────────────────────────────
for x in range(TX, TX+440):
    t = (x-TX)/440
    a = int(100 * (1 - t))
    draw.point((x, 415), fill=(220, 38, 38, a))

# ── Stats ─────────────────────────────────────────────────────────────────────
stats = [("500+", "แบรนด์"), ("800M+", "ยอดขาย (฿)"), ("3 ปี", "ประสบการณ์")]
sx = TX
for val, lbl in stats:
    draw.text((sx, 428), val, font=f_stat_v, fill=rgb("#F59E0B"))
    draw.text((sx, 476), lbl, font=f_stat_l, fill=rgba("#64748B"))
    # separator
    if val != stats[-1][0]:
        draw.line([(sx+195, 430), (sx+195, 510)], fill=rgba("#FFFFFF", 15), width=1)
    sx += 210

# ── Domain ────────────────────────────────────────────────────────────────────
draw.text((TX, 570), "npcreate.co.th", font=f_domain, fill=rgba("#475569"))

# ── Save ──────────────────────────────────────────────────────────────────────
img.convert("RGB").save(OUT, "PNG", optimize=True)
print(f"Saved: {OUT}  ({W}x{H})")
