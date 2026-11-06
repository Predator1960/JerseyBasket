"""Price Hunt leaderboard image (Instagram/Facebook 4:5) built from public/leaderboard.json.

Usage:  python marketing-tools/make_leaderboard_image.py [out.png]
Default output: C:/Users/eamon/Downloads/JerseyBasket Leaderboard <updated>.png
Run update_leaderboard.js first so leaderboard.json is current.
"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "public", "leaderboard.json")
with open(DATA, encoding="utf8") as fh:
    lb = json.load(fh)

W, H = 1080, 1350
F = "C:/Windows/Fonts"
def font(name, size): return ImageFont.truetype(f"{F}/{name}", size)
def emoji(size): return ImageFont.truetype(f"{F}/seguiemj.ttf", size)

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
d.rounded_rectangle([70, 118, 520, 162], radius=22, fill=(255, 205, 40))
d.text((295, 140), "NOVEMBER PRICE HUNT \u00b7 LEADERBOARD", font=font("segoeuib.ttf", 21), fill=(60, 45, 0), anchor="mm")
d.text((70, 215), "Who's winning?", font=font("georgiab.ttf", 62), fill="white", anchor="lm")
d.text((70, 268), f"Updated {lb.get('updated', '')}", font=font("segoeui.ttf", 26), fill=(255, 214, 80), anchor="lm")

# Entries (top 10, same rule as the app)
entries = sorted(lb.get("entries", []), key=lambda e: e.get("points", 0), reverse=True)[:10]
medals = ["\U0001F947", "\U0001F948", "\U0001F949"]
n_rows = max(len(entries), 1)
row_h, y0 = (86 if n_rows <= 5 else 74 if n_rows <= 7 else 62), 310
card((60, y0 - 10, W - 60, y0 + n_rows * row_h + 6), (255, 255, 255, 24), (255, 255, 255, 55))
if not entries:
    d.text((W / 2, y0 + 30), "Be the first on the board!", font=font("segoeuib.ttf", 34), fill="white", anchor="mm")
for i, e in enumerate(entries):
    cy = y0 + i * row_h + row_h / 2
    if i == 0:
        d.rounded_rectangle([72, cy - 27, W - 72, cy + 27], radius=16, fill=(255, 205, 40, 60))
    if i < 3:
        d.text((112, cy + 4), medals[i], font=emoji(36), embedded_color=True, anchor="mm")
    else:
        d.text((112, cy), str(i + 1), font=font("segoeuib.ttf", 30), fill=(220, 235, 228), anchor="mm")
    d.text((165, cy), e.get("name", ""), font=font("segoeuib.ttf", 34), fill="white", anchor="lm")
    pts_font = font("georgiab.ttf", 40)
    d.text((W - 150, cy), f"{e.get('points', 0)}", font=pts_font, fill=(255, 214, 80), anchor="rm")
    d.text((W - 100, cy + 4), "pts", font=font("segoeui.ttf", 24), fill=(220, 235, 228), anchor="rm")

# Store progress
y = y0 + n_rows * row_h + 50
d.text((70, y), "PRICES CHECKED THIS MONTH", font=font("segoeuib.ttf", 24), fill=(255, 214, 80), anchor="lm")
y += 40
labels = {"morrisons": "Morrisons", "waitrose": "Waitrose", "ms": "M&S"}
for k in ("morrisons", "waitrose", "ms"):
    st = lb.get("stores", {}).get(k)
    if not st:
        continue
    goal, n = st.get("goal", 100), st.get("prices", 0)
    pct = min(1.0, n / goal)
    d.text((70, y + 22), labels[k], font=font("segoeuib.ttf", 28), fill="white", anchor="lm")
    d.rounded_rectangle([250, y + 8, 880, y + 36], radius=14, fill=(255, 255, 255, 40))
    if pct > 0:
        d.rounded_rectangle([250, y + 8, 250 + max(28, int(630 * pct)), y + 36], radius=14, fill=(255, 205, 40))
    d.text((W - 70, y + 22), f"{n} / {goal}", font=font("segoeuib.ttf", 28), fill="white", anchor="rm")
    y += 58

# Prize card
y += 20
card((60, y, W - 60, y + 100), (200, 160, 40, 45), (200, 160, 40, 120), r=22)
d.text((100, y + 50), "🏆", font=emoji(46), embedded_color=True, anchor="mm")
d.text((150, y + 32), "PRIZES: CHARITY CHRISTMAS DRAW TICKETS", font=font("segoeuib.ttf", 21), fill=(255, 214, 80), anchor="lm")
d.text((150, y + 68), "1st: 7 tickets  ·  2nd: 5  ·  3rd: 3", font=font("segoeuib.ttf", 30), fill="white", anchor="lm")
y += 120

# Footer
d.text((70, y + 22), "Double points at Morrisons, Waitrose and M&S  \u00b7  +5 per referral", font=font("segoeuib.ttf", 24), fill="white", anchor="lm")
d.text((70, y + 58), "Results Tue 1 Dec  \u00b7  Draw Thu 17 Dec  \u00b7  Send your receipts in the app", font=font("segoeui.ttf", 24), fill=(220, 235, 228), anchor="lm")
d.line([70, H - 90, W - 70, H - 90], fill=(255, 255, 255, 50), width=2)
d.text((70, H - 55), "JerseyBasket is not connected to the Channel Islands Lottery", font=font("segoeui.ttf", 22), fill=(220, 235, 228), anchor="lm")
d.text((W - 70, H - 55), "jerseybasket.je", font=font("segoeuib.ttf", 24), fill="white", anchor="rm")

out = sys.argv[1] if len(sys.argv) > 1 else f"C:/Users/eamon/Downloads/JerseyBasket Leaderboard {lb.get('updated', 'latest')}.png"
img.save(out)
print("saved", out)
