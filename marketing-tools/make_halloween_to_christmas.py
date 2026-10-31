"""Square 1080x1080 launch graphic: Halloween fading into Christmas, 'Price Hunt starts at midnight'."""
import os, math, random, shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOWN = os.path.join(os.environ["USERPROFILE"], "Downloads")
F = r"C:\Windows\Fonts"
bold = lambda s: ImageFont.truetype(os.path.join(F, "segoeuib.ttf"), s)
semi = lambda s: ImageFont.truetype(os.path.join(F, "seguisb.ttf"), s)
reg = lambda s: ImageFont.truetype(os.path.join(F, "segoeui.ttf"), s)
GOLD, WHITE = (253, 224, 71), (255, 255, 255)
W = H = 1080
random.seed(7)

# left: Halloween (purple/black), right: Christmas (deep green), smooth blend across the middle
img = Image.new("RGB", (W, H))
px = img.load()
for x in range(W):
    t = min(1, max(0, (x - 330) / 420))
    t = t * t * (3 - 2 * t)
    for y in range(H):
        v = y / H
        hal = (int(30 + 40 * v), int(8 + 6 * v), int(48 + 30 * v))
        xm = (int(10 + 10 * v), int(70 - 25 * v), int(40 - 10 * v))
        px[x, y] = tuple(int(hal[i] * (1 - t) + xm[i] * t) for i in range(3))
base = img.convert("RGBA")

def layer():
    return Image.new("RGBA", (W, H), (0, 0, 0, 0))

# moon and glow (left), warm glow (right)
g = layer(); d = ImageDraw.Draw(g)
d.ellipse((60, 80, 300, 320), fill=(255, 190, 90, 110)); base.alpha_composite(g.filter(ImageFilter.GaussianBlur(50)))
g = layer(); d = ImageDraw.Draw(g)
d.ellipse((780, 760, 1060, 1040), fill=(255, 210, 90, 80)); base.alpha_composite(g.filter(ImageFilter.GaussianBlur(60)))
L = layer(); d = ImageDraw.Draw(L)
d.ellipse((90, 110, 270, 290), fill=(255, 226, 150, 255))
d.ellipse((130, 100, 310, 280), fill=(48, 18, 62, 255))  # crescent cut

# bats (left)
def bat(cx, cy, s):
    pts = [(cx, cy), (cx - 1.2*s, cy - .5*s), (cx - 2*s, cy - .1*s), (cx - 1.5*s, cy + .4*s), (cx - .8*s, cy + .1*s), (cx - .4*s, cy + .5*s),
           (cx, cy + .2*s), (cx + .4*s, cy + .5*s), (cx + .8*s, cy + .1*s), (cx + 1.5*s, cy + .4*s), (cx + 2*s, cy - .1*s), (cx + 1.2*s, cy - .5*s)]
    d.polygon(pts, fill=(12, 6, 20, 255))
bat(430, 170, 34); bat(330, 330, 26); bat(520, 300, 20); bat(210, 420, 22)

# pumpkin (left)
def pumpkin(cx, cy, r):
    for dx in (-.5, 0, .5):
        d.ellipse((cx + dx*r - r*.62, cy - r*.8, cx + dx*r + r*.62, cy + r*.8), fill=(240, 120, 20, 255), outline=(170, 70, 5, 255), width=3)
    d.rectangle((cx - 8, cy - r*1.0, cx + 8, cy - r*.7), fill=(60, 90, 30, 255))
    d.polygon([(cx - r*.55, cy - r*.1), (cx - r*.2, cy - r*.4), (cx - r*.05, cy - r*.05)], fill=(40, 10, 0, 255))
    d.polygon([(cx + r*.55, cy - r*.1), (cx + r*.2, cy - r*.4), (cx + r*.05, cy - r*.05)], fill=(40, 10, 0, 255))
    d.polygon([(cx - r*.5, cy + r*.25), (cx - r*.3, cy + r*.1), (cx - r*.1, cy + r*.3), (cx + r*.1, cy + r*.1), (cx + r*.3, cy + r*.3), (cx + r*.5, cy + r*.1),
               (cx + r*.45, cy + r*.5), (cx, cy + r*.6), (cx - r*.45, cy + r*.5)], fill=(40, 10, 0, 255))
pumpkin(210, 870, 130)
pumpkin(420, 940, 70)

# christmas tree (right)
def tree(cx, base_y, h):
    for i in range(4):
        w = h * (.34 - i * .06) * 1.3 + 20
        top = base_y - h + i * h * .22
        d.polygon([(cx, top), (cx - w, top + h * .36), (cx + w, top + h * .36)], fill=(20, 110 + i * 12, 55, 255))
    d.rectangle((cx - 16, base_y - 10, cx + 16, base_y + 40), fill=(90, 55, 30, 255))
    d.regular_polygon((cx, base_y - h - 4, 22), 5, fill=(253, 224, 71, 255)) if hasattr(d, "regular_polygon") else None
    for bx, by, c in [(-60, -170, (220, 40, 40)), (50, -120, (253, 224, 71)), (-30, -70, (230, 60, 60)), (70, -40, (253, 224, 71)), (-90, -20, (253, 224, 71)), (10, -230, (220, 40, 40))]:
        d.ellipse((cx + bx - 10, base_y + by - 10, cx + bx + 10, base_y + by + 10), fill=c + (255,))
tree(900, 975, 300)
tree(770, 1010, 190)

# snowflakes (right side, fading toward the middle)
for _ in range(90):
    x = random.randint(380, 1060); y = random.randint(0, 1000); r = random.choice([2, 3, 3, 4, 5])
    a = int(255 * min(1, (x - 380) / 400))
    d.ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 255, a))
# tiny stars (left)
for _ in range(40):
    x = random.randint(0, 520); y = random.randint(0, 700)
    d.ellipse((x - 1.5, y - 1.5, x + 1.5, y + 1.5), fill=(255, 240, 200, 200))
base.alpha_composite(L)

# text panel
P = layer(); pd = ImageDraw.Draw(P)
pd.rounded_rectangle((70, 330, 1010, 700), 34, fill=(15, 8, 30, 205), outline=GOLD + (255,), width=4)
base.alpha_composite(P)
d = ImageDraw.Draw(base)
def centred(t, f, y, fill):
    w = d.textlength(t, font=f); d.text((W/2 - w/2, y), t, font=f, fill=fill)
centred("When Halloween's been and gone...", semi(36), 352, (255, 170, 80))
centred("Your next big event", bold(48), 402, WHITE)
centred("before Christmas", bold(48), 458, WHITE)
centred("NOVEMBER PRICE HUNT", bold(62), 528, GOLD)
centred("Win Christmas Draw tickets", semi(36), 604, WHITE)
centred("by sending us your receipts", semi(30), 650, (220, 210, 255))

B = layer(); bd = ImageDraw.Draw(B)
bd.rounded_rectangle((120, 20, 960, 128), 26, fill=(253, 224, 71, 255))
base.alpha_composite(B)
d = ImageDraw.Draw(base)
centred("STARTS AT MIDNIGHT TONIGHT", bold(44), 26, (60, 40, 0))
centred("1 November", bold(34), 80, (60, 40, 0))
centred("Free to enter · Jersey residents 18+ · Double points at Morrisons, Waitrose & M&S", reg(23), 730, WHITE)
centred("jerseybasket.je", bold(34), 1030, GOLD)

name = "November Price Hunt - starts midnight (Halloween to Christmas).png"
out = os.path.join(ROOT, name)
base.convert("RGB").save(out, optimize=True)
shutil.copy(out, os.path.join(DOWN, name))
print("saved", name)
