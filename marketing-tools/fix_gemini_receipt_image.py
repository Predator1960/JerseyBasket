"""Takes the Gemini phone-and-receipt image, removes the store logos and the 'scan' claim,
and adds an accurate 'Send your receipt' line. Usage: python fix_gemini_receipt_image.py in.png out.png"""
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

src, dst = sys.argv[1], sys.argv[2]
S = 2
im = Image.open(src).convert("RGB")
im = im.resize((im.width * S, im.height * S), Image.LANCZOS)

def blur_poly(img, pts, radius, feather=6):
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).polygon([(x * S, y * S) for x, y in pts], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(feather * S))
    img.paste(img.filter(ImageFilter.GaussianBlur(radius * S)), (0, 0), mask)

# foreground receipt and the paper bag (Morrisons branding)
blur_poly(im, [(52, 588), (148, 560), (172, 610), (200, 702), (240, 699), (300, 697), (318, 700), (345, 770), (430, 950), (430, 1024), (215, 1024)], 12, 3)
blur_poly(im, [(40, 290), (140, 290), (140, 345), (40, 345)], 8)
# receipt shown on the phone
blur_poly(im, [(240, 375), (335, 375), (335, 470), (240, 470)], 3)

def clear_band(img, box):
    """Fill a band by blending the pixels just outside it (Coons patch), so gradients carry through."""
    x0, y0, x1, y1 = [v * S for v in box]
    px = img.load(); g = 4 * S
    for y in range(y0, y1):
        ty = (y - y0) / max(1, y1 - y0)
        l, r = px[x0 - g, y], px[x1 + g, y]
        for x in range(x0, x1):
            tx = (x - x0) / max(1, x1 - x0)
            t, bt = px[x, y0 - g], px[x, y1 + g]
            tl, tr, bl, br = px[x0 - g, y0 - g], px[x1 + g, y0 - g], px[x0 - g, y1 + g], px[x1 + g, y1 + g]
            out = []
            for i in range(3):
                h = l[i] + (r[i] - l[i]) * tx
                v = t[i] + (bt[i] - t[i]) * ty
                bil = (tl[i] * (1 - tx) + tr[i] * tx) * (1 - ty) + (bl[i] * (1 - tx) + br[i] * tx) * ty
                out.append(max(0, min(255, int(h + v - bil))))
            px[x, y] = tuple(out)

clear_band(im, (196, 282, 392, 306))
clear_band(im, (198, 593, 398, 659))

def font(name, size): return ImageFont.truetype(f"C:/Windows/Fonts/{name}", size * S)
d = ImageDraw.Draw(im)
def centred(text, y, f, fill="white"):
    w = d.textlength(text, font=f)
    d.text((293 * S - w / 2, y * S), text, font=f, fill=fill)

centred("SEND YOUR RECEIPT", 283, font("segoeuib.ttf", 14))
centred("Take a photo. Send it in.", 606, font("segoeuib.ttf", 17))
centred("Takes under a minute", 631, font("segoeui.ttf", 13), "#cfe9ff")
im.save(dst)
print("saved", dst, im.size)
