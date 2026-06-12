# JerseyBasket.je — Project Brief
**For Claude — paste this at the start of every new session**
**Also upload: install_v66.py AND Jerseybasket app v66 12Jun2026.jsx**

---

## What Is It
JerseyBasket.je is Jersey's first free grocery price comparison app. It covers all 5 major supermarkets in Jersey, lets users build a basket, and instantly shows where their whole weekly shop is cheapest. Built by Eamonn O'Shea using Claude's assistance — Eamonn is non-technical and relies on Claude to do all coding work.

---

## Key Stats (as of 12 June 2026)
- **1,000+ active users** (Google Analytics verified)
- **549 products** across 5 stores
- **15 categories**
- **Launched late May 2026** — zero marketing spend, pure word of mouth
- **Live at:** jerseybasket.je

---

## Tech Stack
- React (Create React App)
- Deployed via Vercel → GitHub (repo: Predator1960/JerseyBasket)
- Local path: `C:\Users\eamon_qw9m8iy\OneDrive\Desktop\jerseybasket\`

## CRITICAL WORKFLOW
- **NEVER write App.jsx directly with PowerShell** — BOM corruption kills emojis
- Always use a **Python install script** (base64 encoded) to write the file
- Deploy: run install script → then git commands ONE AT A TIME (semicolons don't work in PowerShell)
- OneDrive runs overnight midnight–8am only via Task Scheduler — no need to pause manually
- `CI=true` in Vercel — zero ESLint warnings permitted
- **Within the same day's session** — overwrite the same version file, no version bump
- **New day = new version number**

## Deploy Commands (every session)
Always given as plain code blocks. Run each line separately in PowerShell:

```
python "C:\Users\eamon_qw9m8iy\OneDrive\Desktop\jerseybasket\install_v66.py"
```
```
git add src/App.jsx
```
```
git commit -m "message"
```
```
git push
```

## Maintenance Mode
Two bat files saved in jerseybasket folder:
- Double-click `SITE OFFLINE.bat` → shows "Store Closed For Restocking" screen (~30s)
- Double-click `SITE ONLINE.bat` → brings site back live (~30s)

## Downloads (every session)
Always produce two files for Eamonn to download:
1. `install_v66.py` — the Python install script
2. `Jerseybasket app v66 12Jun2026.jsx` — the full App.jsx backup (always use today's date)

Eamonn saves these directly into the jerseybasket folder. He does NOT use a Downloads folder.

---

## App Architecture

### Stores (5)
| ID | Name | Colour |
|---|---|---|
| coop | CI Co-op | #16a34a |
| morrisons | Morrisons | #eab308 |
| ms | M&S Food | #94a3b8 |
| waitrose | Waitrose | #0d9488 |
| iceland | Iceland | #dc2626 |

### Price Formula
`sp(basePrice, [coop_diff, morrisons_diff, ms_diff, waitrose_diff, iceland_diff])`
- Each diff = store_price - base_price
- Use 0 if price unknown, negative diffs are fine
- Single-store items: set base as that store's price, all others as negative full price
- e.g. Waitrose only: `sp(2.40,[-2.40,-2.40,-2.40,0,-2.40])`
- e.g. Co-op only: `sp(2.40,[0,-2.40,-2.40,-2.40,-2.40])`
- e.g. M&S only: `sp(3.20,[-3.20,-3.20,0,-3.20,-3.20])`

### Key Constants (auto-calculated — never hardcode)
- `BASE_PRODUCTS.length` — product count everywhere
- `STORES.length` — store count everywhere
- `CATS.filter(c=>c!=="All").length` — category count
- `new Date().toLocaleDateString(...)` — prices updated date

### Current version: v66 (LIVE)
- MAINTENANCE = false
- COMP_ACTIVE = auto-expires midnight 30 June 2026
- Next product ID: **555**

---

## AdBanner
- 6 slides (ids 0–5), bounce scrolling
- Slots 0–4: "Advertise Here" placeholders
- Slot 5: Ernie's.je demo (yellow bg, green text, base64 logo — fixed 11 June)
- Desktop: hover pauses, click opens URL
- Mobile: 1st tap pauses, 2nd tap opens URL, swipe changes slide

---

## Welcome Modal
- Shows every time app is opened
- 7 slides — last slide is the survey
- Slide 1 has "📝 Take our quick survey" button jumping to slide 7
- After survey submission — shows "Survey Completed!" then "Back to JerseyBasket" returns to slide 1
- Survey answers sent to hello@jerseybasket.je via Formspree (mvzyrgqj)

## Light Mode
- ☀️/🌙 toggle button in header (left of Share button)
- Preference saved via localStorage
- Header and buttons adapt in light mode
- Full proper light mode is a future dedicated session

---

## Advertiser Packages
| Tier | Price | What |
|---|---|---|
| Bronze | £99/month | Slide in rotation |
| Silver | £249/month | Priority + stats report |
| Gold | £499/month | Permanent named slot |
| Platinum | £999/month | Category exclusivity, always first |

---

## Advertiser Pipeline
| Contact | Company | Status |
|---|---|---|
| Jason Acott | Jasons Valeting | Pulled out — no longer active |
| Matt Maughan | Ernie's.je | Demo banner live slot 5, follow-up sent 10 June — pitch Platinum |
| Andrew Bagot (MD) | Alliance Stores | LinkedIn follow-up sent 6 June |
| Ricky Davey (Group Exec Dir) | Roberts Garages | LinkedIn InMail sent 6 June |
| Liam Harford (Head Franchise) | SandpiperCI/M&S | Sales Navigator message sent |
| Stephen Forrester (Chief Retail COO) | Co-op CI | Connection request sent |
| Nigel Broadhurst (MD) | Iceland UK HQ | Sales Navigator message sent |
| Emma Veitch (Senior Business Advisor) | Jersey Business | Call completed 11 June — startup checklist received, follow-up TBC |

---

## Competition — June Price Hunt
- Runs 1–30 June 2026, auto-expires midnight 30 June
- Prizes: 🥇£15 · 🥈£10 · 🥉£5 gift vouchers — winner's choice of store
- Winner announced 1 July 12:00
- Entries via form OR email receipt to hello@jerseybasket.je
- **Rules: only NEW grocery/food items not already in app count toward score**

### Current Leaderboard
| Pos | Name | Store | Count | Date |
|---|---|---|---|---|
| 🥇 | Kate | Waitrose | 27 | 11 Jun |
| 🥈 | Leticia | CI Co-op | 16 | 11 Jun |
| 🥈 | Carmen1971 | CI Co-op | 16 | 11 Jun |
| 4th | Nicole1 | Waitrose | 12 | 11 Jun |
| 5th | Sharon | Morrisons | 9 | 07 Jun |

**Note: Carmen1971 is Eamonn's wife — cannot win the competition**

---

## prices.je Category Update — COMPLETED ✅ (10 June 2026)
All 15 categories updated with real prices.je data.

---

## Alliance — Future 6th Store
- Confirmed separate Jersey supermarket chain
- **Decision made to add Alliance as a 6th store** — dedicated future session
- Requires updating ALL sp() calls from 5 diffs to 6 diffs
- Alliance prices already captured — ready to populate
- MD Andrew Bagot already in advertiser pipeline

---

## Jersey Business — Action Items
Following Emma Veitch call 11 June 2026:
- **Business licence** — legal requirement to trade, priority action
- **Register as self-employed** — Revenue Jersey
- **Data protection registration** — Office of the Information Commissioner
- **Business plan** — in progress (JerseyBasket-Business-Plan.md)

---

## Key People
- **Laura** — Eamonn's wife, shops and provides receipts, competes as Carmen1971
- **Kate** — neighbour, Waitrose receipts, currently leading competition
- **Leticia Sousa** — leticiaraquel.ls@gmail.com — competition entrant
- **Sharon Dewing** — sharonworkpc@hotmail.com — competition entrant
- **Nicole Hough** — 07700364456 — competition entrant, Waitrose

---

## Contacts
- **Eamonn:** hello@jerseybasket.je | 07797 721247
- **GitHub:** Predator1960/JerseyBasket
- **Vercel project:** jerseybasket

---

## Recent Git History
```
v66 full update 549 products light mode survey prizes
v66 Nicole1 Waitrose receipt 12 new products 549 products
v66 survey added to welcome modal
v66 fix duplicate IDs fix single store pricing
v66 Kate Waitrose receipt 10 new products 536 products
v66 Ernie's logo fixed
```

---

## Next Session Priorities
1. Finish business plan (costs figures needed from Eamonn)
2. Add Alliance as 6th store (dedicated session)
3. Full proper light mode (dedicated session)
4. Fix garlic search returning unrelated items
5. Business licence / self-employed registration / data protection
6. Chase Matt Maughan re Ernie's Platinum package
7. Update leaderboard as new receipts come in
