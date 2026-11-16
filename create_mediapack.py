"""
JerseyBasket Media Pack Generator
==================================
Regenerates both media pack PDFs from scratch.

To update stats, just change the values in the CONFIG section below,
then run:  python create_mediapack.py

Outputs:
  JerseyBasket-MediaPack-Branded.pdf   (dark green — email/digital)
  JerseyBasket-MediaPack-Print.pdf     (light neutral — print/in person)
"""

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import simpleSplit
import math

# ═══════════════════════════════════════════════════════════
#  CONFIG — update these numbers each time
# ═══════════════════════════════════════════════════════════
PRODUCTS   = "17,000+"
USERS      = "3,000+"
LAUNCHED   = "May 2026"
STORES_NUM = "6 stores"
INTERACTIONS = "7,500+"
CONTACT_EMAIL = "hello@jerseybasket.je"
CONTACT_PHONE = "07797 721247"
CONTACT_WEB   = "jerseybasket.je"

# ═══════════════════════════════════════════════════════════
#  COLOUR PALETTES
# ═══════════════════════════════════════════════════════════
BRANDED = {
    "page_bg":       (0.058824, 0.090196, 0.164706),   # dark navy
    "accent":        (0.086275, 0.639216, 0.290196),   # green
    "title":         (1.0, 1.0, 1.0),                  # white
    "subtitle":      (0.290196, 0.870588, 0.501961),   # bright green
    "body":          (0.886275, 0.909804, 0.941176),   # light grey-blue
    "body_dim":      (0.392157, 0.454902, 0.545098),   # dimmer grey
    "stat_bg":       (0.117647, 0.160784, 0.231373),   # dark card
    "stat_number":   (0.290196, 0.870588, 0.501961),   # bright green
    "stat_label":    (0.886275, 0.909804, 0.941176),   # light grey-blue
    "banner_bg":     (0.117647, 0.160784, 0.231373),   # dark card
    "footer_bg":     (0.086275, 0.639216, 0.290196),   # green
    # Package card header colours
    "bronze_hdr":    (0.627451, 0.470588, 0.352941),
    "bronze_bg":     (0.117647, 0.160784, 0.231373),
    "silver_hdr":    (0.278431, 0.333333, 0.411765),
    "silver_bg":     (0.117647, 0.160784, 0.231373),
    "gold_hdr":      (0.721569, 0.525490, 0.043137),
    "gold_bg":       (0.117647, 0.160784, 0.231373),
    "platinum_hdr":  (0.619608, 0.666667, 0.709804),
    "platinum_bg":   (0.117647, 0.160784, 0.231373),
    "cta_bg":        (0.086275, 0.639216, 0.290196),
    "step_circle":   (0.086275, 0.639216, 0.290196),
    "pkg_bullet":    None,  # uses header colour per package
}

PRINT = {
    "page_bg":       (1.0, 1.0, 1.0),
    "accent":        (0.117647, 0.250980, 0.686275),   # dark blue
    "title":         (0.058824, 0.090196, 0.164706),   # near black
    "subtitle":      (0.392157, 0.454902, 0.545098),   # mid grey
    "body":          (0.200000, 0.254902, 0.333333),   # dark grey
    "body_dim":      (0.392157, 0.454902, 0.545098),
    "stat_bg":       (0.945098, 0.960784, 0.976471),   # very light blue-grey
    "stat_number":   (0.117647, 0.250980, 0.686275),   # dark blue
    "stat_label":    (0.200000, 0.254902, 0.333333),
    "banner_bg":     (0.886275, 0.909804, 0.941176),
    "footer_bg":     (0.117647, 0.250980, 0.686275),
    "bronze_hdr":    (0.627451, 0.470588, 0.352941),
    "bronze_bg":     (0.929412, 0.878431, 0.831373),
    "silver_hdr":    (0.278431, 0.333333, 0.411765),
    "silver_bg":     (0.909804, 0.925490, 0.937255),
    "gold_hdr":      (0.721569, 0.525490, 0.043137),
    "gold_bg":       (0.996078, 0.976471, 0.764706),
    "platinum_hdr":  (0.619608, 0.666667, 0.709804),
    "platinum_bg":   (0.909804, 0.925490, 0.937255),
    "cta_bg":        (0.117647, 0.250980, 0.686275),
    "step_circle":   (0.117647, 0.250980, 0.686275),
}

