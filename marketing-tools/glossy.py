"""Shared 3D / glossy drawing helpers for JerseyBasket social graphics (1080 x 1350, green gradient).

Use:
    import glossy as g
    g.init()                       # creates g.img / g.d with the green gradient background
    g.card3d((x0, y0, x1, y1), top_rgb, bottom_rgb, r=26, lift=1.0, glow=None)
    g.pill((x0, y0, x1, y1), "TEXT", top_rgb, bottom_rgb, ink=(60, 45, 0), size=24)
    g.sparkles(seed)               # soft stars in the background
Palette constants: GOLD, GREEN, DEEP.
Look: soft drop shadow, vertical gradient, glossy upper half, light top edge, dark bottom edge.
"""
import random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1080, 1350
F = "C:/Windows/Fonts"
GOLD = ((255, 226, 110), (226, 156, 18))
GREEN = ((40, 150, 112), (12, 78, 60))
INK_GOLD = (60, 38, 0)

img = None
d = None


def font(name, size):
    return ImageFont.truetype(f"{F}/{name}", size)


def emoji(size):
    return ImageFont.truetype(f"{F}/seguiemj.ttf", size)


def init():
    """Green gradient background."""
    global img, d
    img = Image.new("RGB", (W, H))
    px = img.load()
    for y in range(H):
        for x in range(W):
            t = (x + y) / (W + H)
            px[x, y] = (int(14 - t), int(62 + 78 * t), int(30 + 96 * t))
    d = ImageDraw.Draw(img, "RGBA")
    return img, d


def drop_shadow(alpha_mask, offset=(0, 16), blur=22, strength=150, color=(0, 25, 15)):
    sh = Image.new("L", (W, H), 0)
    sh.paste(alpha_mask, offset)
    sh = sh.filter(ImageFilter.GaussianBlur(blur)).point(lambda v: v * strength // 255)
    img.paste(Image.new("RGB", (W, H), color), (0, 0), sh)


def card3d(box, top, bottom, r=26, lift=1.0, glow=None):
    """Raised card: soft shadow, vertical gradient, glossy top half, light top edge, dark bottom edge."""
    x0, y0, x1, y1 = [int(v) for v in box]
    w, h = x1 - x0, y1 - y0
    m = Image.new("L", (W, H), 0)
    ImageDraw.Draw(m).rounded_rectangle([x0, y0, x1, y1], radius=r, fill=255)
    if glow:
        gl0 = m.filter(ImageFilter.GaussianBlur(26)).point(lambda v: v * 150 // 255)
        img.paste(Image.new("RGB", (W, H), glow), (0, 0), gl0)
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
    gl = Image.new("L", (w, h), 0)
    ImageDraw.Draw(gl).rounded_rectangle([4, 4, w - 5, h // 2], radius=max(4, r - 4), fill=52)
    gl = gl.filter(ImageFilter.GaussianBlur(7))
    img.paste(Image.new("RGB", (w, h), (255, 255, 255)), (x0, y0), Image.composite(gl, Image.new("L", (w, h), 0), cm))
    d.rounded_rectangle([x0, y0, x1, y1], radius=r, outline=(255, 255, 255, 125), width=2)
    d.arc([x0 + 2, y1 - 2 * r, x0 + 2 * r, y1 - 2], 90, 180, fill=(0, 0, 0, 70), width=3)
    d.line([x0 + r, y1 - 1, x1 - r, y1 - 1], fill=(0, 0, 0, 95), width=3)
    d.arc([x1 - 2 * r, y1 - 2 * r, x1 - 2, y1 - 2], 0, 90, fill=(0, 0, 0, 70), width=3)


def pill(box, text, top, bottom, ink=(255, 255, 255), size=24, face="segoeuib.ttf", lift=0.6, glow=None):
    """Glossy 3D pill / button with centred text."""
    x0, y0, x1, y1 = box
    r = int((y1 - y0) / 2)
    card3d(box, top, bottom, r=r, lift=lift, glow=glow)
    d.text(((x0 + x1) / 2, (y0 + y1) / 2 - 1), text, font=font(face, size), fill=ink, anchor="mm")


def sparkles(seed=7, n=26, area=(0, 0, W, H)):
    """Soft four-point stars scattered in the background (call before drawing cards)."""
    rnd = random.Random(seed)
    for _ in range(n):
        x = rnd.randint(area[0] + 20, area[2] - 20)
        y = rnd.randint(area[1] + 20, area[3] - 20)
        s = rnd.choice((6, 8, 10, 14))
        a = rnd.choice((60, 90, 130))
        d.polygon([(x, y - s), (x + s * 0.28, y - s * 0.28), (x + s, y), (x + s * 0.28, y + s * 0.28),
                   (x, y + s), (x - s * 0.28, y + s * 0.28), (x - s, y), (x - s * 0.28, y - s * 0.28)],
                  fill=(255, 235, 150, a))
