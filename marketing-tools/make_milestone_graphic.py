"""Milestone graphic (4:5, Facebook / Instagram / LinkedIn): 17,000+ products and 2,900+ shoppers.
Usage: python marketing-tools/make_milestone_graphic.py [out.png]   (edit PRODUCTS / SHOPPERS below when numbers change)
Default output: C:/Users/eamon/Downloads/JerseyBasket Milestone 17000 products 2900 shoppers.png
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import glossy as g

PRODUCTS = "17,000+"
SHOPPERS = "2,900+"

g.init()
g.sparkles(seed=11, n=9, area=(470, 20, 1060, 200))
g.sparkles(seed=5, n=9, area=(1022, 300, 1068, 1260))
g.sparkles(seed=3, n=9, area=(10, 330, 56, 1260))
d, W, H = g.d, g.W, g.H
font, emoji = g.font, g.emoji

# Header
d.text((70, 70), "JerseyBasket.je", font=font("georgiab.ttf", 44), fill="white", anchor="lm")
g.pill((70, 116, 330, 164), "MILESTONE", *g.GOLD, ink=g.INK_GOLD, size=24, lift=0.7, glow=(255, 200, 40))

# Headline
d.text((70, 250), "Two big milestones!", font=font("georgiab.ttf", 70), fill="white", anchor="lm")
d.text((70, 322), "Thank you, Jersey!", font=font("georgiab.ttf", 40), fill=(255, 214, 80), anchor="lm")

# Hero card 1: products
g.card3d((70, 378, 1010, 668), *g.GOLD, r=34, lift=1.7, glow=(255, 200, 40))
d.text((170, 523), "\U0001F6D2", font=emoji(96), embedded_color=True, anchor="mm")
d.text((620, 478), PRODUCTS, font=font("georgiab.ttf", 130), fill=(60, 38, 0), anchor="mm")
d.text((620, 574), "PRODUCTS TO COMPARE", font=font("segoeuib.ttf", 34), fill=(60, 38, 0), anchor="mm")
d.text((620, 620), "across all 6 Jersey supermarkets", font=font("segoeui.ttf", 26), fill=(95, 60, 0), anchor="mm")

# Card 2: shoppers
g.card3d((70, 712, 1010, 1002), (46, 164, 124), (10, 70, 54), r=34, lift=1.4)
d.text((170, 857), "\U0001F4F1", font=emoji(96), embedded_color=True, anchor="mm")
d.text((620, 812), SHOPPERS, font=font("georgiab.ttf", 130), fill=(255, 214, 80), anchor="mm")
d.text((620, 908), "SHOPPERS USING THE APP", font=font("segoeuib.ttf", 34), fill="white", anchor="mm")
d.text((620, 954), "and growing every day", font=font("segoeui.ttf", 26), fill=(205, 232, 222), anchor="mm")

# Store pills
stores = (("Co-op", (86, 132, 205), (34, 66, 140)), ("Morrisons", (245, 205, 60), (200, 150, 10)),
          ("M&S", (150, 150, 150), (88, 88, 88)), ("Waitrose", (96, 190, 140), (28, 110, 80)),
          ("Iceland", (235, 100, 100), (170, 30, 30)), ("Alliance", (215, 70, 70), (140, 18, 18)))
gap, bw = 12, (940 - 5 * 12) // 6
for i, (name, t, b) in enumerate(stores):
    x = 70 + i * (bw + gap)
    ink = g.INK_GOLD if name == "Morrisons" else "white"
    g.pill((x, 1040, x + bw, 1092), name, t, b, ink=ink, size=20, lift=0.5)

# CTA button
g.card3d((70, 1140, 1010, 1250), *g.GOLD, r=55, lift=1.5, glow=(255, 200, 40))
d.text((540, 1195), "Join them:  jerseybasket.je", font=font("segoeuib.ttf", 44), fill=(50, 30, 0), anchor="mm")

# Footer
d.text((540, 1305), "Jersey's free grocery price comparison app", font=font("segoeui.ttf", 24), fill=(215, 232, 224), anchor="mm")

out = sys.argv[1] if len(sys.argv) > 1 else "C:/Users/eamon/Downloads/JerseyBasket Milestone 17000 products 2900 shoppers.png"
g.img.save(out)
print("saved", out)
