"""Price Hunt leaderboard image (Instagram/Facebook/LinkedIn 4:5) built from public/leaderboard.json, in the 3D glossy style.

Usage:  python marketing-tools/make_leaderboard_image.py [out.png] [--top N] [--note "text"]
Default output: C:/Users/eamon/Downloads/JerseyBasket Leaderboard <updated>.png
A "where points came from" line is added automatically for anyone with points from stores other than
Morrisons / Waitrose / M&S (e.g. Co-op = 1 point per price), read from the competition entries.csv.
Override with --note "your text" (or --note "" for none).
Run update_leaderboard.js first so leaderboard.json is current.
Drawing helpers are shared with the other graphics: marketing-tools/glossy.py.
"""
import csv
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import glossy as g

DATA = os.path.join(HERE, "..", "public", "leaderboard.json")
with open(DATA, encoding="utf8") as fh:
    lb = json.load(fh)

ENTRIES = "C:/Users/eamon/OneDrive/Desktop/JerseyBasket Competition/entries.csv"
DOUBLE = {"morrisons", "waitrose", "m&s", "ms"}
args = sys.argv[1:]
TOP = 5   # the 4:5 image fits five rows with the footer; override with --top N (more than 5 will not fit)
if "--top" in args:
    i = args.index("--top"); TOP = int(args[i + 1]); del args[i:i + 2]
note = None
if "--note" in args:
    i = args.index("--note"); note = args[i + 1]; del args[i:i + 2]
if note is None:
    other = {}
    try:
        with open(ENTRIES, encoding="utf8", newline="") as fh:
            for r in csv.DictReader(fh):
                s = (r.get("store") or "").strip()
                if s and s.lower() not in DOUBLE:
                    other.setdefault(r["alias"].strip(), set()).add(s)
    except OSError:
        pass
    shown = {e.get("name") for e in lb.get("entries", [])}
    parts = [f"{a}'s points include {' and '.join(sorted(s))} prices" for a, s in other.items() if a in shown]
    note = ("  \u00b7  ".join(parts) + " (1 point each)") if parts else ""

g.init()
g.sparkles(seed=21, n=7, area=(560, 20, 1060, 215))
g.sparkles(seed=22, n=6, area=(1024, 300, 1068, 1100))
g.sparkles(seed=23, n=6, area=(8, 330, 50, 1100))
d, W, H = g.d, g.W, g.H
font, emoji = g.font, g.emoji

# Header
d.text((70, 70), "JerseyBasket.je", font=font("georgiab.ttf", 44), fill="white", anchor="lm")
g.pill((70, 116, 560, 164), "NOVEMBER PRICE HUNT \u00b7 LEADERBOARD", *g.GOLD, ink=g.INK_GOLD, size=21, lift=0.7, glow=(255, 200, 40))
d.text((70, 232), "Who's winning?", font=font("georgiab.ttf", 64), fill="white", anchor="lm")
d.text((70, 286), f"Updated {lb.get('updated', '')}", font=font("segoeui.ttf", 26), fill=(255, 214, 80), anchor="lm")

# Entries: raised cards, 1st gold / 2nd silver / 3rd bronze / others green
entries = sorted(lb.get("entries", []), key=lambda e: e.get("points", 0), reverse=True)[:TOP]
medals = ["\U0001F947", "\U0001F948", "\U0001F949"]
styles = [
    (g.GOLD, (60, 38, 0), (95, 60, 0)),                              # 1st
    (((240, 244, 250), (150, 164, 186)), (28, 40, 66), (50, 62, 90)),  # 2nd
    (((246, 184, 122), (186, 98, 38)), (60, 28, 6), (95, 48, 12)),    # 3rd
]
green_style = (((46, 164, 124), (12, 76, 58)), (255, 255, 255), (255, 214, 80))
row_h, gap, y0 = 70, 13, 326
if not entries:
    d.text((W / 2, y0 + 40), "Be the first on the board!", font=font("segoeuib.ttf", 36), fill="white", anchor="mm")
