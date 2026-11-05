"""Fit a screenshot onto a 4:5 Instagram canvas (1080x1350) with the green brand gradient.
Usage: python make_insta_fit.py <screenshot> [out.png]"""
import sys
from PIL import Image, ImageDraw

src = Image.open(sys.argv[1]).convert("RGB")
out = sys.argv[2] if len(sys.argv) > 2 else "JerseyBasket Instagram 4x5.png"
W, H = 1080, 1350
bg = Image.new("RGB", (W, H))
px = bg.load()
for y in range(H):
    for x in range(W):
        t = (x + y) / (W + H)
        px[x, y] = (int(14 + (13 - 14) * t), int(62 + (140 - 62) * t), int(30 + (126 - 30) * t))
pad = 40
th = H - 2 * pad
tw = round(src.width * th / src.height)
shot = src.resize((tw, th), Image.LANCZOS)
mask = Image.new("L", (tw, th), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, tw - 1, th - 1], radius=36, fill=255)
bg.paste(shot, ((W - tw) // 2, pad), mask)
bg.save(out)
print("saved", out, tw, th)
