"""Celebration graphic (1080x1080 square, or 1080x1350 for Instagram 4:5 with --4x5, 1080x1920 for Stories with --9x16), the navy sunburst + confetti style used for the 2,800+ users post.

Usage:  python marketing-tools/make_celebration_graphic.py [out.png] [--4x5 | --9x16] [--hero-products] [--users "3,000+"] [--products "17,000+"]
Default output: C:/Users/eamon/Downloads/JerseyBasket 3000 users celebration.png
"""
import math
import random
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

F = "C:/Windows/Fonts"
args = sys.argv[1:]
STORY = "--9x16" in args
TALL = "--4x5" in args or STORY
for _flag in ("--4x5", "--9x16"):
    if _flag in args:
        args.remove(_flag)
W = 1080
H = 1920 if STORY else (1350 if TALL else 1080)
KEYS = ("head", "pop", "num", "loc", "box", "thank", "pill")
OFF = dict(zip(KEYS, (232, 295, 392, 432, 484, 525, 542))) if STORY else (dict(zip(KEYS, (45, 95, 130, 150, 205, 255, 285))) if TALL else dict.fromkeys(KEYS, 0))
USERS, PRODUCTS = "3,000+", "17,000+"
HERO_PRODUCTS = "--hero-products" in args
if HERO_PRODUCTS:
    args.remove("--hero-products")
if "--users" in args:
    i = args.index("--users"); USERS = args[i + 1]; del args[i:i + 2]
if "--products" in args:
    i = args.index("--products"); PRODUCTS = args[i + 1]; del args[i:i + 2]
out = args[0] if args else ("C:/Users/eamon/Downloads/JerseyBasket 3000 users celebration 9x16 story.png" if STORY else "C:/Users/eamon/Downloads/JerseyBasket 3000 users celebration 4x5.png" if TALL else "C:/Users/eamon/Downloads/JerseyBasket 3000 users celebration.png")


def font(name, size):
    return ImageFont.truetype(f"{F}/{name}", size)


IMPACT, ARB = "impact.ttf", "arialbd.ttf"
GOLD, GOLD_D = (255, 213, 62), (206, 150, 12)
GREEN = (52, 181, 66)

# --- background: radial navy gradient
yy, xx = np.mgrid[0:H, 0:W]
d = np.sqrt((xx - 540) ** 2 + (yy - (440 + OFF['num'])) ** 2) / (1050 if STORY else 860 if TALL else 760)
d = np.clip(d, 0, 1)
c0 = np.array([30, 74, 150]); c1 = np.array([7, 20, 58])
arr = (c0[None, None, :] * (1 - d[..., None]) + c1[None, None, :] * d[..., None]).astype(np.uint8)
img = Image.fromarray(arr, "RGB").convert("RGBA")

# --- sunburst rays
rays = Image.new("RGBA", (W, H), (0, 0, 0, 0))
rd = ImageDraw.Draw(rays)
n = 22
cx, cy = 540, 440 + OFF['num']
for k in range(n):
    a0 = 2 * math.pi * k / n
    a1 = a0 + math.pi / n
    pts = [(cx, cy)] + [(cx + 1500 * math.cos(a), cy + 1500 * math.sin(a)) for a in (a0, a1)]
    rd.polygon(pts, fill=(255, 255, 255, 16))
img = Image.alpha_composite(img, rays)

