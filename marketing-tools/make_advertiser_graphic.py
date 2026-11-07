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
mask = Image.new("L", (bw, bh), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, bw - 1, bh - 1], radius=20, fill=255)
by = 405
img.paste(shot, (70, by), mask)
d.rounded_rectangle([70, by, 70 + bw - 1, by + bh - 1], radius=20, outline=(255, 255, 255, 110), width=2)
d.text((W / 2, 558), "One tap takes shoppers to your website or phone number", font=font("segoeui.ttf", 22),
       fill=(220, 235, 228), anchor="mm")

# Three stat cards
cards = (("1,440", "times a day", "your banner comes round|once a minute, on any|screen with the app open"),
         ("\u00a33.25", "a day", "just \u00a399 a month"),
         ("No contract", "", "month by month,|stop whenever|you like"))
x0, gap, cw = 70, 20, (W - 140 - 40) // 3
for i, (big, unit, sub) in enumerate(cards):
    x = x0 + i * (cw + gap)
    card((x, 600, x + cw, 880), (255, 255, 255, 26), (255, 255, 255, 60), r=22)
    bigf = font("georgiab.ttf", 56 if len(big) < 8 else 40)
    d.text((x + cw / 2, 665), big, font=bigf, fill=(255, 214, 80), anchor="mm")
    if unit:
        d.text((x + cw / 2, 718), unit, font=font("segoeuib.ttf", 28), fill="white", anchor="mm")
    sy = 770 if unit else 730
    for j, line in enumerate(sub.split("|")):
        d.text((x + cw / 2, sy + j * 30), line, font=font("segoeui.ttf", 21), fill=(220, 235, 228), anchor="mm")

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
card((70, 1110, W - 70, 1230), (200, 160, 40, 55), (200, 160, 40, 130), r=24)
d.text((W / 2, 1148), "Want to see how your banner would look?", font=font("segoeuib.ttf", 30), fill="white", anchor="mm")
d.text((W / 2, 1195), "hello@jerseybasket.je", font=font("georgiab.ttf", 40), fill=(255, 214, 80), anchor="mm")

d.line([70, H - 70, W - 70, H - 70], fill=(255, 255, 255, 50), width=2)
d.text((70, H - 38), "Jersey's grocery price comparison app", font=font("segoeui.ttf", 22), fill=(220, 235, 228), anchor="lm")
d.text((W - 70, H - 38), "jerseybasket.je", font=font("segoeuib.ttf", 24), fill="white", anchor="rm")

out = sys.argv[1] if len(sys.argv) > 1 else "C:/Users/eamon/Downloads/JerseyBasket Advertise With Us.png"
img.save(out)
print("saved", out)
