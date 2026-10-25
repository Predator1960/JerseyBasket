"""November Price Hunt promo graphic (square 1080x1080) using the blanked Charity Christmas Draw ticket.
DRAFT: do not post until the Channel Islands Lottery has agreed to the ticket image / prize use."""
import os
import shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOWN = os.path.join(os.environ["USERPROFILE"], "Downloads")
F = r"C:\Windows\Fonts"
bold = lambda s: ImageFont.truetype(os.path.join(F, "segoeuib.ttf"), s)
semi = lambda s: ImageFont.truetype(os.path.join(F, "seguisb.ttf"), s)
reg = lambda s: ImageFont.truetype(os.path.join(F, "segoeui.ttf"), s)
GOLD, WHITE, LILAC = (253, 224, 71), (255, 255, 255), (216, 200, 255)

W = H = 1080
bg = Image.new("RGB", (W, H))
d = ImageDraw.Draw(bg)
for y in range(H):  # deep purple to magenta
    t = y / (H - 1)
    d.line([(0, y), (W, y)], fill=(int(24 + 70 * t), int(10 + 8 * t), int(58 + 40 * t)))
base = bg.convert("RGBA")
# soft glow behind the ticket
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(glow).ellipse((20, 260, 560, 900), fill=(250, 204, 21, 90))
base.alpha_composite(glow.filter(ImageFilter.GaussianBlur(70)))
d = ImageDraw.Draw(base)


def centred(text, font, cx, y, fill):
    w = d.textlength(text, font=font)
    d.text((cx - w / 2, y), text, font=font, fill=fill)


# headline
centred("NOVEMBER PRICE HUNT", bold(34), W / 2, 40, GOLD)
centred("Win Christmas Draw", bold(74), W / 2, 86, WHITE)
centred("tickets", bold(74), W / 2, 164, WHITE)

# ticket, tilted, with a shadow
tk = Image.open(os.path.join(ROOT, "marketing-tools", "comp-parts", "ticket_blanked.png")).convert("RGBA")
tk = tk.resize((int(tk.width * 0.40), int(tk.height * 0.40)), Image.LANCZOS)
m = Image.new("L", tk.size, 0)
ImageDraw.Draw(m).rounded_rectangle((0, 0, tk.width - 1, tk.height - 1), 18, fill=255)
tk.putalpha(m)
tk = tk.rotate(6, expand=True, resample=Image.BICUBIC)
sh = Image.new("RGBA", base.size, (0, 0, 0, 0))
sh.paste((0, 0, 0, 150), (64, 262 + 12), tk.split()[3])
base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(16)))
base.alpha_composite(tk, (52, 252))

# prizes on the right (translucent cards drawn on their own layer so the alpha blends)
def prize(y, label, tickets, sub, fill, fg):
    global base, d
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    ld.rounded_rectangle((470, y, 1030, y + 140), 22, fill=(255, 255, 255, 38), outline=fill + (255,), width=3)
    base.alpha_composite(layer)
    d = ImageDraw.Draw(base)
    d.ellipse((490, y + 30, 580, y + 120), fill=fill)
    lw = d.textlength(label, font=bold(32))
    d.text((535 - lw / 2, y + 48), label, font=bold(32), fill=fg)
    d.text((606, y + 22), f"{tickets} tickets", font=bold(50), fill=WHITE)
    d.text((608, y + 88), sub, font=reg(23), fill=LILAC)

prize(262, "1st", 7, "most points", (253, 224, 71), (60, 40, 0))
prize(418, "2nd", 5, "second most points", (203, 213, 225), (30, 41, 59))
prize(574, "3rd", 3, "random draw: all entrants", (234, 160, 100), (70, 30, 0))

# double points strip
d.rounded_rectangle((60, 800, 1020, 905), 24, fill=(253, 224, 71))
centred("DOUBLE POINTS at Morrisons, Waitrose & M&S", bold(34), W / 2, 812, (60, 40, 0))
centred("Send a receipt, or a shelf price, from 1 to 30 November", semi(28), W / 2, 858, (60, 40, 0))

centred("Free to enter · Jersey residents 18+ · Winners announced Tuesday 1 December", semi(26), W / 2, 925, WHITE)
centred("Send yours in the JerseyBasket app: jerseybasket.je", bold(34), W / 2, 968, GOLD)
centred("Prize tickets are for the Channel Islands Charity Christmas Draw (17 December). JerseyBasket is not connected to the Channel Islands Lottery.", reg(17), W / 2, 1030, LILAC)

name = "November Price Hunt (square) DRAFT - needs Lottery OK.png"
out = os.path.join(ROOT, name)
base.convert("RGB").save(out, optimize=True)
shutil.copy(out, os.path.join(DOWN, name))
print("saved", name)