W, H = A4  # 595.28 x 841.89
M = 40     # margin

# ═══════════════════════════════════════════════════════════
#  DRAWING HELPERS
# ═══════════════════════════════════════════════════════════

def rl_y(top, page_h=H):
    """Convert pdfplumber top-coord to reportlab y (bottom-left origin)."""
    return page_h - top

def rounded_rect(c, x, y, w, h, r, fill_color, stroke_color=None):
    """Draw a rounded rectangle. y is bottom-left in rl coords."""
    c.saveState()
    c.setFillColorRGB(*fill_color)
    if stroke_color:
        c.setStrokeColorRGB(*stroke_color)
        c.setLineWidth(1.5)
    else:
        c.setLineWidth(0)
    p = c.beginPath()
    p.moveTo(x + r, y)
    p.lineTo(x + w - r, y)
    p.arcTo(x + w - r*2, y, x + w, y + r*2, startAng=-90, extent=90)
    p.lineTo(x + w, y + h - r)
    p.arcTo(x + w - r*2, y + h - r*2, x + w, y + h, startAng=0, extent=90)
    p.lineTo(x + r, y + h)
    p.arcTo(x, y + h - r*2, x + r*2, y + h, startAng=90, extent=90)
    p.lineTo(x, y + r)
    p.arcTo(x, y, x + r*2, y + r*2, startAng=180, extent=90)
    p.close()
    if stroke_color:
        c.drawPath(p, fill=1, stroke=1)
    else:
        c.drawPath(p, fill=1, stroke=0)
    c.restoreState()

def draw_text(c, text, x, top, font, size, color, align="left", max_width=None):
    """Draw text. top is pdfplumber-style y from top of page."""
    y = rl_y(top + size)  # baseline
    c.saveState()
    c.setFillColorRGB(*color)
    c.setFont(font, size)
    if align == "center":
        c.drawCentredString(x, y, text)
    elif align == "right":
        c.drawRightString(x, y, text)
    else:
        c.drawString(x, y, text)
    c.restoreState()

def draw_wrapped(c, text, x, top, font, size, color, max_width, line_height):
    """Draw word-wrapped text, returns new top after last line."""
    lines = simpleSplit(text, font, size, max_width)
    cur_top = top
    for line in lines:
        draw_text(c, line, x, cur_top, font, size, color)
        cur_top += line_height
    return cur_top

def bullet_point(c, x, top, size, color):
    """Draw a small filled circle bullet."""
    r = size / 2
    cy = rl_y(top + r)
    c.saveState()
    c.setFillColorRGB(*color)
    c.circle(x + r, cy, r, fill=1, stroke=0)
    c.restoreState()

# ═══════════════════════════════════════════════════════════
#  PAGE 1
# ═══════════════════════════════════════════════════════════

