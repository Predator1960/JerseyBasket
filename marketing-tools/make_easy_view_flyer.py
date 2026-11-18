"""Printable A4 flyer for JerseyBasket Easy view, with a QR code to jerseybasket.je/?easy.

Usage:  python marketing-tools/make_easy_view_flyer.py [out_basename]
Writes <out>.png and <out>.pdf (A4 portrait, 200 dpi). Default: Downloads/JerseyBasket Easy View flyer A4
For older shoppers and their carers (Age Concern, day centres, libraries, parish halls): very large text,
one QR code, the web address in full, three simple steps. Same 3D glossy look as the other graphics.
"""
import os, sys
import qrcode
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
import glossy as g

URL = "https://jerseybasket.je/?easy"
SHOWN_URL = "jerseybasket.je/?easy"

# A4 at 200 dpi
g.W, g.H = 1654, 2339
g.init()
g.sparkles(seed=31, n=16, area=(0, 0, g.W, 520))
g.sparkles(seed=32, n=10, area=(0, 1900, g.W, g.H))
d, W, H, font = g.d, g.W, g.H, g.font
M = 110                     # side margin
WHITE, CREAM, GOLDINK = (255, 255, 255), (225, 240, 232), (255, 214, 80)


def centred(y, text, face, size, fill=WHITE):
    d.text((W / 2, y), text, font=font(face, size), fill=fill, anchor="mm")


def wrap(text, face, size, width):
    f, words, lines, cur = font(face, size), text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=f) <= width:
            cur = t
        else:
            lines.append(cur); cur = w
    return lines + [cur] if cur else lines


# ── Header ──
centred(120, "JerseyBasket.je", "georgiab.ttf", 88)
g.pill((W / 2 - 330, 185, W / 2 + 330, 270), "NEW: EASY VIEW", *g.GOLD, ink=g.INK_GOLD, size=50, lift=0.9, glow=(255, 200, 40))
centred(365, "Grocery prices,", "georgiab.ttf", 104)
centred(478, "made simple", "georgiab.ttf", 104, fill=GOLDINK)
y = 575
for line in wrap("Bigger text and a simpler screen. Find which Jersey shop is cheapest for your shopping.", "segoeui.ttf", 50, W - 2 * M - 60):
    centred(y, line, "segoeui.ttf", 50, fill=CREAM); y += 66

# ── QR card ──
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=20, border=2)
qr.add_data(URL); qr.make(fit=True)
q = qr.make_image(fill_color=(10, 60, 40), back_color="white").convert("RGB")
QS = 500
q = q.resize((QS, QS), Image.NEAREST)
cy0 = y + 20
card = (M + 130, cy0, W - M - 130, cy0 + QS + 250)
g.card3d(card, (255, 255, 255), (232, 240, 236), r=44, lift=1.4, glow=(255, 214, 80))
g.img.paste(q, (int(W / 2 - QS / 2), cy0 + 40))
centred(cy0 + QS + 100, "Point your phone camera here", "segoeuib.ttf", 54, fill=(12, 60, 42))
centred(cy0 + QS + 185, "or type:  " + SHOWN_URL, "segoeuib.ttf", 54, fill=(29, 78, 216))
y = card[3] + 70

# ── Three steps ──
steps = [("1", "Type what you buy", "e.g. milk, bread or tea bags"),
         ("2", "See the cheapest shop", "in plain words, with the price"),
         ("3", "Add it to your list", "we tell you the cheapest shop for it all")]
row_h, gap = 150, 24
for i, (n, big, small) in enumerate(steps):
    top = y + i * (row_h + gap)
    g.card3d((M, top, W - M, top + row_h), *g.GREEN, r=40, lift=0.9)
    cx, cyy = M + 100, top + row_h / 2
    g.card3d((cx - 56, cyy - 56, cx + 56, cyy + 56), *g.GOLD, r=56, lift=0.4)
    d.text((cx, cyy), n, font=font("georgiab.ttf", 72), fill=g.INK_GOLD, anchor="mm")
    d.text((M + 200, cyy - 30), big, font=font("segoeuib.ttf", 60), fill=WHITE, anchor="lm")
    d.text((M + 200, cyy + 42), small, font=font("segoeui.ttf", 42), fill=CREAM, anchor="lm")
y += 3 * (row_h + gap) + 20

# ── Footer ──
g.pill((M + 60, y, W - M - 60, y + 96), "Free  ·  No sign-up  ·  No adverts", *g.GOLD, ink=g.INK_GOLD, size=48, lift=0.8)
y += 150
centred(y, "Need a hand? Ask family or a carer, or email hello@jerseybasket.je", "segoeui.ttf", 38, fill=CREAM)
centred(H - 60, "Prices are a guide from shoppers' receipts and store websites. Please check in store.", "segoeui.ttf", 32, fill=CREAM)

out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.expanduser("~"), "Downloads", "JerseyBasket Easy View flyer A4")
g.img.save(out + ".png", dpi=(200, 200))
g.img.save(out + ".pdf", "PDF", resolution=200.0)
print("saved", out + ".png", "and .pdf", "| content bottom at", y + 20, "of", H)
