"""November Price Hunt promo graphics (square 1080x1080), all the versions you might need:
  A  tickets + blanked ticket photo + random draw   (DRAFT: needs the Channel Islands Lottery's OK for the image)
  B  tickets, no ticket photo                        (Lottery says yes to tickets but not the image)
  C  vouchers + random draw                          (Lottery says no to tickets)
  D  vouchers, no random draw                        (no draw and no tickets: fallback if neither answer arrives)
  E  tickets + photo, no random draw                 (Gambling Commission unhappy with the draw)
Run:  python marketing-tools/make_comp_graphic.py        (writes all five to the project folder and Downloads)"""
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


def build(tickets, image, draw_third, name):
    bg = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(bg)
    for y in range(H):
        t = y / (H - 1)
        d.line([(0, y), (W, y)], fill=(int(24 + 70 * t), int(10 + 8 * t), int(58 + 40 * t)))
    base = bg.convert("RGBA")
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse((20, 260, 560, 900), fill=(250, 204, 21, 90))
    base.alpha_composite(glow.filter(ImageFilter.GaussianBlur(70)))
    state = {"d": ImageDraw.Draw(base)}

    def centred(text, font, cx, y, fill):
        w = state["d"].textlength(text, font=font)
        state["d"].text((cx - w / 2, y), text, font=font, fill=fill)

    kind = "Christmas Draw tickets" if tickets else "shopping vouchers"
    centred("NOVEMBER PRICE HUNT", bold(34), W / 2, 40, GOLD)
    centred("Win " + kind.split(" ")[0] + " " + kind.split(" ")[1] if tickets else "Win shopping", bold(74), W / 2, 86, WHITE)
    centred("tickets" if tickets else "vouchers", bold(74), W / 2, 164, WHITE)
    if tickets and not image:
        centred("in the Channel Islands Charity Christmas Draw", semi(30), W / 2, 246, LILAC)

    first, second, third = (("7 tickets", "5 tickets", "3 tickets") if tickets else ("£15 voucher", "£10 voucher", "£5 voucher"))
    third_sub = "random draw: all entrants" if draw_third else "third most points"

    if image:
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
        x0, x1, y0, step, sizes = 470, 1030, 262, 156, (50, 23)
    else:
        x0, x1, y0, step, sizes = 110, 970, 290, 160, (58, 26)

    def prize(y, label, big, sub, fill, fg):
        layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
        ImageDraw.Draw(layer).rounded_rectangle((x0, y, x1, y + 140), 22, fill=(255, 255, 255, 38), outline=fill + (255,), width=3)
        base.alpha_composite(layer)
        state["d"] = ImageDraw.Draw(base)
        dd = state["d"]
        dd.ellipse((x0 + 20, y + 30, x0 + 110, y + 120), fill=fill)
        lw = dd.textlength(label, font=bold(32))
        dd.text((x0 + 65 - lw / 2, y + 48), label, font=bold(32), fill=fg)
        dd.text((x0 + 136, y + 18), big, font=bold(sizes[0]), fill=WHITE)
        dd.text((x0 + 138, y + 88), sub, font=reg(sizes[1]), fill=LILAC)

    prize(y0, "1st", first, "most points", (253, 224, 71), (60, 40, 0))
    prize(y0 + step, "2nd", second, "second most points", (203, 213, 225), (30, 41, 59))
    prize(y0 + 2 * step, "3rd", third, third_sub, (234, 160, 100), (70, 30, 0))

    d = state["d"]
    d.rounded_rectangle((60, 800, 1020, 905), 24, fill=(253, 224, 71))
    centred("DOUBLE POINTS at Morrisons, Waitrose & M&S", bold(34), W / 2, 812, (60, 40, 0))
    centred("Send a receipt, or a shelf price, from 1 to 30 November", semi(28), W / 2, 858, (60, 40, 0))
    centred("Free to enter · Jersey residents 18+ · Winners announced Tuesday 1 December", semi(26), W / 2, 925, WHITE)
    centred("Send yours in the JerseyBasket app: jerseybasket.je", bold(34), W / 2, 968, GOLD)
    foot = ("Prize tickets are for the Channel Islands Charity Christmas Draw (17 December). JerseyBasket is not connected to the Channel Islands Lottery."
            if tickets else "Vouchers are for a store of your choice from the six in the app, subject to availability. Only receipts dated 1 to 30 November count.")
    centred(foot, reg(17), W / 2, 1030, LILAC)

    out = os.path.join(ROOT, name)
    base.convert("RGB").save(out, optimize=True)
    shutil.copy(out, os.path.join(DOWN, name))
    print("saved", name)


build(True, True, True,   "November Price Hunt (square) DRAFT - needs Lottery OK.png")
build(True, False, True,  "November Price Hunt (square) - B tickets no ticket photo.png")
build(False, False, True, "November Price Hunt (square) - C vouchers.png")
build(False, False, False, "November Price Hunt (square) - D vouchers no draw.png")
build(True, True, False,  "November Price Hunt (square) - E tickets no draw DRAFT - needs Lottery OK.png")
