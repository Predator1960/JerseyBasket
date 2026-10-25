"""'Watch this space' teaser for the November Price Hunt (no prizes shown, safe to post before the Lottery answers)."""
import os
import random
import shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOWN = os.path.join(os.environ["USERPROFILE"], "Downloads")
F = r"C:\Windows\Fonts"
bold = lambda s: ImageFont.truetype(os.path.join(F, "segoeuib.ttf"), s)
semi = lambda s: ImageFont.truetype(os.path.join(F, "seguisb.ttf"), s)
GOLD, WHITE, LILAC = (253, 224, 71), (255, 255, 255), (216, 200, 255)

W = H = 1080
bg = Image.new("RGB", (W, H))
d = ImageDraw.Draw(bg)
for y in range(H):
    t = y / (H - 1)
    d.line([(0, y), (W, y)], fill=(int(24 + 70 * t), int(10 + 8 * t), int(58 + 40 * t)))
base = bg.convert("RGBA")
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(glow).ellipse((190, 250, 890, 800), fill=(250, 204, 21, 80))
base.alpha_composite(glow.filter(ImageFilter.GaussianBlur(90)))
# snow
random.seed(7)
snow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
sd = ImageDraw.Draw(snow)
for _ in range(110):
    x, y, r = random.randint(0, W), random.randint(0, H), random.choice([2, 3, 3, 4, 5])
    sd.ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 255, random.randint(70, 170)))
base.alpha_composite(snow)
d = ImageDraw.Draw(base)


def centred(text, font, y, fill):
    w = d.textlength(text, font=font)
    d.text(((W - w) / 2, y), text, font=font, fill=fill)


centred("JERSEYBASKET", bold(40), 70, GOLD)
centred("WATCH", bold(150), 150, WHITE)
centred("THIS SPACE!", bold(150), 300, GOLD)
d.rounded_rectangle((110, 500, 970, 640), 30, fill=(253, 224, 71))
centred("New Christmas competition", bold(54), 520, (60, 40, 0))
centred("coming soon", bold(54), 578, (60, 40, 0))
centred("Starts 1 November", bold(64), 690, WHITE)
centred("Start saving your receipts now", semi(40), 772, WHITE)
centred("Only receipts dated 1 to 30 November count", semi(28), 824, LILAC)

# the six store logos along the bottom
names = ["Co-op.png", "Iceland.png", "Alliance.png", "Morrisons.png", "M&S.png", "Waitrose2.png"]
S, gap = 108, 22
x0 = (W - (6 * S + 5 * gap)) // 2
for i, n in enumerate(names):
    im = Image.open(os.path.join(ROOT, "Store Logo", n)).convert("RGBA")
    w, h = im.size
    if w != h:  # Alliance is landscape: repeat its edge rows to make it square
        side = max(w, h); sq = Image.new("RGBA", (side, side)); top = (side - h) // 2
        sq.paste(im, (0, top)); sq.paste(im.crop((0, 0, w, 1)).resize((w, top)), (0, 0)); sq.paste(im.crop((0, h - 1, w, h)).resize((w, side - h - top)), (0, top + h)); im = sq
    im = im.resize((S, S), Image.LANCZOS)
    mk = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mk).rounded_rectangle((0, 0, S - 1, S - 1), 16, fill=255)
    im.putalpha(mk)
    base.alpha_composite(im, (x0 + i * (S + gap), 880))
d = ImageDraw.Draw(base)
centred("jerseybasket.je", bold(34), 1010, GOLD)

name = "Watch This Space - Christmas competition teaser (square).png"
out = os.path.join(ROOT, name)
base.convert("RGB").save(out, optimize=True)
shutil.copy(out, os.path.join(DOWN, name))
print("saved", name)