def draw_page1(c, col):
    # Full page background
    c.setFillColorRGB(*col["page_bg"])
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Bottom green strip (top of footer)
    c.setFillColorRGB(*col["accent"])
    c.rect(0, 0, W, 6, fill=1, stroke=0)

    # ── Header ──
    draw_text(c, "JerseyBasket.je", M, 47.8, "Helvetica-Bold", 28, col["title"])
    draw_text(c, "Jersey\u2019s #1 Free Grocery Price Comparison App",
              M, 81.7, "Helvetica", 13, col["subtitle"])

    # Divider line under subtitle
    c.saveState()
    c.setStrokeColorRGB(*col["accent"])
    c.setLineWidth(1.5)
    c.line(M, rl_y(100), W - M, rl_y(100))
    c.restoreState()

    # ── Intro ──
    draw_text(c, "Advertise where Jersey shops.", M, 117.3, "Helvetica-Bold", 16, col["title"])
    intro = (
        "JerseyBasket.je is the only free app that lets Jersey residents compare grocery prices across all six major "
        "supermarkets in one place. Launched in May 2026 with zero marketing spend, it has grown to over 3,000 "
        "active users \u2014 purely through word of mouth."
    )
    draw_wrapped(c, intro, M, 143.3, "Helvetica", 11, col["body"], W - M*2, 16)

    # ── 4 stat cards ──
    card_w = (W - M*2 - 9*3) / 4   # ~121.3
    card_x = [M, M + card_w + 9, M + (card_w + 9)*2, M + (card_w + 9)*3]
    card_top = 225.0
    card_bot = 285.0
    card_h_rl = card_bot - card_top

    stats = [
        (USERS,      "Active Users",        "Helvetica-Bold", 20),
        (LAUNCHED,      "Launch",        "Helvetica-Bold", 16),
        (PRODUCTS,   "Products Listed",     "Helvetica-Bold", 20),
        (STORES_NUM, "All Major Supermarkets", "Helvetica-Bold", 16),
    ]

    for i, (val, lbl, font, fsize) in enumerate(stats):
        cx = card_x[i]
        # Accent top line
        c.saveState()
        c.setFillColorRGB(*col["accent"])
        c.setStrokeColorRGB(*col["accent"])
        c.setLineWidth(1.5)
        c.rect(cx, rl_y(228), card_w, 4, fill=1, stroke=0)
        c.restoreState()
        # Card body
        rounded_rect(c, cx, rl_y(card_bot), card_w, card_h_rl, 8, col["stat_bg"])
        # Value — centre in card
        cx_centre = cx + card_w / 2
        val_top = 232.1 if fsize == 20 else 235.3
        draw_text(c, val, cx_centre, val_top, font, fsize, col["stat_number"], align="center")
        # Label
        draw_text(c, lbl, cx_centre, 255.7, "Helvetica", 8, col["stat_label"], align="center")

    # ── Why advertise section ──
    draw_text(c, "Why advertise on JerseyBasket.je?",
              M, 313.9, "Helvetica-Bold", 14, col["title"])

    bullets = [
        ("Targeted audience", f"\u2014 Every user is an active weekly grocery shopper \u2014 not a casual browser."),
        ("Island-wide reach",  f"\u2014 1 in 35 Jersey residents already uses the app, growing daily."),
        ("Guaranteed visibility", f"\u2014 Your banner is shown 1,440 times a day \u2014 over 10,000 times a week."),
        ("Zero competition",   "\u2014 The only app of its kind in Jersey \u2014 no comparable advertising opportunity exists."),
        ("Local & trusted",    "\u2014 Built in Jersey, for Jersey. Users trust the platform and act on what they see."),
    ]
    bullet_tops = [339.1, 357.1, 375.1, 393.1, 411.1]
    for (bold_txt, rest_txt), top in zip(bullets, bullet_tops):
        # Bullet circle
        bullet_point(c, M, top + 1, 6, col["accent"])
        # Bold label
        draw_text(c, bold_txt, M + 14, top, "Helvetica-Bold", 10, col["title"])
        # Measure bold width and draw rest
        c.saveState()
        c.setFont("Helvetica-Bold", 10)
        bold_w = c.stringWidth(bold_txt, "Helvetica-Bold", 10)
        c.restoreState()
        draw_text(c, " " + rest_txt, M + 14 + bold_w, top, "Helvetica", 10, col["body"])

    # ── Banner placeholder box ──
    banner_top = 452
    banner_bot = 502
    banner_h_rl = banner_bot - banner_top
    rounded_rect(c, M, rl_y(banner_bot), W - M*2, banner_h_rl, 10, col["banner_bg"])
    # Dashed border
    c.saveState()
    c.setStrokeColorRGB(*col["accent"])
    c.setLineWidth(1)
    c.setDash(4, 3)
    c.roundRect(M, rl_y(banner_bot), W - M*2, banner_h_rl, 10, fill=0, stroke=1)
    c.restoreState()
    draw_text(c, "YOUR BANNER APPEARS HERE", M + 15, 461.1, "Helvetica-Bold", 10, col["title"])
    draw_text(c, "Logo  |  Headline  |  Subtext  |  Call-to-action button  |  Link to your website",
              M + 15, 475.9, "Helvetica", 9, col["body"])
    draw_text(c, "Seen on every product page, basket view and store comparison \u2014 desktop and mobile",
              M + 15, 488.7, "Helvetica", 8, col["body_dim"])

    # ── Footer ──
    c.setFillColorRGB(*col["footer_bg"])
    c.rect(0, 0, W, 28, fill=1, stroke=0)
    footer_y_top = 824.8
    footer_txt = f"{CONTACT_EMAIL}  |  {CONTACT_PHONE}  |  {CONTACT_WEB}"
    draw_text(c, footer_txt, M, footer_y_top, "Helvetica", 9, (1,1,1))
    draw_text(c, "Page 1 of 2", W - M, 825.5, "Helvetica", 8, (1,1,1), align="right")