# --- confetti
random.seed(3000)
conf = Image.new("RGBA", (W, H), (0, 0, 0, 0))
cols = [(255, 214, 60), (235, 64, 90), (66, 150, 240), (60, 190, 80), (255, 255, 255), (255, 140, 40), (150, 90, 230), (230, 230, 240)]
for _ in range(int(120 * H / 1080)):
    x, y = random.randint(0, W), random.randint(0, H)
    if 130 < x < 950 and 230 + OFF['num'] < y < 610 + OFF['loc'] and random.random() < 0.85:
        continue
    if (270 < x < 810 and 30 < y < 165 + OFF['head']) or (190 < x < 890 and 840 + OFF['thank'] < y < 935 + OFF['thank']) or (330 < x < 750 and 935 + OFF['pill'] < y < 1035 + OFF['pill']) or (130 < x < 950 and 640 + OFF['box'] < y < 800 + OFF['box'] and random.random() < 0.8):
        continue
    w, h = random.randint(8, 20), random.randint(14, 34)
    tile = Image.new("RGBA", (40, 40), (0, 0, 0, 0))
    td = ImageDraw.Draw(tile)
    col = random.choice(cols) + (random.randint(170, 255),)
    if random.random() < 0.3:
        r = random.randint(6, 12)
        td.ellipse([20 - r, 20 - r, 20 + r, 20 + r], fill=col)
    else:
        td.rectangle([20 - w // 2, 20 - h // 2, 20 + w // 2, 20 + h // 2], fill=col)
        tile = tile.rotate(random.randint(0, 180), resample=Image.BICUBIC)
    conf.alpha_composite(tile, (max(0, min(W - 40, x - 20)), max(0, min(H - 40, y - 20))))
img = Image.alpha_composite(img, conf)


def tracked(draw, xy, text, fnt, fill, track=0, anchor="l"):
    """Draw text with letter-spacing; returns width."""
    widths = [draw.textlength(ch, font=fnt) for ch in text]
    total = sum(widths) + track * (len(text) - 1)
    x, y = xy
    if anchor == "m":
        x -= total / 2
    for ch, w in zip(text, widths):
        draw.text((x, y), ch, font=fnt, fill=fill, anchor="ls")
        x += w + track
    return total


def text3d(base, text, fnt, center, depth, fill, side, shadow=True):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    cxm, cym = center
    bb = ld.textbbox((0, 0), text, font=fnt, anchor="ls")
    x = cxm - (bb[0] + bb[2]) / 2
    y = cym + (bb[3] - bb[1]) / 2 - bb[3] * 0
    if shadow:
        sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        sd = ImageDraw.Draw(sh)
        for k in range(depth + 8):
            sd.text((x + k + 8, y + k + 12), text, font=fnt, fill=(0, 0, 0, 120), anchor="ls")
        sh = sh.filter(ImageFilter.GaussianBlur(10))
        base = Image.alpha_composite(base, sh)
    for k in range(depth, 0, -1):
        ld.text((x + k * 0.7, y + k), text, font=fnt, fill=side, anchor="ls")
    ld.text((x, y), text, font=fnt, fill=fill, anchor="ls")
    return Image.alpha_composite(base, layer)


# --- header
d0 = ImageDraw.Draw(img)
hf = font(IMPACT, 60)
parts = [("JERSEY ", (255, 255, 255)), ("BASKET", GREEN), (".je", (255, 255, 255))]
tw = sum(d0.textlength(t, font=hf) + 3 * len(t) for t, _ in parts)
x = 540 - tw / 2
for t, c in parts:
    x += tracked(d0, (x, 98 + OFF['head']), t, hf, c, track=3)
tracked(d0, (540, 140 + OFF['head']), "JERSEY'S GROCERY PRICE COMPARISON APP", font(ARB, 23), (186, 210, 245), track=2, anchor="m")

# party popper
ef = ImageFont.truetype(f"{F}/seguiemj.ttf", 74)
d0.text((540, 225 + OFF['pop']), "\U0001F389", font=ef, embedded_color=True, anchor="mm")

# --- big number with 3D extrusion
img = text3d(img, PRODUCTS if HERO_PRODUCTS else USERS, font(IMPACT, 252 if HERO_PRODUCTS else 292), (540, 368 + OFF['num']), 12, GOLD, GOLD_D)
d1 = ImageDraw.Draw(img)

# LOCAL USERS!
WORD1, WORD2 = ("PRODUCTS ", "COMPARED!") if HERO_PRODUCTS else ("LOCAL ", "USERS!")
lf = font(IMPACT, 76 if HERO_PRODUCTS else 90)
w1 = d1.textlength(WORD1, font=lf) + 6 * len(WORD1)
w2 = d1.textlength(WORD2, font=lf) + 6 * len(WORD2)
x0 = 540 - (w1 + w2) / 2
for dx, dy, col in ((5, 6, (0, 0, 0, 140)),):
    pass
tracked(d1, (x0 + 4, 598 + OFF['loc'] + 5), WORD1, lf, (0, 0, 0, 110), track=6)
tracked(d1, (x0, 598 + OFF['loc']), WORD1, lf, (255, 255, 255), track=6)
tracked(d1, (x0 + w1 + 4, 598 + OFF['loc'] + 5), WORD2, lf, (0, 0, 0, 110), track=6)
tracked(d1, (x0 + w1, 598 + OFF['loc']), WORD2, lf, GREEN, track=6)

# --- stat boxes
boxes = [(56, 363, USERS if HERO_PRODUCTS else PRODUCTS, "LOCAL USERS" if HERO_PRODUCTS else "PRODUCTS"), (387, 693, "6", "JERSEY STORES"), (717, 1023, "\u00a30", "100% FREE")]
by0, by1 = 646 + OFF['box'], 787 + OFF['box']
for x0b, x1b, big, lab in boxes:
    d1.rounded_rectangle([x0b, by0, x1b, by1], radius=26, fill=(10, 26, 78, 235), outline=(214, 170, 70), width=3)
    d1.text(((x0b + x1b) / 2, by0 + 82), big, font=font(IMPACT, 66), fill=GOLD, anchor="ms")
    d1.text(((x0b + x1b) / 2, by1 - 20), lab, font=font(ARB, 26), fill=(255, 255, 255), anchor="ms")

# THANK YOU JERSEY!
tf = font(IMPACT, 66)
t1 = d1.textlength("THANK YOU ", font=tf) + 4 * 9
t2 = d1.textlength("JERSEY!", font=tf) + 4 * 6
xs = 540 - (t1 + t2 + 90) / 2
tracked(d1, (xs, 915 + OFF['thank']), "THANK YOU ", tf, (255, 255, 255), track=4)
tracked(d1, (xs + t1, 915 + OFF['thank']), "JERSEY!", tf, GOLD, track=4)
d1.text((xs + t1 + t2 + 50, 890 + OFF['thank']), "\U0001F49A", font=ImageFont.truetype(f"{F}/seguiemj.ttf", 62), embedded_color=True, anchor="mm")

# URL pill
pill = Image.new("RGBA", (W, H), (0, 0, 0, 0))
pd = ImageDraw.Draw(pill)
pd.rounded_rectangle([342, 948 + OFF['pill'], 738, 1026 + OFF['pill']], radius=39, fill=(0, 0, 0, 110))
pill = pill.filter(ImageFilter.GaussianBlur(6))
img = Image.alpha_composite(img, pill)
d2 = ImageDraw.Draw(img)
grad = Image.new("RGBA", (396, 78))
gp = ImageDraw.Draw(grad)
for yv in range(78):
    t = yv / 77
    gp.line([(0, yv), (396, yv)], fill=(int(60 - 25 * t), int(190 - 50 * t), int(70 - 25 * t), 255))
mask = Image.new("L", (396, 78), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, 395, 77], radius=39, fill=255)
img.paste(grad, (342, 942 + OFF['pill']), mask)
d2.text((540, 982 + OFF['pill']), "jerseybasket.je", font=font(ARB, 38), fill="white", anchor="mm")

img.convert("RGB").save(out)
print("saved", out)
