"""Banner-advertiser recruitment graphic (4:5, Facebook / Instagram / LinkedIn).
Usage: python marketing-tools/make_advertiser_graphic.py [out.png]
Default output: C:/Users/eamon/Downloads/JerseyBasket Advertise With Us.png
Numbers: 15 slots x 4 s = 60 s loop -> 1,440 times a day on a screen with the app open; GBP 99/month = GBP 3.25/day.
"""
import sys
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1350
F = "C:/Windows/Fonts"
def font(name, size): return ImageFont.truetype(f"{F}/{name}", size)

img = Image.new("RGB", (W, H))
px = img.load()
for y in range(H):
    for x in range(W):
        t = (x + y) / (W + H)
        px[x, y] = (int(14 - t), int(62 + 78 * t), int(30 + 96 * t))
d = ImageDraw.Draw(img, "RGBA")

def card(box, fill, outline=None, r=26):
    d.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=2 if outline else 0)

from PIL import ImageFilter

def drop_shadow(alpha_mask, offset=(0, 16), blur=22, strength=150, color=(0, 25, 15)):
    """alpha_mask: 'L' image the size of the canvas. Blurred, offset shadow pasted under the card."""
    sh = Image.new("L", (W, H), 0)
    sh.paste(alpha_mask, offset)
    sh = sh.filter(ImageFilter.GaussianBlur(blur)).point(lambda v: v * strength // 255)
    img.paste(Image.new("RGB", (W, H), color), (0, 0), sh)

def card3d(box, top, bottom, r=26, lift=1.0, glow=None):
    """Raised card: soft shadow, vertical gradient, glossy top half, light top edge / dark bottom edge."""
    x0, y0, x1, y1 = [int(v) for v in box]
    w, h = x1 - x0, y1 - y0
    m = Image.new("L", (W, H), 0)
    ImageDraw.Draw(m).rounded_rectangle([x0, y0, x1, y1], radius=r, fill=255)
    if glow:
        g = m.filter(ImageFilter.GaussianBlur(26)).point(lambda v: v * 150 // 255)
        img.paste(Image.new("RGB", (W, H), glow), (0, 0), g)
    drop_shadow(m, offset=(0, int(18 * lift)), blur=int(20 * lift) + 4, strength=int(120 + 40 * lift))
    grad = Image.new("RGB", (w, h))
    gp = grad.load()
    for yy in range(h):
        t = yy / max(1, h - 1)
        c = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        for xx in range(w):
            gp[xx, yy] = c
    cm = Image.new("L", (w, h), 0)
    ImageDraw.Draw(cm).rounded_rectangle([0, 0, w - 1, h - 1], radius=r, fill=255)
    img.paste(grad, (x0, y0), cm)
    # gloss on the upper half
    gl = Image.new("L", (w, h), 0)
    ImageDraw.Draw(gl).rounded_rectangle([4, 4, w - 5, h // 2], radius=r - 4, fill=48)
    gl = gl.filter(ImageFilter.GaussianBlur(7))
    img.paste(Image.new("RGB", (w, h), (255, 255, 255)), (x0, y0), Image.composite(gl, Image.new("L", (w, h), 0), cm))
    # bevel edges
    d.rounded_rectangle([x0, y0, x1, y1], radius=r, outline=(255, 255, 255, 120), width=2)
    d.arc([x0 + 2, y1 - 2 * r, x0 + 2 * r, y1 - 2], 90, 180, fill=(0, 0, 0, 70), width=3)
    d.line([x0 + r, y1 - 1, x1 - r, y1 - 1], fill=(0, 0, 0, 90), width=3)
    d.arc([x1 - 2 * r, y1 - 2 * r, x1 - 2, y1 - 2], 0, 90, fill=(0, 0, 0, 70), width=3)

# Header
d.text((70, 70), "JerseyBasket.je", font=font("georgiab.ttf", 44), fill="white", anchor="lm")
d.rounded_rectangle([70, 118, 440, 162], radius=22, fill=(255, 205, 40))
d.text((255, 140), "ADVERTISE WITH US", font=font("segoeuib.ttf", 22), fill=(60, 45, 0), anchor="mm")

# Headline
d.text((70, 232), "Be seen by Jersey shoppers", font=font("georgiab.ttf", 58), fill="white", anchor="lm")
d.text((70, 300), "while they decide what to buy", font=font("georgiab.ttf", 58), fill=(255, 214, 80), anchor="lm")
d.text((70, 360), "Your banner in Jersey's grocery price comparison app, used by 2,800+ islanders.",
       font=font("segoeui.ttf", 26), fill=(220, 235, 228), anchor="lm")

# Banner mock-up (looks like the strip at the bottom of the app)
# Real screenshot of a banner slide from the app (marketing-tools/banner_screenshot.png)
import os
shot = Image.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "banner_screenshot.png")).convert("RGB")
bw = W - 140
bh = round(shot.height * bw / shot.width)
shot = shot.resize((bw, bh), Image.LANCZOS)
by = 408
b = shot.convert("RGBA")
bm = Image.new("L", (bw, bh), 0)
ImageDraw.Draw(bm).rounded_rectangle([0, 0, bw - 1, bh - 1], radius=20, fill=255)
b.putalpha(bm)
ImageDraw.Draw(b).rounded_rectangle([0, 0, bw - 1, bh - 1], radius=20, outline=(255, 255, 255, 150), width=3)
# gloss on the upper half + dark bottom edge, same raised look as the cards (no tilt)
gl = Image.new("L", (bw, bh), 0)
ImageDraw.Draw(gl).rounded_rectangle([4, 4, bw - 5, bh // 2 - 4], radius=16, fill=34)
gl = gl.filter(ImageFilter.GaussianBlur(5))
b.paste(Image.new("RGBA", (bw, bh), (255, 255, 255, 255)), (0, 0), Image.composite(gl, Image.new("L", (bw, bh), 0), bm))
ImageDraw.Draw(b).line([20, bh - 2, bw - 20, bh - 2], fill=(0, 0, 0, 110), width=3)
bx, byy = 70 - (b.width - bw) // 2, by - (b.height - bh) // 2
full = Image.new("L", (W, H), 0)
full.paste(b.split()[3], (bx, byy))
glow = full.filter(ImageFilter.GaussianBlur(30)).point(lambda v: v * 120 // 255)
img.paste(Image.new("RGB", (W, H), (120, 80, 255)), (0, 0), glow)      # purple glow from the banner colour
drop_shadow(full, offset=(0, 20), blur=18, strength=170)
img.paste(b.convert("RGB"), (bx, byy), b.split()[3])
d.text((W / 2, 574), "One tap takes shoppers to your website or phone number", font=font("segoeui.ttf", 22),
       fill=(220, 235, 228), anchor="mm")

# Three stat cards
VARIANT = "price"
if "--variant" in sys.argv:
    i = sys.argv.index("--variant"); VARIANT = sys.argv[i + 1]; del sys.argv[i:i + 2]
MIDDLE = {"price": ("\u00a33.25", "a day", "just \u00a399 a month"),
          "enquiry": ("Interested?", "", "Contact us NOW|to get a quote")}[VARIANT]
cards = (("1,440", "times a day", "your banner comes round|once a minute, on any|screen with the app open"),
         MIDDLE,
         ("No contract", "", "month by month,|stop whenever|you like"))
x0, gap, cw = 70, 20, (W - 140 - 40) // 3
for i, (big, unit, sub) in enumerate(cards):
    x = x0 + i * (cw + gap)
    hero = (i == 1)                      # the price card is raised and gold so it is the first thing you see
    top_y, bot_y = (596, 892) if hero else (616, 876)
    if hero:
        card3d((x - 6, top_y, x + cw + 6, bot_y), (255, 226, 110), (226, 156, 18), r=24, lift=1.5, glow=(255, 200, 40))
        ink, ink2 = (60, 38, 0), (80, 52, 0)
    else:
        card3d((x, top_y, x + cw, bot_y), (40, 150, 112), (12, 78, 60), r=24, lift=1.0)
        ink, ink2 = (255, 214, 80), (230, 245, 238)
    oy = top_y - 616
    bigf = font("georgiab.ttf", 56 if len(big) < 8 else 40)
    d.text((x + cw / 2, 668 + oy + (6 if hero else 0)), big, font=bigf, fill=ink, anchor="mm")
    if unit:
        d.text((x + cw / 2, 722 + oy + (6 if hero else 0)), unit, font=font("segoeuib.ttf", 28), fill=(60, 38, 0) if hero else "white", anchor="mm")
    sy = 774 + oy + (6 if hero else 0) if unit else 734 + oy
    for j, line in enumerate(sub.split("|")):
        d.text((x + cw / 2, sy + j * 30), line, font=font("segoeuib.ttf" if hero else "segoeui.ttf", 21), fill=ink2, anchor="mm")

# Tick list
ticks = ("100% Jersey audience, so no wasted spend",
         "Full branded banner: logo, headline, description and link",
         "Seen on mobile and desktop, every page")
y = 925
for t in ticks:
    d.ellipse([74, y - 15, 104, y + 15], fill=(255, 205, 40))
    d.line([80, y, 87, y + 8, 100, y - 8], fill=(60, 45, 0), width=4, joint="curve")
    d.text((124, y), t, font=font("segoeuib.ttf", 28), fill="white", anchor="lm")
    y += 54

# Call to action
card3d((70, 1104, W - 70, 1232), (255, 226, 110), (226, 156, 18), r=30, lift=1.4, glow=(255, 200, 40))
d.text((W / 2, 1144), "Want to see how your banner would look?", font=font("segoeuib.ttf", 30), fill=(60, 38, 0), anchor="mm")
d.text((W / 2, 1194), "hello@jerseybasket.je", font=font("georgiab.ttf", 44), fill=(40, 25, 0), anchor="mm")

d.line([70, H - 70, W - 70, H - 70], fill=(255, 255, 255, 50), width=2)
d.text((70, H - 38), "Jersey's grocery price comparison app", font=font("segoeui.ttf", 22), fill=(220, 235, 228), anchor="lm")
d.text((W - 70, H - 38), "jerseybasket.je", font=font("segoeuib.ttf", 24), fill="white", anchor="rm")

out = sys.argv[1] if len(sys.argv) > 1 else "C:/Users/eamon/Downloads/JerseyBasket Advertise With Us.png"
img.save(out)
print("saved", out)