# ═══════════════════════════════════════════════════════════
#  PAGE 2
# ═══════════════════════════════════════════════════════════

PACKAGES = [
    {
        "name": "Bronze", "price": "£99", "hdr_key": "bronze_hdr", "bg_key": "bronze_bg",
        "features": [
            "Banner slide in rotation with other advertisers",
            "Your logo, headline, subtext & CTA button",
            "Links directly to your website",
            f"Seen by {USERS} active users",
            "Desktop & mobile optimised",
        ],
    },
    {
        "name": "Silver", "price": "£249", "hdr_key": "silver_hdr", "bg_key": "silver_bg",
        "features": [
            "Tap/hover reveals an expanded offers panel (half-page)",
            "Update banner content for promotions anytime",
            "Monthly visitor stats report",
            "All Bronze features included",
        ],
    },
    {
        "name": "Gold", "price": "£499", "hdr_key": "gold_hdr", "bg_key": "gold_bg",
        "features": [
            "Tap/hover reveals a larger expanded offers panel (near full-page)",
            "Featured in JerseyBasket social media posts",
            "Update content whenever you like",
            "All Silver features included",
        ],
    },
    {
        "name": "Platinum", "price": "£999", "hdr_key": "platinum_hdr", "bg_key": "platinum_bg",
        "features": [
            "Full category exclusivity \u2014 no competitor in your industry can advertise on the app",
            "Co-branded promotions on social media",
            "Same-day banner updates \u2014 direct line to Eamonn",
            "All Gold features included",
        ],
    },
]

def draw_package_card(c, col, pkg, x, top):
    """Draw one package card. top is pdfplumber top coord."""
    card_w = (W - M*2 - 11) / 2   # ~251.6
    card_h = 178
    card_bot = top + card_h
    hdr_h = 38
    r = 8
    hdr_color = col[pkg["hdr_key"]]
    bg_color   = col[pkg["bg_key"]]

    # Full card background
    rounded_rect(c, x, rl_y(card_bot), card_w, card_h, r, bg_color)
    # Header band
    rounded_rect(c, x, rl_y(top + hdr_h), card_w, hdr_h, r, hdr_color)
    # Flat bottom of header (covers rounded bottom corners of header)
    c.saveState()
    c.setFillColorRGB(*hdr_color)
    c.rect(x, rl_y(top + hdr_h), card_w, r, fill=1, stroke=0)
    c.restoreState()

    # Package name
    draw_text(c, pkg["name"], x + 14, top + 16, "Helvetica-Bold", 14, (1,1,1))

    # Price — right-aligned in header
    price_x = x + card_w - 14
    draw_text(c, pkg["price"], price_x - 35, top + 13, "Helvetica-Bold", 18, (1,1,1), align="right")
    draw_text(c, "/month", price_x, top + 16, "Helvetica", 10, col["body"], align="right")

    # Feature bullets
    feat_top = top + hdr_h + 18
    feat_max_width = card_w - 24 - 14
    for feat in pkg["features"]:
        bullet_point(c, x + 13.5, feat_top + 1, 5, hdr_color)
        lines = simpleSplit(feat, "Helvetica", 8.5, feat_max_width)
        for li, line in enumerate(lines):
            draw_text(c, line, x + 24, feat_top + li*11, "Helvetica", 8.5, col["body"])
        feat_top += max(14, len(lines)*11 + 3)

