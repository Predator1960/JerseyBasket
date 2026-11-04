"""November Price Hunt Day 4 reminder graphic (square). Usage: python make_day4_graphic.py [out_basename]"""
import sys
from PIL import Image, ImageDraw, ImageFont

W = 1620
S = W / 675
F = "C:/Windows/Fonts"
def font(name, size): return ImageFont.truetype(f"{F}/{name}", round(size * S))
def emoji(size): return ImageFont.truetype(f"{F}/seguiemj.ttf", round(size * S))

img = Image.new("RGB", (W, W))
px = img.load()
for y in range(W):
    for x in range(W):
        t = (x + y) / (2 * W)
        px[x, y] = (int(14 + (13 - 14) * t), int(62 + (140 - 62) * t), int(30 + (126 - 30) * t))
d = ImageDraw.Draw(img, "RGBA")

def card(box, fill, outline):
    d.rounded_rectangle([round(v * S) for v in box], radius=round(18 * S), fill=fill, outline=outline, width=max(1, round(S)))

d.text((60 * S, 56 * S), "JerseyBasket.je", font=font("georgiab.ttf", 27), fill="white", anchor="lm")

d.rounded_rectangle([round(60 * S), round(92 * S), round(262 * S), round(118 * S)], radius=round(13 * S), fill=(255, 205, 40))
d.text((161 * S, 105 * S), "NOVEMBER PRICE HUNT \u00b7 DAY 4", font=font("segoeuib.ttf", 10.5), fill=(60, 45, 0), anchor="mm")
d.text((60 * S, 152 * S), "Only 1 entry so far.", font=font("georgiab.ttf", 36), fill="white", anchor="lm")
d.text((60 * S, 192 * S), "Your odds have never been better.", font=font("georgiab.ttf", 22), fill=(255, 214, 80), anchor="lm")

steps = (("\U0001F4F8", "1", "Snap your receipt", "dated 1\u201330 November"),
         ("\u2705", "2", "Check it's clear", "store name, items and date"),
         ("\U0001F4F2", "3", "Send it in the app", "takes about 30 seconds"))
y = 228
for ic, n, a, b in steps:
    card((60, y, 630, y + 62), (255, 255, 255, 22), (255, 255, 255, 50))
    d.text((84 * S, (y + 31) * S), ic, font=emoji(26), embedded_color=True, anchor="lm")
    d.text((134 * S, (y + 22) * S), a, font=font("segoeuib.ttf", 16), fill="white", anchor="lm")
    d.text((134 * S, (y + 43) * S), b, font=font("segoeui.ttf", 12.5), fill=(220, 235, 228), anchor="lm")
    y += 74

card((60, 458, 630, 528), (200, 160, 40, 45), (200, 160, 40, 110))
d.text((84 * S, 493 * S), "\U0001F3C6", font=emoji(30), embedded_color=True, anchor="lm")
d.text((130 * S, 481 * S), "PRIZES: CHARITY CHRISTMAS DRAW TICKETS", font=font("segoeuib.ttf", 9.5), fill=(255, 214, 80), anchor="lm")
d.text((130 * S, 503 * S), "1st: 7 tickets  \u00b7  2nd: 5  \u00b7  3rd: 3", font=font("segoeuib.ttf", 15), fill="white", anchor="lm")

d.text((60 * S, 556 * S), "Double points: Morrisons, Waitrose, M&S   ·   +5 per referral", font=font("segoeuib.ttf", 11.5), fill="white", anchor="lm")
d.text((60 * S, 580 * S), "Results Tue 1 Dec  \u00b7  Draw Thu 17 Dec", font=font("segoeui.ttf", 11.5), fill=(220, 235, 228), anchor="lm")

d.line([round(60 * S), round(598 * S), round(630 * S), round(598 * S)], fill=(255, 255, 255, 40), width=max(1, round(S)))
d.text((60 * S, 621 * S), "JerseyBasket is not connected to the Channel Islands Lottery", font=font("segoeui.ttf", 10), fill=(220, 235, 228), anchor="lm")
d.text((630 * S, 621 * S), "JerseyBasket.je", font=font("segoeuib.ttf", 11), fill="white", anchor="rm")

out = sys.argv[1] if len(sys.argv) > 1 else "JerseyBasket Price Hunt Day 4"
img.save(out + ".png")
print("saved", out)
