"""Social post graphic (1080 x 1350) for JerseyBasket Easy view, glossy 3D style.

Usage:  python marketing-tools/make_easy_view_social.py [out.png]
Default output: Downloads/JerseyBasket Easy View post.png
Companion to make_easy_view_flyer.py (the printable A4 version). No prices are shown,
so nothing on the image can go out of date.
"""
import os, sys
import qrcode
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
import glossy as g

URL = "https://jerseybasket.je/?easy"
SHOWN_URL = "jerseybasket.je/?easy"

g.init()
g.sparkles(seed=41, n=8, area=(0, 0, 190, 420))
g.sparkles(seed=42, n=8, area=(g.W - 190, 0, g.W, 420))
d, W, H, font = g.d, g.W, g.H, g.font
M = 70
WHITE, CREAM, GOLDINK = (255, 255, 255), (225, 240, 232), (255, 214, 80)


def centred(y, text, face, size, fill=WHITE):
    d.text((W / 2, y), text, font=font(face, size), fill=fill, anchor="mm")


# Header
centred(70, "JerseyBasket.je", "georgiab.ttf", 56)
g.pill((W / 2 - 220, 106, W / 2 + 220, 166), "NEW: EASY VIEW", *g.GOLD, ink=g.INK_GOLD, size=38, lift=0.9, glow=(255, 200, 40))
centred(236, "Grocery prices,", "georgiab.ttf", 78)
centred(318, "made simple", "georgiab.ttf", 78, fill=GOLDINK)
centred(386, "Bigger text. A simpler screen. Plain answers.", "segoeui.ttf", 38, fill=CREAM)

# Mock Easy view screen (white card)
cx0, cy0, cx1, cy1 = M + 60, 430, W - M - 60, 670
g.card3d((cx0, cy0, cx1, cy1), (255, 255, 255), (236, 243, 239), r=40, lift=1.2, glow=(255, 214, 80))
d.text((cx0 + 40, cy0 + 42), "What do you need?", font=font("segoeuib.ttf", 40), fill=(17, 24, 39), anchor="lm")
d.rounded_rectangle([cx0 + 40, cy0 + 76, cx1 - 40, cy0 + 138], radius=16, outline=(29, 78, 216), width=4, fill=(255, 255, 255))
d.text((cx0 + 70, cy0 + 107), "milk", font=font("segoeui.ttf", 44), fill=(17, 24, 39), anchor="lm")
d.rounded_rectangle([cx0 + 40, cy0 + 156, cx1 - 40, cy0 + 218], radius=16, fill=(236, 253, 245), outline=(21, 128, 61), width=3)
d.text((cx0 + 70, cy0 + 187), "Cheapest at ...", font=font("segoeuib.ttf", 40), fill=(20, 83, 45), anchor="lm")
g.pill((cx1 - 330, cy0 + 162, cx1 - 52, cy0 + 212), "+ Add to my list", (34, 120, 220), (24, 78, 170), size=28, lift=0.3)

# Three steps
steps = [("1", "Type what you buy", "milk, bread, tea bags..."),
         ("2", "See the cheapest shop", "in plain words"),
         ("3", "Add it to your list", "at the cheapest shop")]
y, row_h, gap = 700, 92, 12
for i, (n, big, small) in enumerate(steps):
    top = y + i * (row_h + gap)
    g.card3d((M, top, W - M, top + row_h), *g.GREEN, r=30, lift=0.8)
    cx, cyy = M + 66, top + row_h / 2
    g.card3d((cx - 34, cyy - 34, cx + 34, cyy + 34), *g.GOLD, r=34, lift=0.3)
    d.text((cx, cyy), n, font=font("georgiab.ttf", 44), fill=g.INK_GOLD, anchor="mm")
    d.text((M + 130, cyy - 18), big, font=font("segoeuib.ttf", 40), fill=WHITE, anchor="lm")
    d.text((M + 130, cyy + 23), small, font=font("segoeui.ttf", 28), fill=CREAM, anchor="lm")
y += 3 * (row_h + gap) + 12

# Link + QR
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=1)
qr.add_data(URL); qr.make(fit=True)
QS = 130
q = qr.make_image(fill_color=(10, 60, 40), back_color="white").convert("RGB").resize((QS, QS), Image.NEAREST)
g.card3d((M, y, W - M, y + 162), (255, 255, 255), (236, 243, 239), r=30, lift=1.0)
g.img.paste(q, (W - M - QS - 16, y + 16))
d.text((M + 36, y + 52), "Open Easy view:", font=font("segoeuib.ttf", 36), fill=(12, 60, 42), anchor="lm")
d.text((M + 36, y + 108), SHOWN_URL, font=font("segoeuib.ttf", 50), fill=(29, 78, 216), anchor="lm")
y += 186

g.pill((M + 60, y, W - M - 60, y + 66), "Free  ·  No sign-up  ·  Phone or computer", *g.GOLD, ink=g.INK_GOLD, size=32, lift=0.7)
centred(H - 34, "Share it with someone who would find it handy", "segoeui.ttf", 28, fill=CREAM)

out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.expanduser("~"), "Downloads", "JerseyBasket Easy View post.png")
g.img.save(out)
print("saved", out, "| bottom pill ends at", y + 66, "of", H)