def draw_page2(c, col):
    # Background
    c.setFillColorRGB(*col["page_bg"])
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColorRGB(*col["accent"])
    c.rect(0, 0, W, 6, fill=1, stroke=0)

    # Title
    draw_text(c, "Advertising Packages", M, 42.6, "Helvetica-Bold", 22, col["title"])
    draw_text(c, "Choose the package that fits your business",
              M, 71.3, "Helvetica", 11, col["subtitle"])

    # 4 cards in 2x2 grid
    card_w = (W - M*2 - 11) / 2
    col_x = [M, M + card_w + 11]
    row_tops = [110, 300]
    pkg_grid = [[PACKAGES[0], PACKAGES[1]], [PACKAGES[2], PACKAGES[3]]]

    for row_i, row in enumerate(pkg_grid):
        for col_i, pkg in enumerate(row):
            draw_package_card(c, col, pkg, col_x[col_i], row_tops[row_i])

    # ── How it works ──
    draw_text(c, "How it works", M, 509.7, "Helvetica-Bold", 13, col["title"])

    steps = [
        ("1", "Get in touch",    "Email or call Eamonn to discuss the right\npackage for your business."),
        ("2", "Send your assets","Logo, headline, subtext and link \u2014 we do\nthe rest."),
        ("3", "Go live",         "Your banner is live on JerseyBasket.je\nwithin 24 hours."),
    ]
    step_centres = [122.5, 297.6, 472.8]

    for (num, title, desc), cx in zip(steps, step_centres):
        # Circle
        circle_r = 14
        circle_cy = rl_y(537)
        c.saveState()
        c.setFillColorRGB(*col["step_circle"])
        c.circle(cx, circle_cy, circle_r, fill=1, stroke=0)
        c.setFillColorRGB(1,1,1)
        c.setFont("Helvetica-Bold", 14)
        c.drawCentredString(cx, circle_cy - 5, num)
        c.restoreState()
        # Title
        draw_text(c, title, cx, 553.1, "Helvetica-Bold", 10, col["title"], align="center")
        # Desc (2 lines)
        lines = desc.split("\n")
        for li, line in enumerate(lines):
            draw_text(c, line, cx, 570.3 + li*12, "Helvetica", 8.5, col["body"], align="center")

    # ── CTA band ──
    cta_top = 614
    cta_bot = 662
    cta_h = cta_bot - cta_top
    rounded_rect(c, M, rl_y(cta_bot), W - M*2, cta_h, 10, col["cta_bg"])
    draw_text(c, "Ready to reach Jersey\u2019s grocery shoppers?",
              W/2, 621.7, "Helvetica-Bold", 13, (1,1,1), align="center")
    cta_contact = f"{CONTACT_EMAIL}  |  {CONTACT_PHONE}  |  {CONTACT_WEB}"
    draw_text(c, cta_contact, W/2, 640.1, "Helvetica", 10, (1,1,1), align="center")

    # ── Footer ──
    c.setFillColorRGB(*col["footer_bg"])
    c.rect(0, 0, W, 28, fill=1, stroke=0)
    footer_txt = f"{CONTACT_EMAIL}  |  {CONTACT_PHONE}  |  {CONTACT_WEB}"
    draw_text(c, footer_txt, M, 824.8, "Helvetica", 9, (1,1,1))
    draw_text(c, "Page 2 of 3", W - M, 825.5, "Helvetica", 8, (1,1,1), align="right")

# ═══════════════════════════════════════════════════════════
#  PAGE 3 — HOW WE COMPARE
# ═══════════════════════════════════════════════════════════

