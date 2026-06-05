# JerseyBasket.je — Project Brief
*Updated: 5 June 2026*

---

## Project Overview
JerseyBasket.je is a Jersey grocery price comparison app. Users pick a basket of products and instantly see which supermarket is cheapest. Built in React, deployed via Vercel, ~930+ organic users in roughly 2 weeks.

---

## Key Details

| Item | Value |
|------|-------|
| Owner | Eamonn O'Shea |
| Email | hello@jerseybasket.je |
| Phone | 07797 721247 |
| Repo | https://github.com/Predator1960/JerseyBasket |
| Local path | C:\Users\eamon_qw9m8iy\OneDrive\Desktop\jerseybasket\ |
| Backup folder | jerseybasket-backup\ on Desktop |
| Live URL | jerseybasket.je (Vercel auto-deploy) |
| Current version | v63 |

---

## Tech Stack
- React (Create React App)
- Vercel (Framework Preset: Create React App — critical, not "Other")
- Git → GitHub → Vercel auto-deploy (~25–30s build)

---

## Critical Workflow Rules

1. NEVER use PowerShell to write App.jsx — corrupts emoji (BOM encoding). Always use a Python install script.
2. Deploy method:
   python "C:\Users\eamon_qw9m8iy\OneDrive\Desktop\jerseybasket\install_vXX.py"
   cd C:\Users\eamon_qw9m8iy\OneDrive\Desktop\jerseybasket
   git add . && git commit -m "message" && git push
3. If Vercel builds in <20s → something is wrong (cached/pre-built folder).
4. Never commit: .vercel/output/, build/, node_modules/, install_*.py, Promotional Video Guide folder.
5. Pause OneDrive before pushing.
6. Vercel treats ESLint warnings as errors (CI=true). Zero warnings required.

---

## App State (v63 — Current)

### Products & Stores
- 453 products, 15 categories, 5 stores
- Stores: Co-op #16a34a, Morrisons #eab308, M&S #94a3b8, Waitrose #0d9488, Iceland #dc2626

### Key Constants
- MAINTENANCE = false
- COMP_ACTIVE = true (June Price Hunt, closes 30 June 2026)

### Features Live
- Glossy UI (hexToRgb Chip component, gradient buttons)
- Sort by Category with alphabetical group headers + product count
- Gold pulse animation on welcome screen
- 930+ user count
- AdBanner: 6 slides (ids 0–5), BOUNCE scrolling (right→left→right, not loop)
- June Price Hunt Competition banner

---

## AdBanner Slides

| ID | Type | Notes |
|----|------|-------|
| 0–4 | "Advertise Here" placeholders | Various colour schemes |
| 5 | Ernie's.je ADVERTISER | Yellow bg #ffee00, green text #166534, base64 logo, wrapped sub text |

### Ernie's Slide (id 5)
- bg: #ffee00, headline highlight: #166534
- Sub: "Jersey's leading supplier of Tools, Agricultural & Automotive parts & accessories"
- sub.wrap: true → renders over 2 lines, maxWidth 280px
- Link: https://www.ernies.je
- Status: demonstration banner (not yet paying)

---

## Advertiser Packages
- Bronze £99 / Silver £249 / Gold £499 / Platinum £999 per month

### Pipeline
- Jason Acott (Jasons Valeting) — first advertiser, first month free
- Ernie's.je — demo banner live, not paying yet
- Bauformat Jersey — approached about Silver
- David McGrath — Co-op CMO
- Sarah Carlucci — Morrisons, LinkedIn connected
- Alliance Stores — call pending

---

## Pending
- Roberts Garage as future store (prices captured 30 May 2026)
- GuernseyBasket.gg — build when JerseyBasket stable
- Competition winner (after 30 June)
- Convert Ernie's to paying advertiser

---

## Recent Git
- 2a2fc7c  v63 fix duplicate logo and Ernies slide + bounce scroll
- a762063  v63 Ernies wrapped sub text, remove promo folder
- ac2e089  v62 update user count to 930+
