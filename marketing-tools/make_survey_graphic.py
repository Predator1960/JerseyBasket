"""Survey results graphic (square). Usage: python make_survey_graphic.py [out_basename]
Counts are from MD/JerseyBasket-Survey-Results.md (22 responses, 2 Nov 2026)."""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

N, EASY, REC = 22, 19, 16
W = 1620
S = W / 675
F = "C:/Windows/Fonts"
def font(name, size): return ImageFont.truetype(f"{F}/{name}", round(size * S))

img = Image.new("RGB", (W, W))
px = img.load()
for y in range(W):
    for x in range(W):
        t = (x + y) / (2 * W)
        px[x, y] = (int(14 + (13 - 14) * t), int(62 + (140 - 62) * t), int(30 + (126 - 30) * t))
d = ImageDraw.Draw(img, "RGBA")

def card(box, fill, outline):
    d.rounded_rectangle([round(v * S) for v in box], radius=round(18 * S), fill=fill, outline=outline, width=max(1,round(S)))

d.text((66 * S, 56 * S), "JerseyBasket.je", font=font("georgiab.ttf", 27), fill="white")
d.text((22 * S, 58 * S), "\U0001F6CD\uFE0F", font=ImageFont.truetype(f"{F}/seguiemj.ttf", round(26 * S)), embedded_color=True)

# gold pill
d.rounded_rectangle([round(60 * S), round(96 * S), round(214 * S), round(122 * S)], radius=round(13 * S), fill=(255, 205, 40))
d.text((137 * S, 109 * S), f"{N} SHOPPER RESPONSES", font=font("segoeuib.ttf", 11), fill=(60, 45, 0), anchor="mm")
d.text((60 * S, 154 * S), "What Jersey Shoppers Are Saying", font=font("georgiab.ttf", 31), fill="white", anchor="lm")

for x0, big, col, label in ((60, f"{EASY}/{N}", (95, 235, 205), "say the app is easy to use"),
                            (355, f"{REC}/{N}", (255, 214, 80), "already recommend it or plan to")):
    card((x0, 205, x0 + 275, 318), (255, 255, 255, 22), (255, 255, 255, 50))
    d.text(((x0 + 20) * S, 252 * S), big, font=font("georgiab.ttf", 31), fill=col, anchor="lm")
    d.text(((x0 + 20) * S, 292 * S), label, font=font("segoeuib.ttf", 13), fill="white", anchor="lm")

card((60, 342, 630, 412), (200, 160, 40, 45), (200, 160, 40, 110))
d.text((84 * S, 377 * S), "\U0001F4E6", font=ImageFont.truetype(f"{F}/seguiemj.ttf", round(30 * S)), embedded_color=True, anchor="lm")
d.text((130 * S, 366 * S), "TOP REQUEST", font=font("segoeuib.ttf", 9), fill=(255, 214, 80), anchor="lm")
d.text((130 * S, 387 * S), "\u201cMore products\u201d \u2014 the #1 thing shoppers want next", font=font("segoeuib.ttf", 15), fill="white", anchor="lm")

d.line([round(60 * S), round(594 * S), round(630 * S), round(594 * S)], fill=(255, 255, 255, 40), width=max(1,round(S)))
d.text((60 * S, 623 * S), "Built for Jersey \u00b7 Free forever", font=font("segoeui.ttf", 11), fill=(220, 235, 228), anchor="lm")
d.text((630 * S, 623 * S), "JerseyBasket.je", font=font("segoeuib.ttf", 11), fill="white", anchor="rm")

out = sys.argv[1] if len(sys.argv) > 1 else "JerseyBasket Survey Results 22"
img.save(out + ".png")
img.save(out + ".pdf", resolution=144.0)
print("saved", out)