def draw_page3(c, col):
    # Background
    c.setFillColorRGB(*col["page_bg"])
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColorRGB(*col["accent"])
    c.rect(0, 0, W, 6, fill=1, stroke=0)

    # Title
    draw_text(c, "How JerseyBasket.je Compares", M, 42.6, "Helvetica-Bold", 22, col["title"])
    draw_text(c, "More targeted, better value than traditional local advertising",
              M, 71.3, "Helvetica", 11, col["subtitle"])

    # ── Comparison table ──
    table_top = 105
    row_h = 46
    label_w = 150
    col_w = (W - M*2 - label_w) / 2
    col_x = [M + label_w, M + label_w + col_w]

    rows = [
        ("Typical monthly cost", "£1,400 \u2013 £2,800*", "£650 \u2013 £1,350*", True),
    ]

    # Header row
    hdr_h = 40
    rounded_rect(c, M, rl_y(table_top + hdr_h), W - M*2, hdr_h, 8, col["stat_bg"])
    c.saveState()
    c.setFillColorRGB(*col["title"])
    c.setFont("Helvetica-Bold", 10.5)
    c.drawCentredString(col_x[0] + col_w/2, rl_y(table_top + 17), "Channel 103")
    c.drawCentredString(col_x[0] + col_w/2, rl_y(table_top + 30), "(Radio)")
    c.drawCentredString(col_x[1] + col_w/2, rl_y(table_top + 17), "JEP / Bailiwick Express")
    c.drawCentredString(col_x[1] + col_w/2, rl_y(table_top + 30), "(Print)")
    c.restoreState()

    data_rows = [
        ("Typical monthly cost", "£1,400\u2013£2,800*", "£650\u2013£1,350*"),
        ("Who sees it", "Passive listeners", "Passive readers"),
        ("Ad lifespan", "30 seconds, then gone", "One page view"),
        ("Production/setup cost", "£150\u2013£300 extra", "Design fees may apply"),
        ("Category exclusivity", "Not available", "Not available"),
    ]

    y = table_top + hdr_h
    for i, (label, r103, rjep) in enumerate(data_rows):
        row_bg = col["banner_bg"] if i % 2 == 0 else col["page_bg"]
        if row_bg == col["page_bg"]:
            pass  # no fill needed, page bg already there
        else:
            c.saveState()
            c.setFillColorRGB(*row_bg)
            c.rect(M, rl_y(y + row_h), W - M*2, row_h, fill=1, stroke=0)
            c.restoreState()
        draw_text(c, label, M + 12, y + row_h/2 - 4, "Helvetica-Bold", 9.5, col["body"])
        draw_text(c, r103, col_x[0] + col_w/2, y + row_h/2 - 4, "Helvetica", 9.5, col["body"], align="center")
        draw_text(c, rjep, col_x[1] + col_w/2, y + row_h/2 - 4, "Helvetica", 9.5, col["body"], align="center")
        y += row_h

    # JerseyBasket highlight card below the table
    jb_top = y + 20
    jb_bot = jb_top + 90
    rounded_rect(c, M, rl_y(jb_bot), W - M*2, jb_bot - jb_top, 10, col["cta_bg"])
    draw_text(c, "JerseyBasket.je", M + 20, jb_top + 22, "Helvetica-Bold", 16, (1,1,1))
    draw_text(c, "From £99/month \u2014 shown 1,440 times a day, over 10,000 times a week",
              M + 20, jb_top + 42, "Helvetica-Bold", 11, (1,1,1))
    draw_text(c, "Every viewer is an active grocery shopper mid-decision \u2014 not a passive listener or reader.",
              M + 20, jb_top + 60, "Helvetica", 9.5, (1,1,1))
    draw_text(c, "No production costs. Category exclusivity available at Platinum.",
              M + 20, jb_top + 74, "Helvetica", 9.5, (1,1,1))

    # Footnote
    draw_text(c, "*Radio and print figures are approximate, based on publicly available rate guides as of July 2026",
              M, jb_bot + 28, "Helvetica", 7.5, col["body_dim"])
    draw_text(c, "(Channel 103 standard local rate card; JEP/Bailiwick Express seasonal package pricing) \u2014 contact providers directly for current rates.",
              M, jb_bot + 39, "Helvetica", 7.5, col["body_dim"])

    # ── Footer ──
    c.setFillColorRGB(*col["footer_bg"])
    c.rect(0, 0, W, 28, fill=1, stroke=0)
    footer_txt = f"{CONTACT_EMAIL}  |  {CONTACT_PHONE}  |  {CONTACT_WEB}"
    draw_text(c, footer_txt, M, 824.8, "Helvetica", 9, (1,1,1))
    draw_text(c, "Page 3 of 3", W - M, 825.5, "Helvetica", 8, (1,1,1), align="right")

# ═══════════════════════════════════════════════════════════
#  GENERATE BOTH PDFs
# ═══════════════════════════════════════════════════════════

def generate(filename, col):
    c = canvas.Canvas(filename, pagesize=A4)
    draw_page1(c, col)
    c.showPage()
    draw_page2(c, col)
    c.showPage()
    draw_page3(c, col)
    c.save()
    print(f"Generated: {filename}")

generate(r"C:\JerseyBasket\JERSEYBASKET\JerseyBasket-MediaPack-Branded.pdf", BRANDED)
generate(r"C:\JerseyBasket\JERSEYBASKET\JerseyBasket-MediaPack-Print.pdf",   PRINT)