for i, e in enumerate(entries):
    top = y0 + i * (row_h + gap)
    (c1, c2), ink, pts_ink = styles[i] if i < 3 else green_style
    g.card3d((70, top, 1010, top + row_h), c1, c2, r=35, lift=1.3 if i == 0 else 0.8,
             glow=(255, 200, 40) if i == 0 else None)
    cy = top + row_h / 2
    if i < 3:
        d.text((126, cy + 3), medals[i], font=emoji(38), embedded_color=True, anchor="mm")
    else:
        d.text((126, cy), str(i + 1), font=font("segoeuib.ttf", 30), fill=ink, anchor="mm")
    d.text((180, cy - 1), e.get("name", ""), font=font("segoeuib.ttf", 34), fill=ink, anchor="lm")
    d.text((920, cy - 2), f"{e.get('points', 0)}", font=font("georgiab.ttf", 40), fill=pts_ink if i > 2 else ink, anchor="rm")
    d.text((972, cy + 3), "pts", font=font("segoeui.ttf", 24), fill=ink if i < 3 else (225, 240, 232), anchor="rm")

# Store progress: glossy bars
y = y0 + max(len(entries), 1) * (row_h + gap) + 22
d.text((70, y), "PRICES CHECKED THIS MONTH", font=font("segoeuib.ttf", 24), fill=(255, 214, 80), anchor="lm")
y += 34
labels = {"morrisons": "Morrisons", "waitrose": "Waitrose", "ms": "M&S"}
for k in ("morrisons", "waitrose", "ms"):
    st = lb.get("stores", {}).get(k)
    if not st:
        continue
    goal, n = st.get("goal", 100), st.get("prices", 0)
    pct = min(1.0, n / goal)
    d.text((70, y + 22), labels[k], font=font("segoeuib.ttf", 28), fill="white", anchor="lm")
    d.rounded_rectangle([250, y + 7, 880, y + 37], radius=15, fill=(0, 30, 20, 120), outline=(255, 255, 255, 45), width=2)
    if pct > 0:
        g.card3d((252, y + 8, 252 + max(30, int(626 * pct)), y + 36), (255, 226, 110), (226, 156, 18), r=14, lift=0.3)
    d.text((W - 70, y + 22), f"{n} / {goal}", font=font("segoeuib.ttf", 28), fill="white", anchor="rm")
    y += 54

# Prize card
y += 14
g.card3d((70, y, 1010, y + 96), (60, 160, 120), (16, 84, 62), r=30, lift=0.9)
d.text((125, y + 50), "\U0001F3C6", font=emoji(50), embedded_color=True, anchor="mm")
d.text((175, y + 30), "PRIZES: CHANNEL ISLANDS CHARITY CHRISTMAS DRAW TICKETS", font=font("segoeuib.ttf", 20), fill=(255, 214, 80), anchor="lm")
d.text((175, y + 67), "1st: 7 tickets  \u00b7  2nd: 5  \u00b7  3rd: 3", font=font("segoeuib.ttf", 30), fill="white", anchor="lm")
y += 126

# Footer
d.text((70, y), "Double points at Morrisons, Waitrose and M&S  \u00b7  +5 per referral", font=font("segoeuib.ttf", 24), fill="white", anchor="lm")
d.text((70, y + 34), "Results Tue 1 Dec  \u00b7  Draw Thu 17 Dec", font=font("segoeui.ttf", 24), fill=(220, 235, 228), anchor="lm")
d.text((70, y + 68), "In the app: tap the Price Hunt banner or “Spotted a price we're missing?”", font=font("segoeuib.ttf", 24), fill=(255, 226, 110), anchor="lm")
d.text((70, y + 100), "or email hello@jerseybasket.je · Long receipt? Send 2 or 3 photos", font=font("segoeuib.ttf", 24), fill=(255, 226, 110), anchor="lm")
if note:
    d.text((70, y + 134), note, font=font("segoeui.ttf", 21), fill=(255, 214, 80), anchor="lm")
d.line([70, H - 70, W - 70, H - 70], fill=(255, 255, 255, 50), width=2)
d.text((70, H - 38), "JerseyBasket is not connected to the Channel Islands Lottery", font=font("segoeui.ttf", 22), fill=(220, 235, 228), anchor="lm")
d.text((W - 70, H - 38), "jerseybasket.je", font=font("segoeuib.ttf", 24), fill="white", anchor="rm")

out = args[0] if args else f"C:/Users/eamon/Downloads/JerseyBasket Leaderboard {lb.get('updated', 'latest')}.png"
g.img.save(out)
print("saved", out)
