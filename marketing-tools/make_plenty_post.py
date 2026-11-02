"""Plenty Ultrasorb price-gap post graphic, 1080x1350 (Instagram 4:5). Usage: python make_plenty_post.py roll.png"""
import sys, os, shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W, H = 1080, 1350
INK, MUTED, GREEN, BLUE, ACCENT = (15, 23, 42), (100, 116, 139), (21, 128, 61), (29, 78, 216), (234, 88, 12)
F = lambda n, s: ImageFont.truetype(f"C:/Windows/Fonts/{n}", s)
im = Image.new("RGB", (W, H), (255, 255, 255)); d = ImageDraw.Draw(im)
def ctext(txt, y, font, fill, cx=W // 2):
    w = d.textlength(txt, font=font); d.text((cx - w / 2, y), txt, font=font, fill=fill)
ctext("SAME ROLL. SAME PACK.", 60, F("segoeuib.ttf", 46), MUTED)
ctext("£1.44 apart", 115, F("segoeuib.ttf", 130), ACCENT)
ctext("Plenty Ultrasorb Kitchen Roll, 1 roll", 292, F("segoeui.ttf", 38), INK)
roll = Image.open(sys.argv[1]).convert("RGB"); h = 590; w = round(roll.width * h / roll.height)
roll = roll.resize((w, h), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 60, 2))
im.paste(roll, ((W - w) // 2, 355))
def card(x, store, price, col, tag):
    d.rounded_rectangle((x, 980, x + 440, 1210), 28, fill=col)
    ctext(store, 1000, F("segoeuib.ttf", 40), (255, 255, 255), x + 220)
    ctext(price, 1030, F("segoeuib.ttf", 110), (255, 255, 255), x + 220)
    if tag: ctext(tag, 1166, F("segoeuib.ttf", 30), (255, 255, 255), x + 220)
card(75, "WAITROSE", "£1.95", GREEN, "£1.44 cheaper")
card(565, "CO-OP", "£3.39", BLUE, "")
ctext("Prices checked 2 Nov 2026. Always check in store.", 1235, F("segoeui.ttf", 28), MUTED)
ctext("jerseybasket.je", 1280, F("segoeuib.ttf", 40), INK)
name = "Plenty Ultrasorb - price gap post 4x5.png"
root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
out = os.path.join(root, name); im.save(out)
shutil.copy(out, os.path.join(os.path.expanduser("~"), "Downloads", name)); print("saved", name)
